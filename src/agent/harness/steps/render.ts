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

      // 1. 使用 Build 步骤生成的入口文件
      const entryPoint = buildArtifact.entryPoint;
      tracer.log('info', '使用 Build 步骤的入口文件', { entryPoint });

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
}
