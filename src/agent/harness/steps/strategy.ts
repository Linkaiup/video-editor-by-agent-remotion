/**
 * Harness 2.0 - Step 3: Strategy
 *
 * 锁定视频策略与核心信息
 * - 确定视频类型
 * - 设置格式参数
 * - 定义核心信息
 * - 设计叙事弧线
 */

import { createTracer } from '../../tracing.js';
import type { StrategyArtifact, VideoStrategy } from '../artifacts/types.js';
import type { UserIntent } from '../../types.js';

const tracer = createTracer('Harness2.Strategy');

export class StrategyStep {
  /**
   * 执行 Strategy 步骤
   *
   * @param intent - 用户意图
   * @param outputPath - 输出目录
   * @returns Strategy Artifact
   */
  async execute(intent: UserIntent, outputPath?: string): Promise<StrategyArtifact> {
    const trace = tracer.startTrace('strategy_execute', {});

    try {
      tracer.log('info', '📋 Step 3: Strategy - 锁定视频策略');

      // 1. 从用户意图推断视频策略
      const strategy: VideoStrategy = {
        videoType: this.inferVideoType(intent),

        format: {
          duration: intent.entities?.duration || 10,
          aspectRatio: '16:9',
          fps: 30
        },

        coreMessage: intent.description || '展示产品特点',

        narrativeArc: {
          opening: this.generateOpening(intent),
          middle: this.generateMiddle(intent),
          closing: this.generateClosing(intent)
        },

        targetAudience: (intent.entities as any)?.audience,

        // 提取用户期望的特效和转场
        // 确保转换为字符串数组
        effects: this.extractEffects(intent.entities?.effects || []),
        transitions: this.extractEffects(intent.entities?.transitions || [])
      };

      const artifact: StrategyArtifact = {
        path: outputPath ? `${outputPath}/STRATEGY.md` : 'artifacts/STRATEGY.md',
        content: strategy,
        status: 'completed',
        createdAt: new Date()
      };

      tracer.log('info', '✅ Strategy 完成', {
        type: strategy.videoType,
        duration: strategy.format.duration
      });

      trace.end({ success: true });
      return artifact;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '❌ Strategy 失败', { error: errorMessage });
      trace.end({ error: errorMessage });
      throw error;
    }
  }

  /**
   * 推断视频类型
   */
  private inferVideoType(intent: UserIntent): string {
    const desc = intent.description.toLowerCase();

    if (desc.includes('教程') || desc.includes('tutorial')) return 'tutorial';
    if (desc.includes('介绍') || desc.includes('intro')) return 'introduction';
    if (desc.includes('演示') || desc.includes('demo')) return 'demo';
    if (desc.includes('广告') || desc.includes('promo')) return 'promo';

    return 'explainer';
  }

  /**
   * 生成开场
   */
  private generateOpening(intent: UserIntent): string {
    return '用引人注目的视觉或问题吸引观众注意力';
  }

  /**
   * 生成主体
   */
  private generateMiddle(intent: UserIntent): string {
    return '展示核心内容和关键信息点';
  }

  /**
   * 生成结尾
   */
  private generateClosing(intent: UserIntent): string {
    return '总结要点并引导下一步行动';
  }

  /**
   * 提取 effects，确保返回字符串数组
   */
  private extractEffects(effects: any): string[] {
    if (!effects) {
      return [];
    }

    // 如果已经是数组
    if (Array.isArray(effects)) {
      // 过滤并转换为字符串
      return effects
        .filter(e => e != null) // 过滤 null 和 undefined
        .map(e => {
          // 如果是对象，尝试提取 name 或 type 字段
          if (typeof e === 'object') {
            return e.name || e.type || e.id || String(e);
          }
          // 如果是字符串，直接返回
          if (typeof e === 'string') {
            return e;
          }
          // 其他类型转换为字符串
          return String(e);
        })
        .filter(e => e && e.length > 0); // 过滤空字符串
    }

    // 如果是单个值，转换为数组
    if (typeof effects === 'string') {
      return [effects];
    }

    // 如果是对象，尝试提取值
    if (typeof effects === 'object') {
      const name = effects.name || effects.type || effects.id;
      if (name && typeof name === 'string') {
        return [name];
      }
    }

    return [];
  }

  /**
   * 检查通过标准
   */
  validate(artifact: StrategyArtifact): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    const content = artifact.content;

    // 1. 视频类型确定
    if (!content.videoType) {
      issues.push('未定义视频类型');
    }

    // 2. 格式参数完整
    if (!content.format.duration || content.format.duration <= 0) {
      issues.push('视频时长无效');
    }
    if (!content.format.aspectRatio) {
      issues.push('未定义宽高比');
    }
    if (!content.format.fps || content.format.fps < 24) {
      issues.push('帧率无效');
    }

    // 3. 核心信息明确
    if (!content.coreMessage || content.coreMessage.trim().length === 0) {
      issues.push('核心信息为空');
    }

    // 4. 叙事弧线完整
    if (!content.narrativeArc.opening || !content.narrativeArc.middle || !content.narrativeArc.closing) {
      issues.push('叙事弧线不完整');
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}
