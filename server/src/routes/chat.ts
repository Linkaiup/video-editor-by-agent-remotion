/**
 * Chat API 路由
 *
 * 处理用户消息并返回 Agent 响应
 */

import { Router } from 'express';
import { RemotionAgent } from '../../../src/agent/agent.js';

const router = Router();

// 存储活跃的 Agent 实例
const agents = new Map<string, RemotionAgent>();

/**
 * POST /api/chat
 *
 * 发送消息给 Agent
 */
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    // 获取或创建 Agent 实例
    let agent = agents.get(sessionId);
    if (!agent) {
      agent = new RemotionAgent(sessionId);
      agents.set(sessionId, agent);
    }

    // 处理消息
    const response = await agent.processMessage(message);

    res.json({
      sessionId: agent.getContext().sessionId,
      message: response.message,
      needsConfirmation: response.needsConfirmation,
      clarifications: response.clarifications,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '处理消息时出错'
    });
  }
});

/**
 * GET /api/chat/:sessionId
 *
 * 获取会话信息
 */
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const agent = agents.get(sessionId);

  if (!agent) {
    return res.status(404).json({ error: '会话不存在' });
  }

  const context = agent.getContext();

  res.json({
    sessionId: context.sessionId,
    conversationHistory: context.conversationHistory,
    currentComposition: context.currentComposition,
  });
});

export default router;
