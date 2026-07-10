/**
 * LLM 代码生成器 - 基于 DSL
 *
 * 使用 LLM 生成 VideoSpec DSL，然后映射到预制动画模板
 */
import OpenAI from 'openai';
import { AGENT_CONFIG } from '../../config.js';
import { createTracer } from '../../tracing.js';
import { withRetry } from '../../llm-retry.js';
const tracer = createTracer('Harness2.LLMCodeGen');
// 初始化 OpenAI 客户端
const openai = new OpenAI({
    apiKey: AGENT_CONFIG.apiKey,
    baseURL: AGENT_CONFIG.apiBase,
    defaultHeaders: {
        'User-Agent': 'Remotion-Video-Agent/0.1.0',
    },
    timeout: 60000, // 60秒超时
});
/**
 * LLM 代码生成器
 */
export class LLMCodeGenerator {
    /**
     * 为 beat 生成 VideoSpec DSL
     */
    async generateVideoSpec(beat, timing, design, fps) {
        const trace = tracer.startTrace('llm_generate_video_spec', { beatId: beat.id });
        try {
            tracer.log('info', `🤖 使用 LLM 生成 VideoSpec for ${beat.id}`);
            const prompt = this.buildPrompt(beat, timing, design, fps);
            const response = await withRetry(() => openai.chat.completions.create({
                model: AGENT_CONFIG.model,
                temperature: 0.3, // 较低温度，确保一致性
                max_tokens: 2048,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt(),
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }), `llm_video_spec_${beat.id}`, {
                maxRetries: 3,
                retryDelay: 2000,
                exponentialBackoff: true,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('LLM 返回了空响应');
            }
            // 提取 JSON
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('LLM 响应中未找到 JSON');
            }
            const llmResponse = JSON.parse(jsonMatch[0]);
            tracer.log('info', `✅ VideoSpec 生成成功`, {
                confidence: llmResponse.confidence,
                layerCount: llmResponse.spec.layers.length,
                complexity: llmResponse.spec.metadata?.complexity,
            });
            trace.end({ success: true });
            return llmResponse.spec;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            tracer.log('error', '❌ LLM VideoSpec 生成失败', { error: errorMessage });
            trace.end({ error: errorMessage });
            throw error;
        }
    }
    /**
     * 构建系统提示词
     */
    getSystemPrompt() {
        return `你是一个视频动画效果设计专家。你的任务是根据用户的需求，生成一个 VideoSpec DSL（领域特定语言）。

**VideoSpec DSL 规范：**

\`\`\`typescript
interface VideoSpec {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  layers: LayerConfig[];
  backgroundColor?: string;
  metadata?: {
    generatedBy: 'llm';
    complexity: 'simple' | 'medium' | 'complex';
    features: string[];
  };
}

interface LayerConfig {
  id: string;
  type: 'image' | 'video' | 'text' | 'shape' | 'audio';
  src?: string;
  content?: string;
  startFrame: number;
  durationInFrames: number;
  position?: { x: number | string; y: number | string; width?: number | string; height?: number | string; };
  style?: { opacity?: number; zIndex?: number; objectFit?: 'contain' | 'cover' | 'fill'; backgroundColor?: string; color?: string; fontSize?: number; fontFamily?: string; fontWeight?: string | number; textAlign?: 'left' | 'center' | 'right'; };
  animations: AnimationConfig[];
}

interface AnimationConfig {
  type: AnimationType;  // 见下方支持的动画类型
  startFrame: number;
  endFrame: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'ease-in-cubic' | 'ease-out-cubic' | 'ease-in-out-cubic';
  params?: {
    from?: number;
    to?: number;
    scale?: [number, number];
    distance?: number;
    degrees?: number;
    config?: { damping?: number; stiffness?: number; mass?: number; };
    blurAmount?: number;
    colorFrom?: string;
    colorTo?: string;
    particleCount?: number;
    particleColor?: string;
    perspective?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
  };
}
\`\`\`

**支持的动画类型（AnimationType）：**

基础动画：fade_in, fade_out, zoom_in, zoom_out, slide_left, slide_right, slide_up, slide_down

旋转动画：rotate_cw, rotate_ccw, rotate_360

弹性动画：bounce, spring, elastic

3D 动画：flip_horizontal, flip_vertical, flip_3d, perspective_rotate

效果：blur_in, blur_out, grayscale_in, grayscale_out

组合：custom（暂不支持，会被降级）

**重要规则：**

1. 一个图层可以有多个动画，它们会组合执行
2. 动画的 startFrame 和 endFrame 必须在图层的 startFrame 和 (startFrame + durationInFrames) 范围内
3. 如果需求简单（只有 fade + zoom），设置 complexity: 'simple'
4. 如果需求复杂（多个动画组合、3D 效果、粒子效果），设置 complexity: 'complex'
5. 优先使用预制动画类型，避免使用 'custom'
6. 返回纯 JSON，不要添加任何解释说明

**响应格式：**

\`\`\`json
{
  "spec": { ... VideoSpec ... },
  "reasoning": "简要说明你的设计思路",
  "confidence": 0.95
}
\`\`\`

现在开始生成 VideoSpec。`;
    }
    /**
     * 构建用户提示词
     */
    buildPrompt(beat, timing, design, fps) {
        const startFrame = timing.frames[0];
        const endFrame = timing.frames[1];
        const durationInFrames = endFrame - startFrame;
        const primaryColor = design.colorPalette.find((c) => c.name === 'Primary')?.hex || '#000000';
        const bgColor = design.colorPalette.find((c) => c.name === 'Background')?.hex || '#FFFFFF';
        const fontFamily = design.typography?.title?.family || 'Inter';
        return `请为以下视频片段（Beat）生成 VideoSpec DSL：

**Beat 信息：**
- ID: ${beat.id}
- 名称: ${beat.name}
- 时长: ${beat.endTime - beat.startTime}秒
- 情绪: ${beat.mood}
- 叙述: ${beat.narration || beat.name}
- 镜头: ${beat.camera}

**时间轴：**
- 开始帧: ${startFrame}
- 结束帧: ${endFrame}
- 总帧数: ${durationInFrames}
- FPS: ${fps}
- **重要：这个 beat 会被放在 Sequence 中，图层的 startFrame/endFrame 应该从 0 开始计数（相对于 beat），不要使用上面的绝对开始帧**

**素材：**
${beat.assets.length > 0 ? beat.assets.map((a, i) => `- Asset ${i + 1}: ${a}`).join('\n') : '- 无素材（使用纯色背景 + 文字）'}

**动画技巧（用户期望）：**
${beat.techniques.map(t => `- ${t}`).join('\n')}

**转场效果：**
${beat.transitions.length > 0 ? beat.transitions.map(t => `- ${t}`).join('\n') : '- 无'}

**设计规范：**
- 主色调: ${primaryColor}
- 背景色: ${bgColor}
- 字体: ${fontFamily}

**要求：**
1. 根据"情绪"和"叙述"选择合适的动画效果
2. 如果有素材，为每个素材创建一个图层，**src 字段必须使用上面提供的完整路径，不要修改或生成新路径**
3. 如果没有素材，创建一个文字图层，内容为"叙述"
4. 根据"动画技巧"选择对应的 AnimationType
5. **图层的 startFrame 必须从 0 开始，endFrame 不能超过 ${durationInFrames}（总帧数）**
6. **每个图层应该覆盖整个 beat 时长，或者根据动画需求设置合理的时间范围**
7. **图片/视频的 src 必须原样复制上面"素材"部分的路径**
8. 返回完整的 VideoSpec JSON

现在生成 VideoSpec：`;
    }
    /**
     * 验证 VideoSpec 的有效性
     */
    validateVideoSpec(spec) {
        const errors = [];
        // 1. 基础字段检查
        if (!spec.id || !spec.name) {
            errors.push('缺少 id 或 name');
        }
        if (spec.width <= 0 || spec.height <= 0 || spec.fps <= 0 || spec.durationInFrames <= 0) {
            errors.push('视频尺寸或时长无效');
        }
        // 2. 图层检查
        if (spec.layers.length === 0) {
            errors.push('至少需要一个图层');
        }
        for (const layer of spec.layers) {
            // 时间轴检查
            if (layer.startFrame < 0 || layer.startFrame >= spec.durationInFrames) {
                errors.push(`图层 ${layer.id} 的 startFrame 超出范围`);
            }
            if (layer.durationInFrames <= 0) {
                errors.push(`图层 ${layer.id} 的 durationInFrames 无效`);
            }
            // 动画检查
            for (const animation of layer.animations) {
                if (animation.startFrame < layer.startFrame) {
                    errors.push(`图层 ${layer.id} 的动画 ${animation.type} startFrame 小于图层 startFrame`);
                }
                if (animation.endFrame > layer.startFrame + layer.durationInFrames) {
                    errors.push(`图层 ${layer.id} 的动画 ${animation.type} endFrame 超出图层范围`);
                }
                if (animation.startFrame >= animation.endFrame) {
                    errors.push(`图层 ${layer.id} 的动画 ${animation.type} 时间范围无效`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * 判断 VideoSpec 的复杂度
     */
    assessComplexity(spec) {
        let score = 0;
        // 图层数量
        score += spec.layers.length;
        // 动画数量和类型
        for (const layer of spec.layers) {
            score += layer.animations.length;
            for (const animation of layer.animations) {
                // 3D 动画和粒子效果加分
                if (['flip_3d', 'perspective_rotate', 'particles', 'confetti'].includes(animation.type)) {
                    score += 3;
                }
                // 弹性动画加分
                if (['bounce', 'spring', 'elastic'].includes(animation.type)) {
                    score += 2;
                }
            }
        }
        if (score <= 5)
            return 'simple';
        if (score <= 15)
            return 'medium';
        return 'complex';
    }
}
