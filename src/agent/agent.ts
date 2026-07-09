/**
 * Agent 主调度器 - 协调所有模块完成视频编辑任务
 *
 * 本模块是整个系统的核心，负责：
 * 1. 管理用户会话和对话历史
 * 2. 协调各个功能模块（意图识别、任务规划、代码生成等）
 * 3. 处理用户消息并返回响应
 * 4. 维护当前的组合状态
 * 5. 提供指标和追踪信息
 */

import OpenAI from 'openai';
import { AGENT_CONFIG } from './config.js';
import { recognizeIntent, confirmIntent } from './intent-recognition.js';
import { createTaskPlan, executeTaskPlan, getStepProgress } from './task-planning.js';
import { validateComposition } from './validation.js';
import { renderVideo, formatFileSize, formatRenderTime } from './renderer.js';
import { createTracer, getAllMetrics, getAllTraces } from './tracing.js';
import { ResilientHarness2Executor } from './harness/resilient-executor.js';
import type { Harness2Result } from './harness/executor.js';
import { analyzeClarification, formatClarificationMessage } from './clarification.js';
import { CompositionSpec, TaskStep, UserIntent } from './types.js';
import { retryWithBackoff, saveComponentCode, generateId, processLocalImage } from './tools.js';

// 创建追踪器
const tracer = createTracer('Agent');

/**
 * Agent 上下文接口
 *
 * 保存会话状态和历史信息
 */
export interface AgentContext {
  sessionId: string;                          // 会话 ID
  conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[];  // 对话历史
  currentComposition?: CompositionSpec;       // 当前编辑的组合
}

/**
 * Agent 响应接口
 *
 * Agent 处理用户消息后返回的结果
 */
export interface AgentResponse {
  message: string;                    // 回复消息
  needsConfirmation: boolean;         // 是否需要用户确认
  clarifications: string[];           // 需要澄清的问题列表
  composition?: CompositionSpec;      // 生成的组合（如果有）
  code?: string;                      // 生成的代码（如果有）
  filePath?: string;                  // 代码文件路径（如果已保存）
  validationResult?: any;             // 验证结果（如果已验证）
}

/**
 * Remotion Agent 主类
 *
 * 这是系统的入口点，所有用户交互都通过这个类进行
 *
 * @example
 * const agent = new RemotionAgent('my-session');
 * const response = await agent.processMessage('创建一个 5 秒的视频');
 * console.log(response.message);
 */
export class RemotionAgent {
  private context: AgentContext;
  private harness2Executor: ResilientHarness2Executor; // Harness 2.0 执行器

  /**
   * 构造函数
   *
   * @param sessionId - 可选的会话 ID，如果不提供则自动生成
   */
  constructor(sessionId?: string) {
    this.context = {
      sessionId: sessionId || generateId('session'),
      conversationHistory: [],
    };
    // 初始化 Harness 2.0 执行器
    const projectPath = `./projects/${this.context.sessionId}`;
    this.harness2Executor = new ResilientHarness2Executor(projectPath);
  }

  /**
   * 处理用户消息
   *
   * 这是主要的工作流程函数，协调所有步骤来完成用户的请求
   *
   * 工作流程：
   * 1. 识别用户意图
   * 2. 确认意图（如需要）
   * 3. 创建任务计划
   * 4. 执行任务计划
   * 5. 根据意图类型处理结果
   * 6. 返回响应
   *
   * @param userMessage - 用户输入的消息
   * @returns Agent 响应对象
   */
  async processMessage(userMessage: string): Promise<AgentResponse> {
    const trace = tracer.startTrace('process_message', { message: userMessage });

    try {
      tracer.log('info', '处理用户消息', { sessionId: this.context.sessionId });

      // 步骤 1: 识别意图
      tracer.log('info', '步骤 1: 识别意图');
      const intent = await recognizeIntent(userMessage);
      tracer.log('info', '意图已识别', { type: intent.type, confidence: intent.confidence });

      // 步骤 2: 确认意图
      tracer.log('info', '步骤 2: 确认意图');

      // 使用增强的澄清分析
      const clarificationResult = await analyzeClarification(intent);

      if (clarificationResult.needsClarification) {
        const clarificationMessage = formatClarificationMessage(clarificationResult);

        tracer.log('info', '需要澄清意图', {
          completeness: clarificationResult.completeness,
          questionCount: clarificationResult.questions.length
        });

        trace.end({ needsConfirmation: true });
        return {
          message: clarificationMessage,
          needsConfirmation: true,
          clarifications: clarificationResult.questions.map(q => q.question),
        };
      }

      tracer.log('info', '意图确认完成，信息完整度：' + clarificationResult.completeness + '%');

      // 步骤 3: 创建任务计划
      tracer.log('info', '步骤 3: 创建任务计划');
      const plan = await createTaskPlan(intent);
      tracer.log('info', '任务计划已创建', { steps: plan.steps.length });

      // 步骤 4: 执行任务计划
      tracer.log('info', '步骤 4: 执行任务计划');
      const executedPlan = await executeTaskPlan(plan, (step: TaskStep) => {
        const progress = getStepProgress(plan);
        tracer.log('info', `进度: ${progress.percentage}%`, { step: step.action, status: step.status });
      });

      // 步骤 5: 根据意图类型处理结果
      const response = await this.handleIntentResult(intent, executedPlan);

      // 步骤 6: 添加到对话历史
      this.context.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.message }
      );

