/**
 * 意图确认增强模块
 *
 * 提供智能的意图澄清和信息补充提示
 */

import { createTracer } from './tracing.js';
import type { UserIntent } from './types.js';

const tracer = createTracer('IntentClarification');

export interface ClarificationQuestion {
  field: string;
  question: string;
  suggestions?: string[];
  required: boolean;
}

export interface ClarificationResult {
  needsClarification: boolean;
  questions: ClarificationQuestion[];
  completeness: number; // 0-100
  missingFields: string[];
}

/**
 * 分析意图的完整性，生成澄清问题
 */
export async function analyzeClarification(intent: UserIntent): Promise<ClarificationResult> {
  const trace = tracer.startTrace('analyze_clarification', { type: intent.type });

  try {
    switch (intent.type) {
      case 'create':
        return analyzeCreateIntent(intent);

      case 'edit':
        return analyzeEditIntent(intent);

      case 'add_effect':
        return analyzeEffectIntent(intent);

      default:
        return {
          needsClarification: false,
          questions: [],
          completeness: 100,
          missingFields: []
        };
    }

  } catch (error) {
    tracer.log('error', '澄清分析失败', { error: String(error) });
    trace.end({ error: String(error) });
    throw error;
  } finally {
    trace.end({});
  }
}

/**
 * 分析创建视频意图
 */
function analyzeCreateIntent(intent: UserIntent): ClarificationResult {
  const questions: ClarificationQuestion[] = [];
  const missingFields: string[] = [];
  let completeness = 30;

  // 1. 检查时长
  if (!intent.entities?.duration) {
    questions.push({
      field: 'duration',
      question: '您希望视频的时长是多少秒？',
      suggestions: ['5秒', '10秒', '15秒', '30秒'],
      required: true
    });
    missingFields.push('duration');
  } else {
    completeness += 20;
  }

  // 2. 检查素材
  if (!intent.entities?.assets || intent.entities.assets.length === 0) {
    questions.push({
      field: 'assets',
      question: '您想使用什么素材？',
      suggestions: [
        '上传图片',
        '使用纯色背景',
        '使用文字内容',
        '稍后添加'
      ],
      required: false
    });
    missingFields.push('assets');
  } else {
    completeness += 25;
  }

  // 3. 检查特效
  if (!intent.entities?.effects || intent.entities.effects.length === 0) {
    questions.push({
      field: 'effects',
      question: '需要添加什么特效吗？',
      suggestions: [
        '淡入淡出',
        '缩放动画',
        '旋转效果',
        '不需要特效'
      ],
      required: false
    });
    missingFields.push('effects');
  } else {
    completeness += 15;
  }

  // 4. 检查转场
  if (!intent.entities?.transitions || intent.entities.transitions.length === 0) {
    questions.push({
      field: 'transitions',
      question: '需要什么转场效果？',
      suggestions: [
        '渐变转场',
        '滑动转场',
        '无转场',
        '自动选择'
      ],
      required: false
    });
    missingFields.push('transitions');
  } else {
    completeness += 10;
  }

  // 5. 检查文字
  if (!intent.entities?.text) {
    questions.push({
      field: 'text',
      question: '需要添加文字内容吗？',
      suggestions: [
        '添加标题',
        '添加字幕',
        '不需要文字',
        '稍后添加'
      ],
      required: false
    });
    missingFields.push('text');
  } else {
    completeness += 10;
  }

  // 6. 检查风格
  const entities = intent.entities as any;
  if (!entities?.style) {
    questions.push({
      field: 'style',
      question: '您希望什么风格的视频？',
      suggestions: [
        '简约现代',
        '动感炫酷',
        '温馨柔和',
        '商务专业'
      ],
      required: false
    });
    missingFields.push('style');
  } else {
    completeness += 10;
  }

  const needsClarification = questions.some(q => q.required) || completeness < 60;

  tracer.log('info', '创建意图分析完成', {
    completeness,
    needsClarification,
    questionCount: questions.length
  });

  return {
    needsClarification,
    questions,
    completeness,
    missingFields
  };
}

/**
 * 分析编辑视频意图
 */
function analyzeEditIntent(intent: UserIntent): ClarificationResult {
  const questions: ClarificationQuestion[] = [];
  const missingFields: string[] = [];
  let completeness = 40;

  const entities = intent.entities as any;

  // 检查目标视频
  if (!entities?.target) {
    questions.push({
      field: 'target',
      question: '您想编辑哪个视频？',
      suggestions: ['最近创建的', '指定项目ID'],
      required: true
    });
    missingFields.push('target');
  } else {
    completeness += 30;
  }

  // 检查编辑操作
  if (!entities?.action) {
    questions.push({
      field: 'action',
      question: '您想进行什么编辑操作？',
      suggestions: [
        '修改时长',
        '替换素材',
        '调整特效',
        '修改文字'
      ],
      required: true
    });
    missingFields.push('action');
  } else {
    completeness += 30;
  }

  const needsClarification = questions.some(q => q.required);

  return {
    needsClarification,
    questions,
    completeness,
    missingFields
  };
}

/**
 * 分析添加特效意图
 */
function analyzeEffectIntent(intent: UserIntent): ClarificationResult {
  const questions: ClarificationQuestion[] = [];
  const missingFields: string[] = [];
  let completeness = 40;

  // 检查特效类型
  if (!intent.entities?.effects || intent.entities.effects.length === 0) {
    questions.push({
      field: 'effects',
      question: '您想添加什么特效？',
      suggestions: [
        '淡入淡出',
        '缩放',
        '旋转',
        '模糊',
        '色彩调整'
      ],
      required: true
    });
    missingFields.push('effects');
  } else {
    completeness += 40;
  }

  // 检查应用位置
  if (!intent.entities?.position) {
    questions.push({
      field: 'position',
      question: '特效应用到哪里？',
      suggestions: [
        '整个视频',
        '开头部分',
        '结尾部分',
        '指定时间段'
      ],
      required: false
    });
    missingFields.push('position');
  } else {
    completeness += 20;
  }

  const needsClarification = questions.some(q => q.required);

  return {
    needsClarification,
    questions,
    completeness,
    missingFields
  };
}

/**
 * 格式化澄清消息
 */
export function formatClarificationMessage(result: ClarificationResult): string {
  if (!result.needsClarification) {
    return '';
  }

  let message = `我需要一些额外信息来更好地完成您的需求：\n\n`;

  result.questions.forEach((q, index) => {
    message += `${index + 1}. **${q.question}**\n`;

    if (q.suggestions && q.suggestions.length > 0) {
      message += `   可选项：\n`;
      q.suggestions.forEach(s => {
        message += `   • ${s}\n`;
      });
    }

    if (q.required) {
      message += `   ⚠️ *必填*\n`;
    }

    message += '\n';
  });

  message += `\n当前信息完整度：${result.completeness}%\n`;
  message += `\n💡 提示：您可以一次回答多个问题，或者选择"使用默认设置"让我自动处理。`;

  return message;
}
