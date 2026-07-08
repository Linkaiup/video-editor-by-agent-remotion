/**
 * Harness 2.0 - Step 8: Render
 *
 * 视频渲染
 * - 使用 @remotion/renderer 渲染视频
 * - 监控渲染进度
 * - 生成 .mp4 文件
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createRequire } from 'module';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { createTracer } from '../../tracing.js';
import type {
  RenderArtifact,
  BuildArtifact,
  TimelineArtifact
} from '../artifacts/types.js';

const tracer = createTracer('Harness2.Render');
const require = createRequire(import.meta.url);

export class RenderStep {
  /**
   * 执行 Render 步骤
   *
   * @param buildArtifact - Build 制品
   * @param timelineArtifact - Timeline 制品
   * @param outputPath - 输出目录
   * @returns Render Artifact
   */
  async execute(
    buildArtifact: BuildArtifact,
    timelineArtifact: TimelineArtifact,
    outputPath: string
  ): Promise<RenderArtifact> {
    const trace = tracer.startTrace('render_execute', {});

    try {
      tracer.log('info', '🎬 Step 8: Render - 开始视频渲染');

      const timeline = timelineArtifact.content;
      const compositionId = 'GeneratedVideo';
      const outputFile = join(outputPath, 'output', `video-${Date.now()}.mp4`);

      // 确保输出目录存在
      const { mkdirSync } = await import('fs');
      const outputDir = join(outputPath, 'output');
      mkdirSync(outputDir, { recursive: true });

      // 1. 准备 Remotion 项目入口
      const entryPoint = await this.prepareEntryPoint(buildArtifact, timelineArtifact, outputPath);

      tracer.log('info', '📦 打包 Remotion 项目');

      // 2. Bundle Remotion 项目
      const bundleLocation = await bundle({
        entryPoint,
        webpackOverride: (config) => config,
      });

      tracer.log('info', '✅ 打包完成', { bundleLocation });

      // 3. 获取 composition 信息
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps: {},
      });

      tracer.log('info', '🎯 选择 Composition', {
        id: composition.id,
        width: composition.width,
        height: composition.height,
        fps: composition.fps,
        durationInFrames: composition.durationInFrames,
      });

      // 4. 渲染视频
      tracer.log('info', '🎬 开始渲染视频');

      let lastProgress = 0;
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputFile,
        inputProps: {},
        onProgress: ({ progress }) => {
          const percent = Math.round(progress * 100);
          if (percent - lastProgress >= 10) {
            tracer.log('info', `渲染进度: ${percent}%`);
            lastProgress = percent;
          }
        },
      });

      tracer.log('info', '✅ 视频渲染完成', { outputFile });

      const artifact: RenderArtifact = {
        path: outputFile,
        videoPath: outputFile,
        duration: timeline.beats.reduce((sum, b) => sum + (b.frames[1] - b.frames[0]), 0) / timeline.fps,
        fps: timeline.fps,
        resolution: {
          width: composition.width,
          height: composition.height,
        },
        fileSize: 0, // 需要读取文件大小
        status: 'completed',
        createdAt: new Date(),
      };

      trace.end({ success: true, outputFile });
      return artifact;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '❌ 渲染失败', { error: errorMessage });
      trace.end({ error: errorMessage });
      throw error;
    }
  }

  /**
   * 准备 Remotion 入口文件
   */
  private async prepareEntryPoint(
    buildArtifact: BuildArtifact,
    timelineArtifact: TimelineArtifact,
    outputPath: string
  ): Promise<string> {
    const entryFile = join(outputPath, 'src', 'index.tsx');

    // 生成主入口文件
    const code = this.generateEntryCode(buildArtifact, timelineArtifact);

    await writeFile(entryFile, code, 'utf-8');

    tracer.log('info', '✅ 入口文件已生成', { entryFile });

    return entryFile;
  }

  /**
   * 生成入口代码
   */
  private generateEntryCode(buildArtifact: BuildArtifact, timelineArtifact: TimelineArtifact): string {
    const compositions = buildArtifact.compositions;
    const timeline = timelineArtifact.content;

    // 导入所有 beat 组件
    const imports = compositions
      .map((comp, index) => {
        const componentName = `Beat${index + 1}`;
        const relativePath = `./compositions/${comp.beatId}`;
        return `import { ${componentName} } from '${relativePath}';`;
      })
      .join('\n');

    // 生成组合序列
    const beatSequences = compositions
      .map((comp, index) => {
        const componentName = `Beat${index + 1}`;
        const beatTiming = timeline.beats[index];
        const startFrame = beatTiming.frames[0];
        const durationInFrames = beatTiming.frames[1] - beatTiming.frames[0];

        return `      <Sequence from={${startFrame}} durationInFrames={${durationInFrames}}>
        <${componentName} />
      </Sequence>`;
      })
      .join('\n');

    const totalFrames = timeline.beats[timeline.beats.length - 1].frames[1];

    return `import React from 'react';
import { Composition, Sequence, registerRoot } from 'remotion';
${imports}

// 主视频组件
const GeneratedVideo: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: '#fff' }}>
${beatSequences}
    </div>
  );
};

// Remotion Root
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GeneratedVideo"
        component={GeneratedVideo}
        durationInFrames={${totalFrames}}
        fps={${timeline.fps}}
        width={1920}
        height={1080}
      />
    </>
  );
};

// 注册根组件
registerRoot(RemotionRoot);
`;
  }
}
