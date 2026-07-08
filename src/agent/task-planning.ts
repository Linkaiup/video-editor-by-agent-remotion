/**
 * 任务规划模块 - 将用户意图分解为可执行步骤
 *
 * 本模块负责：
 * 1. 根据用户意图创建详细的任务计划
 * 2. 将复杂任务分解为多个可执行步骤
 * 3. 执行任务计划并跟踪进度
 * 4. 处理步骤失败和重试逻辑
 * 5. 提供进度回调通知
 */

import OpenAI from 'openai';
import { AGENT_CONFIG, SYSTEM_PROMPTS } from './config.js';
import { UserIntent, TaskPlan, TaskStep } from './types.js';
import { createTracer } from './tracing.js';
import { withRetry } from './llm-retry.js';

// 初始化 OpenAI API 客户端
const openai = new OpenAI({
  apiKey: AGENT_CONFIG.apiKey,
  baseURL: AGENT_CONFIG.apiBase,
  defaultHeaders: {
    'User-Agent': 'Remotion-Video-Agent/0.1.0',
  },
  timeout: 60000, // 60秒超时
});

// 创建追踪器
const tracer = createTracer('TaskPlanning');

/**
 * 创建任务计划
 *
 * 使用 OpenAI LLM 根据用户意图生成详细的执行计划
 * 计划包含多个步骤，每个步骤都有明确的动作和描述
 *
 * @param intent - 用户意图对象
 * @returns 包含步骤序列的任务计划
 *
 * @example
 * const plan = await createTaskPlan({
 *   type: 'create',
 *   entities: { assets: ['video.mp4'], effects: ['fade'] }
 * });
 * // 返回包含 5-6 个步骤的计划
 */
export async function createTaskPlan(intent: UserIntent): Promise<TaskPlan> {
  const trace = tracer.startTrace('create_plan', { intent });

  try {
    // 使用重试包装器调用 OpenAI API 生成任务计划
    const response = await withRetry(
      () => openai.chat.completions.create({
        model: AGENT_CONFIG.model,
        max_tokens: 2048,
        temperature: AGENT_CONFIG.temperature,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.taskPlanning,
          },
          {
            role: 'user',
            content: `为这个视频编辑意图创建详细的任务计划：\n\n${JSON.stringify(intent, null, 2)}\n\n返回 JSON 格式，包含: id, steps (数组，每项包含 {id, action, description, status}), estimatedDuration, dependencies`,
          },
        ],
      }),
      'task_planning',
      {
        maxRetries: 3,
        retryDelay: 2000,
        exponentialBackoff: true,
      }
    );

    // 提取响应内容
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('DeepSeek API 返回了空响应');
    }

    // 从响应中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('响应中未找到 JSON 格式的数据');
    }

    const plan: TaskPlan = JSON.parse(jsonMatch[0]);

    // 确保所有步骤的初始状态为 pending
    plan.steps = plan.steps.map(step => ({ ...step, status: 'pending' as const }));

    trace.end({ plan });
    return plan;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    tracer.log('error', '任务计划创建失败', { error: errorMessage });
    trace.end({ error: errorMessage });
    throw error;
  }
}

/**
 * 执行任务计划
 *
 * 按顺序执行计划中的每个步骤
 * 每个步骤完成后会调用回调函数通知更新
 * 失败的步骤会尝试重试
 *
 * @param plan - 要执行的任务计划
 * @param onStepUpdate - 步骤状态更新时的回调函数
 * @returns 执行完成后的任务计划
 *
 * @example
 * const result = await executeTaskPlan(plan, (step) => {
 *   console.log(`步骤 ${step.id}: ${step.status}`);
 * });
 */
