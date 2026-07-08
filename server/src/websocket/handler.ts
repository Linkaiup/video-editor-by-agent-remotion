/**
 * WebSocket 事件处理器
 *
 * 处理实时通信
 */

import { Server, Socket } from 'socket.io';
import { RemotionAgent } from '../../../src/agent/agent.js';

// 存储活跃的 Agent 实例
const agents = new Map<string, RemotionAgent>();

// 存储订阅关系
const subscriptions = new Map<string, Set<string>>();

export function setupWebSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    /**
     * 客户端发送消息
     */
    socket.on('chat', async (data: { sessionId?: string; message: string }) => {
      try {
        const { sessionId: requestedSessionId, message } = data;

        // 获取或创建 Agent
        let agent = requestedSessionId ? agents.get(requestedSessionId) : null;
        if (!agent) {
          agent = new RemotionAgent(requestedSessionId);
          agents.set(agent.getContext().sessionId, agent);
        }

        const sessionId = agent.getContext().sessionId;

        // 发送处理中状态
        socket.emit('processing', { sessionId, message });

        // 处理消息
        const response = await agent.processMessage(message);

        // 发送响应
        socket.emit('response', {
          sessionId,
          message: response.message,
          needsConfirmation: response.needsConfirmation,
          clarifications: response.clarifications,
        });

      } catch (error) {
        socket.emit('error', {
          message: error instanceof Error ? error.message : '处理消息时出错'
        });
      }
    });

    /**
     * 订阅会话进度
     */
    socket.on('subscribe', (data: { sessionId: string }) => {
      const { sessionId } = data;

      if (!subscriptions.has(sessionId)) {
        subscriptions.set(sessionId, new Set());
      }

      subscriptions.get(sessionId)!.add(socket.id);
      console.log(`📡 Client ${socket.id} subscribed to session ${sessionId}`);

      socket.emit('subscribed', { sessionId });
    });

    /**
     * 取消订阅
     */
    socket.on('unsubscribe', (data: { sessionId: string }) => {
      const { sessionId } = data;

      if (subscriptions.has(sessionId)) {
        subscriptions.get(sessionId)!.delete(socket.id);
        console.log(`📡 Client ${socket.id} unsubscribed from session ${sessionId}`);
      }

      socket.emit('unsubscribed', { sessionId });
    });

    /**
     * 客户端断开连接
     */
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);

      // 清理订阅
      subscriptions.forEach((sockets, sessionId) => {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          subscriptions.delete(sessionId);
        }
      });
    });
  });

  console.log('✅ WebSocket handler initialized');
}

/**
 * 广播进度更新
 */
export function broadcastProgress(
  io: Server,
  sessionId: string,
  data: {
    step: string;
    progress: number;
    message: string;
  }
) {
  const sockets = subscriptions.get(sessionId);
  if (sockets) {
    sockets.forEach(socketId => {
      io.to(socketId).emit('progress', { sessionId, ...data });
    });
  }
}

/**
 * 广播日志消息
 */
export function broadcastLog(
  io: Server,
  sessionId: string,
  data: {
    level: 'info' | 'warn' | 'error';
    message: string;
  }
) {
  const sockets = subscriptions.get(sessionId);
  if (sockets) {
    sockets.forEach(socketId => {
      io.to(socketId).emit('log', {
        sessionId,
        ...data,
        timestamp: new Date().toISOString()
      });
    });
  }
}

/**
 * 广播完成通知
 */
export function broadcastCompleted(
  io: Server,
  sessionId: string,
  data: {
    success: boolean;
    projectPath: string;
    message: string;
  }
) {
  const sockets = subscriptions.get(sessionId);
  if (sockets) {
    sockets.forEach(socketId => {
      io.to(socketId).emit('completed', { sessionId, ...data });
    });
  }
}
