/**
 * 验证模块 - 验证生成的组合和代码
 *
 * 本模块负责：
 * 1. 验证组合规格的正确性
 * 2. 检查生成代码的语法和结构
 * 3. 使用 AI 进行深度代码审查
 * 4. 验证视频输出
 * 5. 提供详细的错误和警告信息
 */

import OpenAI from 'openai';
import { AGENT_CONFIG, SYSTEM_PROMPTS } from './config.js';
import { ValidationResult, CompositionSpec } from './types.js';
import { createTracer } from './tracing.js';
import { validateCompositionSpec } from './tools.js';

// 初始化 DeepSeek API 客户端
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: AGENT_CONFIG.apiBase,
});

// 创建追踪器
const tracer = createTracer('Validation');

/**
 * 验证组合
 *
 * 对生成的组合规格和代码进行全面验证
 * 包括基础验证、代码结构验证和 AI 深度验证
 *
 * @param spec - 组合规格对象
 * @param generatedCode - 生成的代码字符串
 * @returns 验证结果，包含错误和警告列表
 *
 * @example
 * const result = await validateComposition(spec, code);
 * if (!result.valid) {
 *   console.error('验证失败:', result.errors);
 * }
 */
export async function validateComposition(
  spec: CompositionSpec,
  generatedCode: string
): Promise<ValidationResult> {
  const trace = tracer.startTrace('validate_composition', { specId: spec.id });

  try {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 基础规格验证
    const specValidation = validateCompositionSpec(spec);
    if (!specValidation.valid) {
      errors.push(...specValidation.errors);
    }

    // 2. 代码结构验证
    const codeValidation = validateCode(generatedCode);
    errors.push(...codeValidation.errors);
    warnings.push(...codeValidation.warnings);

    // 3. AI 深度验证（仅在没有基础错误时执行）
    if (errors.length === 0) {
      try {
        const aiValidation = await performAIValidation(spec, generatedCode);
        errors.push(...aiValidation.errors);
        warnings.push(...aiValidation.warnings);
      } catch (error) {
        warnings.push('AI 验证失败: ' + (error instanceof Error ? error.message : '未知错误'));
      }
    }

    // 构建验证结果
    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
    };

    trace.end({ result });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    tracer.log('error', '验证失败', { error: errorMessage });
    trace.end({ error: errorMessage });
    throw error;
  }
}

/**
 * 验证代码结构
 *
 * 检查生成代码的基本结构和必需元素
 * 不依赖 AI，使用规则匹配
 *
 * @param code - 生成的代码字符串
 * @returns 包含错误和警告的对象
 */
function validateCode(code: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查必需的 Remotion 导入
  if (!code.includes('from \'remotion\'') && !code.includes('from "remotion"')) {
    errors.push('缺少 Remotion 导入语句');
  }

  // 检查 React 导入
  if (!code.includes('import') || !code.includes('React')) {
    warnings.push('缺少 React 导入 - 可能导致运行时错误');
  }

  // 检查组件导出
  if (!code.includes('export')) {
    errors.push('未找到组件导出语句');
  }

  // 检查 TypeScript 类型
  if (!code.includes(': ') && !code.includes('interface') && !code.includes('type ')) {
    warnings.push('未检测到 TypeScript 类型 - 建议添加类型以提高安全性');
  }

  // 检查 Remotion hooks 的使用
  if (!code.includes('useCurrentFrame') && !code.includes('useVideoConfig')) {
    warnings.push('未使用 Remotion hooks - 动画可能无法正常工作');
  }

  // 检查常见错误：在 Remotion 中使用 React 状态
  if (code.includes('useState') || code.includes('useEffect')) {
    warnings.push('在 Remotion 中使用了 React 状态/副作用 - 这可能不会按预期工作');
  }

  return { errors, warnings };
}

/**
 * 执行 AI 验证
 *
 * 使用 DeepSeek LLM 对代码进行深度分析
 * 检查逻辑错误、性能问题和最佳实践
 *
 * @param spec - 组合规格
 * @param code - 生成的代码
 * @returns AI 验证结果
 */
async function performAIValidation(
  spec: CompositionSpec,
  code: string
): Promise<{ errors: string[]; warnings: string[] }> {
  // 调用 DeepSeek API 进行代码审查
  const response = await openai.chat.completions.create({
    model: AGENT_CONFIG.model,
    max_tokens: 1024,
    temperature: AGENT_CONFIG.temperature,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPTS.validation,
      },
      {
        role: 'user',
        content: `验证这个 Remotion 组合：

规格:
${JSON.stringify(spec, null, 2)}

生成的代码:
\`\`\`tsx
${code}
\`\`\`

返回 JSON 格式，包含: errors (关键问题数组), warnings (潜在问题数组)`,
      },
    ],
  });

  // 提取响应内容
  const content = response.choices[0]?.message?.content;
  if (!content) {
    return { errors: [], warnings: ['AI 验证返回了空数据'] };
  }

  // 从响应中提取 JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { errors: [], warnings: ['AI 验证返回的数据格式不正确'] };
  }

  const result = JSON.parse(jsonMatch[0]);
  return {
    errors: result.errors || [],
    warnings: result.warnings || [],
  };
}

/**
 * 验证输出视频
 *
 * 检查渲染后的视频文件
 *
 * @param videoPath - 视频文件路径
 * @returns 验证结果
 */
export async function validateOutput(videoPath: string): Promise<ValidationResult> {
  const trace = tracer.startTrace('validate_output', { videoPath });

  try {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查文件是否存在
    // 这里会与实际的文件系统检查集成
    // 目前是占位符验证

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
      preview: videoPath,
    };

    trace.end({ result });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    tracer.log('error', '输出验证失败', { error: errorMessage });
    trace.end({ error: errorMessage });
    throw error;
  }
}

/**
 * 验证意图对象
 *
 * 检查意图对象的基本有效性
 *
 * @param intent - 用户意图对象
 * @returns 验证结果
 */
export function validateIntent(intent: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查必需字段
  if (!intent.type) {
    errors.push('意图类型是必需的');
  }

  // 检查置信度范围
  if (intent.confidence !== undefined && (intent.confidence < 0 || intent.confidence > 1)) {
    errors.push('置信度必须在 0 到 1 之间');
  }

  // 检查描述
  if (!intent.description) {
    errors.push('意图描述是必需的');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
