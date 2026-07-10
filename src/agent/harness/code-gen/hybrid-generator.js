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
import { ANIMATION_TEMPLATES } from './animation-templates.js';
const tracer = createTracer('Harness2.HybridCodeGen');
/**
 * 混合模式代码生成器
 */
export class HybridCodeGenerator {
    constructor() {
        this.llmGenerator = new LLMCodeGenerator();
        this.dslCompiler = new DSLCompiler();
    }
    /**
     * 生成代码（混合模式）
     */
    async generate(beat, timing, design, fps, componentName) {
        const trace = tracer.startTrace('hybrid_generate', { beatId: beat.id });
        try {
            // 1. 决策：使用哪种策略？
            const strategy = this.decideStrategy(beat);
            tracer.log('info', `📊 代码生成策略: ${strategy}`, { beatId: beat.id });
            // 2. 尝试使用选定的策略
            if (strategy === 'llm') {
                // 尝试 LLM 生成，最多重试 2 次
                const maxRetries = 2;
                let lastError = null;
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        tracer.log('info', `🤖 LLM 生成尝试 ${attempt}/${maxRetries}`, { beatId: beat.id });
                        const result = await this.generateWithLLM(beat, timing, design, fps, componentName);
                        if (attempt > 1) {
                            tracer.log('info', `✅ LLM 生成在第 ${attempt} 次尝试成功`, { beatId: beat.id });
                        }
                        trace.end({ success: true, strategy: 'llm', attempts: attempt });
                        return result;
                    }
                    catch (error) {
                        lastError = error;
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
                        }
                        else {
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
            }
            else {
                // 直接使用模板
                const result = this.generateWithTemplate(beat, timing, design);
                trace.end({ success: true, strategy: 'template' });
                return result;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            tracer.log('error', '❌ 代码生成失败', { error: errorMessage });
            trace.end({ error: errorMessage });
            throw error;
        }
    }
    /**
     * 决策使用哪种策略
     */
    decideStrategy(beat) {
        let score = 0;
        // 1. 检查动画技巧复杂度
        // 🆕 更新：rotate、slide、blur 已被模板支持，不再算复杂动画
        const complexTechniques = [
            'flip', '3d', 'perspective', 'particle', 'confetti',
            'bounce', 'spring', 'elastic', 'color_shift', 'grayscale'
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
        // 2. 动画技巧数量（提高阈值：从 2 改为 3）
        if (techniques.length > 3) {
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
        // 🆕 决策阈值（保持 5 分）
        // 现在模板支持更多动画，大部分场景会走模板路径
        if (score >= 5) {
            tracer.log('info', `复杂度评分: ${score} >= 5，使用 LLM 策略`);
            return 'llm';
        }
        else {
            tracer.log('info', `复杂度评分: ${score} < 5，使用模板策略`);
            return 'template';
        }
    }
    /**
     * 使用 LLM 生成代码
     */
    async generateWithLLM(beat, timing, design, fps, componentName) {
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
    generateWithTemplate(beat, timing, design) {
        tracer.log('info', '📝 使用模板生成代码');
        const startFrame = timing.frames[0];
        const durationInFrames = timing.frames[1] - timing.frames[0];
        // 提取颜色
        const primaryColor = design.colorPalette.find((c) => c.name === 'Primary')?.hex || '#000000';
        const bgColor = design.colorPalette.find((c) => c.name === 'Background')?.hex || '#FFFFFF';
        // 从环境变量读取服务器端口，默认 3001
        const serverPort = process.env.PORT || '3001';
        // 🆕 映射技巧名称到动画模板（支持多种动画别名）
        const techniqueMapping = {
            // 淡入淡出
            'fade': 'fade_in',
            'fade_in': 'fade_in',
            'fade_out': 'fade_out',
            'fadein': 'fade_in',
            'fadeout': 'fade_out',
            '淡入': 'fade_in',
            '淡出': 'fade_out',
            '淡入淡出': 'fade_in', // 如果只有一个词，先淡入
            // 缩放
            'zoom': 'zoom_in',
            'zoom_in': 'zoom_in',
            'zoom_out': 'zoom_out',
            'scale': 'zoom_in',
            'zoomin': 'zoom_in',
            'zoomout': 'zoom_out',
            '缩放': 'zoom_in',
            '放大': 'zoom_in',
            '缩小': 'zoom_out',
            // 旋转
            'rotate': 'rotate_cw',
            'rotate_cw': 'rotate_cw',
            'rotate_ccw': 'rotate_ccw',
            'rotate_360': 'rotate_360',
            'clockwise': 'rotate_cw',
            'clockwise_rotation': 'rotate_cw',
            'counterclockwise': 'rotate_ccw',
            'counterclockwise_rotation': 'rotate_ccw',
            '旋转': 'rotate_cw',
            '顺时针': 'rotate_cw',
            '顺时针旋转': 'rotate_cw',
            '逆时针': 'rotate_ccw',
            '逆时针旋转': 'rotate_ccw',
            // 滑动
            'slide': 'slide_right',
            'slide_left': 'slide_left',
            'slide_right': 'slide_right',
            'slide_up': 'slide_up',
            'slide_down': 'slide_down',
            'slideleft': 'slide_left',
            'slideright': 'slide_right',
            'slideup': 'slide_up',
            'slidedown': 'slide_down',
            '滑动': 'slide_right',
            '向左': 'slide_left',
            '向左滑动': 'slide_left',
            '向右': 'slide_right',
            '向右滑动': 'slide_right',
            '向上': 'slide_up',
            '向上滑动': 'slide_up',
            '向下': 'slide_down',
            '向下滑动': 'slide_down',
            // 模糊
            'blur': 'blur_in',
            'blur_in': 'blur_in',
            'blur_out': 'blur_out',
            'blurin': 'blur_in',
            'blurout': 'blur_out',
            '模糊': 'blur_in',
        };
        // 🆕 收集需要的动画和导入
        const animations = [];
        const imports = new Set(['useCurrentFrame', 'AbsoluteFill', 'Sequence']);
        // 默认添加 fade_in 和 zoom_in（如果没有指定其他动画）
        const techniques = beat.techniques && beat.techniques.length > 0
            ? beat.techniques
            : ['fade_in', 'zoom_in'];
        // 🎯 智能时序分配：将动画均匀分配到时间轴上
        // 如果有 N 个动画，将总时长分为 N 段，顺序执行
        const animationCount = techniques.length;
        const segmentDuration = Math.floor(durationInFrames / animationCount);
        techniques.forEach((technique, idx) => {
            const templateKey = techniqueMapping[technique.toLowerCase()];
            if (templateKey && ANIMATION_TEMPLATES[templateKey]) {
                const template = ANIMATION_TEMPLATES[templateKey];
                const varName = `anim${idx + 1}`;
                // 添加导入
                template.imports.forEach(imp => imports.add(imp));
                // 🎯 计算时间范围（分段执行，不重叠）
                const animStartFrame = idx * segmentDuration;
                const animEndFrame = idx === animationCount - 1
                    ? durationInFrames // 最后一个动画延续到结尾
                    : (idx + 1) * segmentDuration;
                // 生成动画代码
                const animConfig = {
                    type: templateKey,
                    startFrame: animStartFrame,
                    endFrame: animEndFrame,
                    params: this.getDefaultParams(templateKey),
                };
                const code = template.generateCode(animConfig, varName);
                // 🆕 解析动画应用到哪个 CSS 属性
                const { cssProperty, valueExpr } = this.parseAnimationStyle(templateKey, varName);
                animations.push({ varName, code, cssProperty, valueExpr });
            }
        });
        // 如果没有匹配的动画，使用默认的 fade + scale
        if (animations.length === 0) {
            imports.add('interpolate');
            animations.push({
                varName: 'opacity',
                code: `  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });`,
                cssProperty: 'opacity',
                valueExpr: 'opacity',
            }, {
                varName: 'scale',
                code: `  const scale = interpolate(frame, [0, ${durationInFrames}], [0.95, 1], { extrapolateRight: 'clamp' });`,
                cssProperty: 'transform',
                valueExpr: '`scale(${scale})`',
            });
        }
        // 生成导入语句
        const importStatement = `import React from 'react';\nimport { ${Array.from(imports).join(', ')} } from 'remotion';`;
        // 生成动画变量声明
        const animationCode = animations.map(a => a.code).join('\n\n');
        // 🆕 智能合并样式：相同属性的动画合并
        const styleMap = new Map();
        animations.forEach(a => {
            if (!styleMap.has(a.cssProperty)) {
                styleMap.set(a.cssProperty, []);
            }
            styleMap.get(a.cssProperty).push(a.valueExpr);
        });
        // 生成样式对象（处理多个 transform 的合并）
        const styleEntries = Array.from(styleMap.entries()).map(([prop, values]) => {
            if (prop === 'transform') {
                // 多个 transform 合并成一个字符串
                const transformParts = values.map(v => v.replace(/`/g, '')).join(' ');
                return `transform: \`${transformParts}\``;
            }
            else {
                // 其他属性取最后一个值
                return `${prop}: ${values[values.length - 1]}`;
            }
        }).join(',\n        ');
        const code = `${importStatement}

/**
 * Beat: ${beat.name}
 * Duration: ${beat.endTime - beat.startTime}s
 * Mood: ${beat.mood}
 * Techniques: ${techniques.join(', ')}
 * Generated: Template Strategy (Enhanced with Sequential Timing)
 */
export const ${this.toPascalCase(beat.id)}: React.FC = () => {
  const frame = useCurrentFrame();

${animationCode}

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '${bgColor}',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Assets with animations */}
      ${beat.assets.map((asset, idx) => `
      <img
        src="http://localhost:${serverPort}/${asset}"
        style={{
          position: 'absolute',
          width: '80%',
          height: 'auto',
          objectFit: 'contain',
          ${styleEntries},
        }}
        alt="Asset ${idx + 1}"
      />`).join('\n')}

      {/* Narration text (if any) */}
      ${beat.narration ? `
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          fontSize: '36px',
          fontWeight: 'bold',
          color: '${primaryColor}',
          textAlign: 'center',
          padding: '20px 40px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
        }}
      >
        ${beat.narration}
      </div>` : ''}
    </AbsoluteFill>
  );
};
`;
        tracer.log('info', `✅ 模板生成完成，使用动画：${techniques.join(', ')}`);
        return {
            code,
            strategy: 'template',
            complexity: 'simple',
            success: true,
        };
    }
    /**
     * 🆕 解析动画应用到哪个 CSS 属性
     */
    parseAnimationStyle(templateKey, varName) {
        // 根据动画类型，返回对应的 CSS 属性和值表达式
        const styleMap = {
            'fade_in': { cssProperty: 'opacity', valueExpr: varName },
            'fade_out': { cssProperty: 'opacity', valueExpr: varName },
            'zoom_in': { cssProperty: 'transform', valueExpr: `\`scale(\${${varName}})\`` },
            'zoom_out': { cssProperty: 'transform', valueExpr: `\`scale(\${${varName}})\`` },
            'rotate_cw': { cssProperty: 'transform', valueExpr: `\`rotate(\${${varName}}deg)\`` },
            'rotate_ccw': { cssProperty: 'transform', valueExpr: `\`rotate(\${${varName}}deg)\`` },
            'rotate_360': { cssProperty: 'transform', valueExpr: `\`rotate(\${${varName}}deg)\`` },
            'slide_left': { cssProperty: 'transform', valueExpr: `\`translateX(\${${varName}}%)\`` },
            'slide_right': { cssProperty: 'transform', valueExpr: `\`translateX(\${${varName}}%)\`` },
            'slide_up': { cssProperty: 'transform', valueExpr: `\`translateY(\${${varName}}%)\`` },
            'slide_down': { cssProperty: 'transform', valueExpr: `\`translateY(\${${varName}}%)\`` },
            'blur_in': { cssProperty: 'filter', valueExpr: `\`blur(\${${varName}}px)\`` },
            'blur_out': { cssProperty: 'filter', valueExpr: `\`blur(\${${varName}}px)\`` },
        };
        return styleMap[templateKey] || { cssProperty: 'opacity', valueExpr: varName };
    }
    /**
     * 🆕 获取动画的默认参数
     */
    getDefaultParams(templateKey) {
        const defaults = {
            'fade_in': { from: 0, to: 1 },
            'fade_out': { from: 1, to: 0 },
            'zoom_in': { scale: [0.95, 1] },
            'zoom_out': { scale: [1, 1.1] },
            'rotate_cw': { degrees: 90 },
            'rotate_ccw': { degrees: -90 },
            'rotate_360': { degrees: 360 },
            'slide_left': { distance: -100 },
            'slide_right': { distance: 100 },
            'slide_up': { distance: -100 },
            'slide_down': { distance: 100 },
            'blur_in': { blurAmount: 10 },
            'blur_out': { blurAmount: 10 },
        };
        return defaults[templateKey] || {};
    }
    /**
     * 转换为 PascalCase
     */
    toPascalCase(str) {
        return str
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }
}
