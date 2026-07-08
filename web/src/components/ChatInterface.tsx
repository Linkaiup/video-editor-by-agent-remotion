/**
 * ChatInterface 组件
 *
 * 聊天界面
 */

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../services/api';
import { connectWebSocket, subscribeSession, onProgress, onCompleted, offEvent } from '../services/websocket';
import type { ChatResponse } from '../services/api';
import type { ProgressEvent, CompletedEvent } from '../services/websocket';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  sessionId?: string;
  uploadedFiles?: UploadResponse[];
  onSessionCreated?: (sessionId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId: initialSessionId,
  uploadedFiles,
  onSessionCreated
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化 WebSocket
  useEffect(() => {
    const socket = connectWebSocket();

    const handleProgress = (data: ProgressEvent) => {
      setProgress(data);
    };

    const handleCompleted = (data: CompletedEvent) => {
      setProgress(null);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);
    };

    onProgress(handleProgress);
    onCompleted(handleCompleted);

    return () => {
      offEvent('progress', handleProgress);
      offEvent('completed', handleCompleted);
    };
  }, []);

  // 订阅会话进度
  useEffect(() => {
    if (sessionId) {
      subscribeSession(sessionId);
    }
  }, [sessionId]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, progress]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 构建消息，包含已上传文件路径
      let messageText = input;

      if (uploadedFiles && uploadedFiles.length > 0) {
        const assetPaths = uploadedFiles.map(f => f.path).join(', ');
        messageText = `${input}\n\n使用素材：${assetPaths}`;
      }

      const response: ChatResponse = await sendMessage({
        message: messageText,
        sessionId
      });

      // 设置 sessionId
      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
        onSessionCreated?.(response.sessionId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ 发送消息时出错，请重试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Remotion Agent</h2>
        {sessionId && (
          <p className="text-sm text-gray-500">会话 ID: {sessionId.slice(0, 8)}...</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">👋 欢迎使用 Remotion Agent！</p>
            <p className="text-sm">输入您的需求，我会帮您创建视频</p>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Progress Indicator */}
        {progress && (
          <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                {progress.step}
              </span>
              <span className="text-sm text-blue-600">
                {progress.progress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="text-xs text-blue-700 mt-1">{progress.message}</p>
          </div>
        )}

        {loading && !progress && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息... (Shift+Enter 换行)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};
