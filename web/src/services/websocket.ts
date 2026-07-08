/**
 * WebSocket 客户端
 *
 * 处理实时通信
 */

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface ProgressEvent {
  sessionId: string;
  step: string;
  progress: number;
  message: string;
}

export interface LogEvent {
  sessionId: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

export interface CompletedEvent {
  sessionId: string;
  success: boolean;
  projectPath: string;
  message: string;
}

/**
 * 连接 WebSocket
 */
export function connectWebSocket(): Socket {
  if (socket) {
    return socket;
  }

  socket = io('http://localhost:3001', {
    transports: ['websocket'],
    reconnection: true,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('🔌 WebSocket disconnected');
  });

  return socket;
}

/**
 * 断开 WebSocket
 */
export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * 订阅会话进度
 */
export function subscribeSession(sessionId: string) {
  if (!socket) {
    throw new Error('WebSocket not connected');
  }

  socket.emit('subscribe', { sessionId });
}

/**
 * 取消订阅
 */
export function unsubscribeSession(sessionId: string) {
  if (!socket) {
    return;
  }

  socket.emit('unsubscribe', { sessionId });
}

/**
 * 监听进度更新
 */
export function onProgress(callback: (data: ProgressEvent) => void) {
  if (!socket) {
    throw new Error('WebSocket not connected');
  }

  socket.on('progress', callback);
}

/**
 * 监听日志消息
 */
export function onLog(callback: (data: LogEvent) => void) {
  if (!socket) {
    throw new Error('WebSocket not connected');
  }

  socket.on('log', callback);
}

/**
 * 监听完成通知
 */
export function onCompleted(callback: (data: CompletedEvent) => void) {
  if (!socket) {
    throw new Error('WebSocket not connected');
  }

  socket.on('completed', callback);
}

/**
 * 移除事件监听
 */
export function offEvent(event: string, callback?: (...args: any[]) => void) {
  if (!socket) {
    return;
  }

  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
}

export { socket };
