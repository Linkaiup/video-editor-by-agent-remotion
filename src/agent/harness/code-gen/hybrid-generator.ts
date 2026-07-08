/**
 * 混合模式代码生成器
 *
 * 方案 A：智能决策，LLM 优先，模板降级
 * - 简单需求 → 模板生成（快速、确定性）
 * - 复杂需求 → LLM 生成 DSL → 编译为代码
 * - LLM 失败 → 自动降级为模板
 */

import { createTracer } from '../../tracing.js';
import { LLMCodeGenerator } from './llm-generator.js';
import { DSLCompiler } from './dsl-compiler.js';
import type { VideoSpec } from './dsl-types.js';
import type { Beat } from '../artifacts/types.js';

const tracer = createTracer('Harness2.HybridCodeGen');

/**
 * 代码生成策略
 */
export type CodeGenStrategy = 'template' | 'llm';

/**
 * 代码生成结果
 */
export interface CodeGenResult {
  code: string;
  strategy: CodeGenStrategy;
  complexity: 'simple' | 'medium' | 'complex';
  success: boolean;
  fallback?: boolean;  // 是否使用了降级策略
  error?: string;
}

/**
 * 混合模式代码生成器
 */
export class HybridCodeGenerator {
  private llmGenerator: LLMCodeGenerator;
  private dslCompiler: DSLCompiler;

  constructor() {
    this.llmGenerator = new LLMCodeGenerator();
    this.dslCompiler = new DSLCompiler();
  }

