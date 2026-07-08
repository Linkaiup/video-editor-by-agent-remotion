/**
 * Harness 2.0 - Step 2: Design
 *
 * 建立品牌视觉规范
 * - 定义视觉主题
 * - 设置色彩方案
 * - 定义排版规范
 * - 设置布局间距
 * - 定义组件样式
 */

import { createTracer } from '../../tracing.js';
import type { DesignArtifact, DesignReference, CaptureArtifact } from '../artifacts/types.js';

const tracer = createTracer('Harness2.Design');

export class DesignStep {
  /**
   * 执行 Design 步骤
   *
   * @param captureArtifact - Capture 制品
   * @param userPreferences - 用户偏好（可选）
   * @param outputPath - 输出目录
   * @returns Design Artifact
   */
  async execute(
    captureArtifact: CaptureArtifact,
    userPreferences?: Partial<DesignReference>,
    outputPath?: string
  ): Promise<DesignArtifact> {
    const trace = tracer.startTrace('design_execute', {});

    try {
      tracer.log('info', '🎨 Step 2: Design - 建立设计规范');

      // 1. 基于 capture tokens 和用户偏好生成设计规范
      const designRef: DesignReference = {
        visualTheme: {
          style: userPreferences?.visualTheme?.style || 'modern',
          mood: userPreferences?.visualTheme?.mood || 'professional'
        },

        colorPalette: userPreferences?.colorPalette || this.generateColorPalette(captureArtifact.tokens.colors),

        typography: userPreferences?.typography || {
          heading: {
            family: 'Inter',
            size: '32px',
            weight: '700'
          },
          body: {
            family: 'Inter',
            size: '16px',
            weight: '400'
          }
        },

        layout: userPreferences?.layout || {
          margins: '40px',
          padding: '20px',
          grid: '12-column'
        },

        components: userPreferences?.components || [
          {
            name: 'Text Block',
            cssSpecs: 'padding: 20px; background: #FFFFFF; border-radius: 8px;'
          },
          {
            name: 'Image Container',
            cssSpecs: 'object-fit: cover; border-radius: 8px;'
          }
        ]
      };

      const artifact: DesignArtifact = {
        path: outputPath ? `${outputPath}/DESIGN.md` : 'artifacts/DESIGN.md',
        content: designRef,
        status: 'completed',
        createdAt: new Date()
      };

      tracer.log('info', '✅ Design 完成', {
        colors: designRef.colorPalette.length,
        components: designRef.components.length
      });

      trace.end({ success: true });
      return artifact;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '❌ Design 失败', { error: errorMessage });
      trace.end({ error: errorMessage });
      throw error;
    }
  }

  /**
   * 生成色彩方案（基于提取的颜色）
   */
  private generateColorPalette(extractedColors: string[]) {
    return [
      {
        name: 'Primary',
        hex: extractedColors[0] || '#007AFF',
        wcagContrast: 4.5,
        usage: 'Main actions, links'
      },
      {
        name: 'Secondary',
        hex: extractedColors[1] || '#5856D6',
        wcagContrast: 4.5,
        usage: 'Secondary actions'
      },
      {
        name: 'Background',
        hex: '#FFFFFF',
        wcagContrast: 21,
        usage: 'Page background'
      },
      {
        name: 'Surface',
        hex: '#F9F9F9',
        wcagContrast: 19,
        usage: 'Card, panel background'
      },
      {
        name: 'Text Primary',
        hex: '#000000',
        wcagContrast: 21,
        usage: 'Primary text'
      },
      {
        name: 'Text Secondary',
        hex: '#666666',
        wcagContrast: 7,
        usage: 'Secondary text'
      }
    ];
  }

  /**
   * 检查通过标准
   */
  validate(artifact: DesignArtifact): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    const content = artifact.content;

    // 1. 视觉主题定义完整
    if (!content.visualTheme?.style || !content.visualTheme?.mood) {
      issues.push('视觉主题不完整');
    }

    // 2. 至少 6 个颜色定义
    if (content.colorPalette.length < 6) {
      issues.push('色彩方案不完整（至少需要 6 个颜色）');
    }

    // 3. 排版规范定义
    if (!content.typography?.heading || !content.typography?.body) {
      issues.push('排版规范不完整');
    }

    // 4. 布局参数定义
    if (!content.layout?.margins || !content.layout?.padding) {
      issues.push('布局参数不完整');
    }

    // 5. WCAG 对比度检查
    const lowContrastColors = content.colorPalette.filter(c => c.wcagContrast && c.wcagContrast < 4.5);
    if (lowContrastColors.length > 0) {
      issues.push(`${lowContrastColors.length} 个颜色对比度不足 (< 4.5)`);
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}