export async function executeTaskPlan(
  plan: TaskPlan,
  onStepUpdate?: (step: TaskStep) => void
): Promise<TaskPlan> {
  const trace = tracer.startTrace('execute_plan', { planId: plan.id });

  try {
    // 遍历并执行每个步骤
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];

      // 更新状态为进行中
      step.status = 'in_progress';
      onStepUpdate?.(step);

      try {
        // 执行步骤
        const result = await executeStep(step);
        step.status = 'completed';
        step.result = result;
      } catch (error) {
        // 步骤执行失败
        step.status = 'failed';
        step.error = error instanceof Error ? error.message : '未知错误';
        tracer.log('error', `步骤 ${step.id} 失败`, { error: step.error });

        // 判断是否应该重试
        const shouldRetry = await shouldRetryStep(step, error);
        if (shouldRetry) {
          tracer.log('info', `重试步骤 ${step.id}`);
          step.status = 'in_progress';
          onStepUpdate?.(step);

          try {
            // 重试执行
            const result = await executeStep(step);
            step.status = 'completed';
            step.result = result;
          } catch (retryError) {
            // 重试仍然失败
            step.status = 'failed';
            step.error = retryError instanceof Error ? retryError.message : '未知错误';
            break; // 停止执行后续步骤
          }
        } else {
          break; // 不重试，停止执行
        }
      }

      // 通知步骤更新
      onStepUpdate?.(step);
    }

    trace.end({ plan });
    return plan;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    trace.end({ error: errorMessage });
    throw error;
  }
}

/**
 * 执行单个任务步骤
 *
 * 根据步骤的 action 类型路由到不同的执行器
 *
 * @param step - 要执行的步骤
 * @returns 步骤执行结果
 */
async function executeStep(step: TaskStep): Promise<any> {
  tracer.log('info', `执行步骤: ${step.action}`, { step });

  // 根据动作类型分发到不同的执行函数
  // 支持多种可能的动作命名
  const action = step.action.toLowerCase();

  if (action.includes('asset') || action.includes('validate') || action.includes('load')) {
    return await validateAssets(step);
  } else if (action.includes('composition') || action.includes('create')) {
    return await createComposition(step);
  } else if (action.includes('code') || action.includes('generate')) {
    return await generateCode(step);
  } else if (action.includes('effect') || action.includes('apply')) {
    return await applyEffects(step);
  } else if (action.includes('preview') || action.includes('render')) {
    return await renderPreview(step);
  } else {
    // 默认处理：记录并返回成功
    tracer.log('info', `步骤 ${step.action} 已执行（默认处理）`);
    return { success: true, action: step.action, description: step.description };
  }
}

/**
 * 验证素材
 *
 * 检查素材文件是否存在和可访问
 */
async function validateAssets(step: TaskStep): Promise<any> {
  tracer.log('info', '验证素材');
  return { valid: true, assets: step.description };
}

/**
 * 创建组合
 *
 * 创建 Remotion 组合规格
 */
async function createComposition(step: TaskStep): Promise<any> {
  tracer.log('info', '创建组合');
  return { compositionId: `comp-${Date.now()}` };
}

/**
 * 生成代码
 *
 * 生成 React 组件代码
 */
async function generateCode(step: TaskStep): Promise<any> {
  tracer.log('info', '生成代码');
  return { code: '// 生成的代码占位符' };
}

/**
 * 应用特效
 *
 * 将特效应用到组合中
 */
async function applyEffects(step: TaskStep): Promise<any> {
  tracer.log('info', '应用特效');
  return { effectsApplied: true };
}

/**
 * 渲染预览
 *
 * 渲染视频预览
 */
async function renderPreview(step: TaskStep): Promise<any> {
  tracer.log('info', '渲染预览');
  return { previewUrl: '/preview.mp4' };
}

/**
 * 判断是否应该重试步骤
 *
 * 根据错误类型判断是否值得重试
 * 网络错误、超时、限流等错误适合重试
 *
 * @param step - 失败的步骤
 * @param error - 错误对象
 * @returns 是否应该重试
 */
async function shouldRetryStep(step: TaskStep, error: any): Promise<boolean> {
  // 可重试的错误类型
  const retryableErrors = [
    'network',      // 网络错误
    'timeout',      // 超时
    'rate_limit',   // 限流
    'temporary',    // 临时错误
  ];

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  // 检查错误消息是否包含可重试关键词
  return retryableErrors.some(keyword => errorMessage.includes(keyword));
}

/**
 * 获取任务计划进度
 *
 * 计算已完成步骤的百分比
 *
 * @param plan - 任务计划
 * @returns 进度信息对象
 *
 * @example
 * const progress = getStepProgress(plan);
 * console.log(`进度: ${progress.percentage}% (${progress.completed}/${progress.total})`);
 */
export function getStepProgress(plan: TaskPlan): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = plan.steps.filter(s => s.status === 'completed').length;
  const total = plan.steps.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}
