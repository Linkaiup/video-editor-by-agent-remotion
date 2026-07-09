/**
 * 代码生成模块 - 生成 Remotion 组合代码
 *
 * 本模块负责：
 * 1. 根据组合规格生成 React/TypeScript 代码
 * 2. 确保正确的组件导出名
 * 3. 处理图层、特效和转场
 * 4. 生成完整可运行的代码
 */

import OpenAI from 'openai';
import { AGENT_CONFIG, SYSTEM_PROMPTS } from './config.js';
import { CompositionSpec, Layer } from './types.js';
import { createTracer } from './tracing.js';

// 初始化 DeepSeek API 客户端
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: AGENT_CONFIG.apiBase,
});

// 创建追踪器用于记录操作
const tracer = createTracer('CodeGeneration');

/**
 * 生成组合代码--等P1进阶版本再使用
 *
 * 根据组合规格生成完整的 React/TypeScript 组件代码
 * **重要**: 确保组件导出名与规格 ID 匹配
 *
 * @param spec - 组合规格
 * @returns 生成的代码字符串
 */
export async function generateCompositionCode(spec: CompositionSpec): Promise<string> {
  const trace = tracer.startTrace('generate_code', { specId: spec.id });

  try {
    // 构建组件名（将 - 转换为 _，确保是有效的标识符）
    const componentName = spec.id.replace(/[^a-zA-Z0-9]/g, '_');

    tracer.log('info', '生成代码', { componentName, layers: spec.layers.length });

    // 构建提示词
    const prompt = `你是 Remotion 视频组件代码生成专家。请生成一个 React/TypeScript 组件。

组合规格：
- ID: ${spec.id}
- 组件名: ${componentName}（必须使用这个名字！）
- 尺寸: ${spec.width}x${spec.height}
- 帧率: ${spec.fps} fps
- 时长: ${spec.durationInFrames} 帧
- 图层数: ${spec.layers.length}

${spec.layers.length > 0 ? `图层信息：
${spec.layers.map((layer, i) => `
图层 ${i + 1}:
- 类型: ${layer.type}
- 素材路径: IMAGE_SRC_PLACEHOLDER (稍后替换)
- 起始帧: ${layer.startFrame}
- 时长: ${layer.durationInFrames} 帧
- 特效: ${layer.effects?.map(e => e.type).join(', ') || '无'}
`).join('\n')}` : '无图层，生成一个简单的背景动画。'}

**关键要求**：
1. **组件必须导出为**: \`export const ${componentName}: React.FC = () => { ... }\`
2. 使用 Remotion 的 AbsoluteFill, useCurrentFrame, useVideoConfig
3. 图片使用 <Img src="IMAGE_SRC_PLACEHOLDER" />（我会稍后替换这个占位符）
4. 实现所有指定的特效
5. 代码完整可运行
6. 不要使用 MyComposition 或其他名字，必须用 ${componentName}

重要：不要在代码中包含 base64 数据，只使用 IMAGE_SRC_PLACEHOLDER 作为占位符

示例：
\`\`\`tsx
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Img src="IMAGE_SRC_PLACEHOLDER" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </AbsoluteFill>
  );
};
\`\`\``;

    // 调用 DeepSeek API
    const response = await openai.chat.completions.create({
      model: AGENT_CONFIG.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.codeGeneration },
        { role: 'user', content: prompt },
      ],
      temperature: AGENT_CONFIG.temperature,
    });

    let code = response.choices[0]?.message?.content || '';

    // 清理代码
    code = code.replace(/^```(?:tsx?|typescript|javascript)?\n/gm, '');
    code = code.replace(/\n```$/gm, '');
    code = code.trim();

    // 验证并修复导出名
    if (!code.includes(`export const ${componentName}`)) {
      tracer.log('warn', '代码缺少正确的导出，自动修复');
      code = code.replace(/export const MyComposition/g, `export const ${componentName}`);
      code = code.replace(/export const Composition/g, `export const ${componentName}`);
      code = code.replace(/export default/g, `export const ${componentName}: React.FC = `);
    }

    // 修复 [object Object] 问题和替换图片占位符
    if (code.includes('[object Object]') || code.includes('IMAGE_SRC_PLACEHOLDER')) {
      tracer.log('warn', '检测到占位符，替换为实际图片路径');
      spec.layers.forEach(layer => {
        if (layer.source && typeof layer.source === 'string') {
          // 替换所有占位符为实际的图片路径
          code = code.replace(/\[object Object\]/g, layer.source);
          code = code.replace(/IMAGE_SRC_PLACEHOLDER/g, layer.source);
        }
      });
    }

    tracer.log('info', '代码生成完成', { length: code.length, hasExport: code.includes(`export const ${componentName}`) });
    trace.end({ codeLength: code.length });
    return code;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    tracer.log('error', '代码生成失败', { error: errorMessage });
    trace.end({ error: errorMessage });
    throw error;
  }
}