  /**
   * 生成代码（混合模式）
   */
  async generate(
    beat: Beat,
    timing: any,
    design: any,
    fps: number,
    componentName: string
  ): Promise<CodeGenResult> {
    const trace = tracer.startTrace('hybrid_generate', { beatId: beat.id });

    try {
      // 1. 决策：使用哪种策略？
      const strategy = this.decideStrategy(beat);
      tracer.log('info', `📊 代码生成策略: ${strategy}`, { beatId: beat.id });

      // 2. 尝试使用选定的策略
      if (strategy === 'llm') {
        // 尝试 LLM 生成，最多重试 2 次
        const maxRetries = 2;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            tracer.log('info', `🤖 LLM 生成尝试 ${attempt}/${maxRetries}`, { beatId: beat.id });

            const result = await this.generateWithLLM(beat, timing, design, fps, componentName);

            if (attempt > 1) {
              tracer.log('info', `✅ LLM 生成在第 ${attempt} 次尝试成功`, { beatId: beat.id });
            }

            trace.end({ success: true, strategy: 'llm', attempts: attempt });
            return result;

          } catch (error) {
            lastError = error as Error;
            const errorMessage = error instanceof Error ? error.message : '未知错误';

            if (attempt < maxRetries) {
              // 还有重试机会，记录错误并继续
              tracer.log('warn', `⚠️  LLM 生成第 ${attempt} 次失败，准备重试`, {
                beatId: beat.id,
                error: errorMessage,
                nextAttempt: attempt + 1,
              });

              // 短暂延迟后重试
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              // 已达最大重试次数
              tracer.log('error', `❌ LLM 生成失败，已重试 ${maxRetries} 次`, {
                beatId: beat.id,
                error: errorMessage,
              });
            }
          }
        }

        // 所有 LLM 尝试都失败，降级到模板
        tracer.log('warn', '⚠️  LLM 生成全部失败，降级到模板策略', {
          beatId: beat.id,
          error: lastError?.message || '未知错误',
          attempts: maxRetries,
        });

        const fallbackResult = this.generateWithTemplate(beat, timing, design);
        fallbackResult.fallback = true;
        trace.end({ success: true, strategy: 'template', fallback: true, llmAttempts: maxRetries });
        return fallbackResult;

      } else {
        // 直接使用模板
        const result = this.generateWithTemplate(beat, timing, design);
        trace.end({ success: true, strategy: 'template' });
        return result;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '❌ 代码生成失败', { error: errorMessage });
      trace.end({ error: errorMessage });
      throw error;
    }
  }

  /**
   * 决策使用哪种策略
   */
  private decideStrategy(beat: Beat): CodeGenStrategy {
    let score = 0;

    // 1. 检查动画技巧复杂度
    const complexTechniques = [
      'flip', '3d', 'perspective', 'particle', 'confetti',
      'bounce', 'spring', 'elastic', 'blur', 'color_shift'
    ];

    // 确保 techniques 是数组
    const techniques = Array.isArray(beat.techniques) ? beat.techniques : [];

    for (const technique of techniques) {
      // 确保 technique 是字符串
      if (typeof technique === 'string') {
        const techLower = technique.toLowerCase();
        if (complexTechniques.some(ct => techLower.includes(ct))) {
          score += 3;
        }
      }
    }

    // 2. 动画技巧数量
    if (techniques.length > 2) {
      score += 2;
    }

    // 3. 素材数量
    const assets = Array.isArray(beat.assets) ? beat.assets : [];
    if (assets.length > 2) {
      score += 1;
    }

    // 4. 转场效果
    const transitions = Array.isArray(beat.transitions) ? beat.transitions : [];
    if (transitions.length > 0) {
      score += 1;
    }

    // 5. 特殊音效
    const sfx = Array.isArray(beat.sfx) ? beat.sfx : [];
    if (sfx.length > 0) {
      score += 1;
    }

    // 决策阈值
    if (score >= 5) {
      tracer.log('info', `复杂度评分: ${score} >= 5，使用 LLM 策略`);
      return 'llm';
    } else {
      tracer.log('info', `复杂度评分: ${score} < 5，使用模板策略`);
      return 'template';
    }
  }

  /**
   * 使用 LLM 生成代码
   */
  private async generateWithLLM(
    beat: Beat,
    timing: any,
    design: any,
    fps: number,
    componentName: string
  ): Promise<CodeGenResult> {
    tracer.log('info', '🤖 使用 LLM 生成代码');

    // 1. LLM 生成 VideoSpec DSL
    const videoSpec = await this.llmGenerator.generateVideoSpec(beat, timing, design, fps);

    // 2. 验证 VideoSpec
    const validation = this.llmGenerator.validateVideoSpec(videoSpec);
    if (!validation.valid) {
      throw new Error(`VideoSpec 验证失败: ${validation.errors.join(', ')}`);
    }

    // 3. 评估复杂度
    const complexity = this.llmGenerator.assessComplexity(videoSpec);
    tracer.log('info', `VideoSpec 复杂度: ${complexity}`);

    // 4. 编译为代码
    const code = this.dslCompiler.compile(videoSpec, componentName);

    // 5. 验证生成的代码
    const codeValidation = this.dslCompiler.validateGeneratedCode(code);
    if (!codeValidation.valid) {
      throw new Error(`生成的代码验证失败: ${codeValidation.errors.join(', ')}`);
    }

    return {
      code,
      strategy: 'llm',
      complexity,
      success: true,
    };
  }

  /**
   * 使用模板生成代码（旧逻辑）
   */
  private generateWithTemplate(
    beat: Beat,
    timing: any,
    design: any
  ): CodeGenResult {
    tracer.log('info', '📝 使用模板生成代码');

    const startFrame = timing.frames[0];
    const durationInFrames = timing.frames[1] - timing.frames[0];

    // 提取颜色
    const primaryColor = design.colorPalette.find((c: any) => c.name === 'Primary')?.hex || '#000000';
    const bgColor = design.colorPalette.find((c: any) => c.name === 'Background')?.hex || '#FFFFFF';

    // 从环境变量读取服务器端口，默认 3001
    const serverPort = process.env.PORT || '3001';

    const code = `import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';

/**
 * Beat: ${beat.name}
 * Duration: ${beat.endTime - beat.startTime}s
 * Mood: ${beat.mood}
 * Generated: Template Strategy
 */
export const ${this.toPascalCase(beat.id)}: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade in animation (first 30 frames)
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Scale animation
  const scale = interpolate(frame, [0, ${durationInFrames}], [0.95, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '${bgColor}',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          transform: \`scale(\${scale})\`,
          fontSize: '48px',
          fontWeight: 'bold',
          color: '${primaryColor}',
          textAlign: 'center',
          padding: '40px',
        }}
      >
        ${beat.narration || beat.name}
      </div>

      {/* Assets */}
      ${beat.assets.map((asset: string, idx: number) => `
      <img
        src="http://localhost:${serverPort}/${asset}"
        style={{
          position: 'absolute',
          width: '50%',
          height: 'auto',
          opacity: ${0.8 - idx * 0.2},
        }}
        alt="Asset ${idx + 1}"
      />`).join('\n')}
    </AbsoluteFill>
  );
};
`;

    return {
      code,
      strategy: 'template',
      complexity: 'simple',
      success: true,
    };
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}
