/**
 * Harness 2.0 - Step 1: Capture
 *
 * 素材捕获与预处理
 * - 接收用户上传的素材
 * - 验证格式
 * - 提取元数据
 * - 生成缩略图
 * - 转换为标准格式
 */

import { copyFile, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { createTracer } from '../../tracing.js';
import type { CaptureArtifact, AssetMetadata, DesignTokens } from '../artifacts/types.js';

const tracer = createTracer('Harness2.Capture');

export class CaptureStep {
  /**
   * 执行 Capture 步骤
   *
   * @param assets - 用户提供的素材路径列表
   * @param outputPath - 输出目录路径
   * @returns Capture Artifact
   */
  async execute(assets: string[], outputPath: string): Promise<CaptureArtifact> {
    const trace = tracer.startTrace('capture_execute', { assetCount: assets.length });

    try {
      tracer.log('info', '🎨 Step 1: Capture - 开始素材捕获');

      // 如果没有提供素材，使用默认占位符
      if (!assets || assets.length === 0) {
        tracer.log('info', '⚠️  未提供素材，使用默认占位符');

        const placeholderTokens: DesignTokens = {
          colors: ['#3B82F6', '#10B981', '#F3F4F6', '#1F2937'],
          fonts: ['Arial', 'Helvetica']
        };

        const artifact: CaptureArtifact = {
          path: join(outputPath, 'artifacts', 'capture'),
          metadata: [],
          tokens: placeholderTokens,
          thumbnails: {},
          status: 'completed',
          createdAt: new Date()
        };

        tracer.log('info', '✅ Capture 完成（使用占位符）');
        trace.end({ success: true, assetCount: 0 });
        return artifact;
      }

      const metadata: AssetMetadata[] = [];

      // 确保输出目录存在
      const { mkdirSync } = await import('fs');
      const assetsDir = join(outputPath, 'artifacts', 'capture', 'assets');
      mkdirSync(assetsDir, { recursive: true });

      tracer.log('info', '📁 创建输出目录', { assetsDir });

      // 处理每个素材
      for (const assetPath of assets) {
        tracer.log('info', '处理素材', { path: assetPath });

        // 1. 验证格式
        const assetMeta = await this.validateAndExtractMetadata(assetPath);

        // 2. 复制到标准位置
        const targetPath = join(assetsDir, basename(assetPath));
        await copyFile(assetPath, targetPath);

        // ✅ 保存相对于 server 目录的路径，用于 HTTP 访问
        // targetPath: projects/session-xxx/artifacts/capture/assets/image.jpg
        // 这样可以通过 http://localhost:3001/projects/session-xxx/... 访问
        assetMeta.path = targetPath;

        metadata.push(assetMeta);
        tracer.log('info', '素材处理完成', { id: assetMeta.id, relativePath: assetMeta.path });
      }

      // 3. 提取设计 tokens（颜色、字体等）
      const tokens = await this.extractDesignTokens(metadata);

      // 4. 生成缩略图（简化版本）
      const thumbnails: Record<string, string> = {};

      const artifact: CaptureArtifact = {
        path: join(outputPath, 'artifacts', 'capture'),
        metadata,
        tokens,
        thumbnails,
        status: 'completed',
        createdAt: new Date()
      };

      tracer.log('info', '✅ Capture 完成', {
        assetCount: metadata.length,
        colors: tokens.colors.length
      });

      trace.end({ success: true, assetCount: metadata.length });
      return artifact;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '❌ Capture 失败', { error: errorMessage });
      trace.end({ error: errorMessage });
      throw error;
    }
  }

  /**
   * 验证格式并提取元数据
   */
  private async validateAndExtractMetadata(assetPath: string): Promise<AssetMetadata> {
    const stats = await stat(assetPath);
    const ext = extname(assetPath).toLowerCase();

    // 判断类型
    let type: 'image' | 'video' | 'audio';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      type = 'image';
    } else if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) {
      type = 'video';
    } else if (['.mp3', '.wav', '.aac'].includes(ext)) {
      type = 'audio';
    } else {
      throw new Error(`不支持的文件格式: ${ext}`);
    }

    const metadata: AssetMetadata = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalName: basename(assetPath),
      type,
      path: assetPath,
      size: stats.size,
      format: ext.slice(1)
    };

    // TODO: 提取图片/视频的尺寸和时长
    // 可以使用 sharp (图片) 或 ffprobe (视频)

    return metadata;
  }

  /**
   * 提取设计 tokens
   */
  private async extractDesignTokens(metadata: AssetMetadata[]): Promise<DesignTokens> {
    // 简化版本：返回默认 tokens
    // 实际应该分析图片提取主色调

    const tokens: DesignTokens = {
      colors: [
        '#000000', // 黑
        '#FFFFFF', // 白
        '#333333', // 深灰
        '#666666', // 中灰
        '#999999'  // 浅灰
      ],
      fonts: ['Inter', 'Sans-serif'],
      spacing: [4, 8, 12, 16, 20, 24, 32]
    };

    return tokens;
  }

  /**
   * 检查通过标准
   */
  validate(artifact: CaptureArtifact): { passed: boolean; issues: string[] } {
    const issues: string[] = [];

    // 1. 允许无素材（使用占位符）
    // 不再要求至少有一个素材

    // 2. 如果有素材，检查素材格式验证
    for (const meta of artifact.metadata) {
      if (!meta.path || !meta.type) {
        issues.push(`素材 ${meta.id} 元数据不完整`);
      }
    }

    // 3. tokens 提取成功
    if (artifact.tokens.colors.length === 0) {
      issues.push('未提取到颜色 tokens');
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}