      trace.end({ success: true });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '处理消息时出错', { error: errorMessage });
      trace.end({ error: errorMessage });

      return {
        message: `抱歉，遇到了一个错误：${errorMessage}`,
        needsConfirmation: false,
        clarifications: [],
      };
    }
  }

  /**
   * 根据意图类型处理结果
   *
   * 将执行计划的结果转换为用户可读的响应
   *
   * @param intent - 用户意图
   * @param plan - 已执行的任务计划
   * @returns Agent 响应
   */
  private async handleIntentResult(intent: UserIntent, plan: any): Promise<AgentResponse> {
    switch (intent.type) {
      case 'create':
        return await this.handleCreateIntent(intent, plan);
      case 'edit':
        return await this.handleEditIntent(intent, plan);
      case 'add_effect':
        return await this.handleAddEffectIntent(intent, plan);
      case 'preview':
        return await this.handlePreviewIntent(intent, plan);
      case 'query':
        return await this.handleQueryIntent(intent);
      case 'unknown':
        return {
          message: '抱歉，我不太理解您的意思。\n\n我可以帮您：\n• 创建视频："创建一个 5 秒的视频"\n• 添加特效："添加淡入效果"\n• 查询状态："视频在哪？"\n\n请告诉我您想做什么？',
          needsConfirmation: false,
          clarifications: [],
        };
      default:
        return {
          message: `我已经处理了您的 ${intent.type} 请求。`,
          needsConfirmation: false,
          clarifications: [],
        };
    }
  }

  /**
   * 清理旧的组合文件
   *
   * 删除超过1小时的旧组合文件，避免累积
   */
  private async cleanupOldCompositions(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      const compositionsDir = './src/compositions';
      const files = await fs.readdir(compositionsDir);

      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      for (const file of files) {
        // 只清理生成的组合文件（以 comp- 或 test- 开头）
        if (file.startsWith('comp-') || file.startsWith('test-')) {
          const filePath = path.join(compositionsDir, file);
          const stats = await fs.stat(filePath);

          // 删除超过1小时的文件
          if (stats.mtimeMs < oneHourAgo) {
            await fs.unlink(filePath);
            tracer.log('info', '已清理旧文件', { file });
          }
        }
      }
    } catch (error) {
      // 清理失败不影响主流程
      tracer.log('warn', '清理旧文件失败', { error: error instanceof Error ? error.message : '未知错误' });
    }
  }

  /**
   * 处理创建视频的意图（使用 Harness 2.0）
   *
   * @param intent - 用户意图
   * @param plan - 任务计划
   * @returns Agent 响应
   */
  private async handleCreateIntent(intent: UserIntent, plan: any): Promise<AgentResponse> {
    tracer.log('info', '🚀 使用 Harness 处理创建意图');

    try {
      // 提取素材路径
      const assets = intent.entities?.assets || [];
      const assetPaths: string[] = [];

      for (const asset of assets) {
        if (typeof asset === 'string') {
          assetPaths.push(asset);
        } else if (asset && typeof asset === 'object' && 'path' in asset) {
          assetPaths.push((asset as any).path);
        }
      }

      tracer.log('info', '📦 开始执行 Harness 流程', {
        assetCount: assetPaths.length,
        duration: intent.entities?.duration,
        paths: assetPaths
      });

      // 使用 Harness 2.0 执行器（带重试）
      const result = await this.harness2Executor.executeWithRetry(
        intent,
        assetPaths
      );

      // 构建响应消息
      let message = result.message;

      // 添加项目路径信息
      message += `\n\n📁 项目路径：${result.projectPath}`;
      message += `\n📦 制品已保存到 artifacts/ 目录`;

      if (result.artifacts.build) {
        message += `\n🔨 生成组件数：${result.artifacts.build.compositions.length}`;
      }

      return {
        message,
        needsConfirmation: false,
        clarifications: [],
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '❌ Harness 2.0 执行失败', { error: errorMessage });

      return {
        message: `❌ 视频创建失败：${errorMessage}\n\n💡 提示：Harness 2.0 已尝试 3 次智能重试`,
        needsConfirmation: false,
        clarifications: [],
      };
    }
  }

  /**
   * 处理编辑视频的意图
   */
  private async handleEditIntent(intent: UserIntent, plan: any): Promise<AgentResponse> {
    tracer.log('info', '处理编辑意图');

    // 检查是否有当前组合
    if (!this.context.currentComposition) {
      return {
        message: '❌ 没有找到当前组合。请先创建一个视频。',
        needsConfirmation: false,
        clarifications: [],
      };
    }

    return {
      message: '✅ 编辑功能正在开发中。当前您可以创建新视频。',
      needsConfirmation: false,
      clarifications: [],
    };
  }

  /**
   * 处理添加特效的意图
   */
  private async handleAddEffectIntent(intent: UserIntent, plan: any): Promise<AgentResponse> {
    tracer.log('info', '处理添加特效意图');

    // 检查是否有当前组合
    if (!this.context.currentComposition) {
      return {
        message: '❌ 没有找到当前组合。请先创建一个视频。',
        needsConfirmation: false,
        clarifications: [],
      };
    }

    return {
      message: '✅ 添加特效功能正在开发中。当前您可以在创建时指定特效。',
      needsConfirmation: false,
      clarifications: [],
    };
  }

  /**
   * 处理预览的意图
   */
  /**
   * 处理查询意图（例如：视频在哪？状态如何？）
   *
   * @param intent - 用户意图
   * @returns Agent 响应
   */
  private async handleQueryIntent(intent: UserIntent): Promise<AgentResponse> {
    tracer.log('info', '处理查询意图');

    try {
      const { readdirSync, statSync } = await import('fs');
      const { join } = await import('path');

      // 检查 output 目录
      const outputDir = './output';
      let message = '';

      try {
        const files = readdirSync(outputDir)
          .filter(f => f.endsWith('.mp4'))
          .map(f => {
            const fullPath = join(outputDir, f);
            const stats = statSync(fullPath);
            return {
              name: f,
              size: Math.round(stats.size / 1024), // KB
              time: stats.mtime,
            };
          })
          .sort((a, b) => b.time.getTime() - a.time.getTime()); // 最新的在前

        if (files.length === 0) {
          message = '目前还没有生成的视频。您可以说"创建一个 5 秒的视频"来开始创建。';
        } else {
          const latest = files[0];
          message = `✅ 最新视频：\n\n📁 文件：./output/${latest.name}\n📦 大小：${latest.size} KB\n⏰ 创建时间：${latest.time.toLocaleString('zh-CN')}`;

          if (files.length > 1) {
            message += `\n\n📚 共有 ${files.length} 个视频文件。`;
          }
        }
      } catch (error) {
        message = 'output 目录不存在或为空。还没有生成任何视频。';
      }

      return {
        message,
        needsConfirmation: false,
        clarifications: [],
      };
    } catch (error) {
      tracer.log('error', '查询处理失败', { error: error instanceof Error ? error.message : '未知错误' });
      return {
        message: '查询失败，请稍后重试。',
        needsConfirmation: false,
        clarifications: [],
      };
    }
  }

  private async handlePreviewIntent(intent: UserIntent, plan: any): Promise<AgentResponse> {
    return {
      message: '要预览您的组合，请运行：npm run dev',
      needsConfirmation: false,
      clarifications: [],
    };
  }

  /**
   * 获取性能指标
   *
   * @returns 所有模块的性能指标
   */
  getMetrics() {
    return getAllMetrics();
  }

  /**
   * 获取追踪记录
   *
   * @param filter - 可选的过滤条件
   * @returns 追踪记录数组
   */
  getTraces(filter?: any) {
    return getAllTraces(filter);
  }

  /**
   * 获取当前上下文
   *
   * @returns Agent 上下文对象
   */
  getContext() {
    return this.context;
  }
}
