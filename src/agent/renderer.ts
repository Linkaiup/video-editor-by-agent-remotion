/**
 * 渲染模块 - 将组合渲染为视频文件
 *
 * 本模块负责：
 * 1. 注册 Remotion 组合
 * 2. 使用 @remotion/renderer 渲染视频
 * 3. 管理渲染进度和状态
 * 4. 输出 MP4 视频文件
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createTracer } from './tracing.js';
import { CompositionSpec } from './types.js';

const tracer = createTracer('Renderer');

/**
 * 渲染选项接口
 */
export interface RenderOptions {
  outputPath?: string;           // 输出路径（默认：./output）
  outputFilename?: string;        // 输出文件名（默认：自动生成）
  codec?: 'h264' | 'h265';       // 视频编码（默认：h264）
  crf?: number;                   // 视频质量（默认：18，范围 0-51，越小质量越高）
  onProgress?: (progress: number) => void; // 进度回调
}

/**
 * 渲染结果接口
 */
export interface RenderResult {
  outputPath: string;             // 输出文件路径
  durationInSeconds: number;      // 视频时长（秒）
  sizeInBytes: number;            // 文件大小（字节）
  renderTime: number;             // 渲染耗时（毫秒）
}

/**
 * 渲染视频
 *
 * 将生成的组合代码渲染为 MP4 视频文件
 *
 * @param compositionId - 组合 ID
 * @param componentPath - 组件文件路径
 * @param spec - 组合规格
 * @param options - 渲染选项
 * @returns 渲染结果
 *
 * @example
 * const result = await renderVideo('comp-123', './src/compositions/comp-123.tsx', spec);
 * console.log(`视频已保存到：${result.outputPath}`);
 */
export async function renderVideo(
  compositionId: string,
  componentPath: string,
  spec: CompositionSpec,
  options: RenderOptions = {}
): Promise<RenderResult> {
  const trace = tracer.startTrace('render_video', { compositionId });
  const startTime = Date.now();

  try {
    tracer.log('info', '开始渲染视频', { compositionId, componentPath });

    // 1. 确保输出目录存在
    const outputDir = options.outputPath || './output';
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // 2. 生成输出文件名
    const outputFilename = options.outputFilename || `${compositionId}.mp4`;
    const outputPath = join(outputDir, outputFilename);

    tracer.log('info', '准备打包组合');

    // 3. 使用项目的 Root.tsx 作为入口点（包含 registerRoot）
    const entryPoint = join(process.cwd(), 'src/Root.tsx');

    // 4. 打包组合（Webpack 打包 React 代码）
    const bundleLocation = await bundle({
      entryPoint,
      // 配置 public 目录，让 Remotion 可以访问静态资源
      publicDir: join(process.cwd(), 'public'),
      webpackOverride: (config) => config,
    });

    tracer.log('info', '打包完成，开始渲染', { bundleLocation });

    // 5. 选择组合
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {},
    });

    tracer.log('info', '组合已选择', {
      width: composition.width,
      height: composition.height,
      fps: composition.fps,
      durationInFrames: composition.durationInFrames,
    });

    // 6. 渲染视频
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: options.codec || 'h264',
      outputLocation: outputPath,
      inputProps: {},
      crf: options.crf || 18,
      onProgress: ({ progress }) => {
        const percentage = Math.round(progress * 100);
        tracer.log('info', `渲染进度：${percentage}%`);
        options.onProgress?.(progress);
      },
    });

    const renderTime = Date.now() - startTime;

    // 7. 获取文件信息（使用 ES 模块导入）
    const { statSync } = await import('fs');
    const stats = statSync(outputPath);
    const result: RenderResult = {
      outputPath,
      durationInSeconds: composition.durationInFrames / composition.fps,
      sizeInBytes: stats.size,
      renderTime,
    };

    tracer.log('info', '渲染完成', result);
    trace.end({ result });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    tracer.log('error', '渲染失败', { error: errorMessage });
    trace.end({ error: errorMessage });
    throw error;
  }
}

/**
 * 格式化文件大小
 *
 * @param bytes - 字节数
 * @returns 格式化的字符串
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 格式化渲染时间
 *
 * @param milliseconds - 毫秒数
 * @returns 格式化的字符串
 */
export function formatRenderTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes} 分 ${remainingSeconds} 秒`;
  } else {
    return `${seconds} 秒`;
  }
}
