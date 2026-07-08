/**
 * Express 服务器入口
 *
 * 提供 RESTful API 和 WebSocket 服务
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import chatRouter from './routes/chat.js';
import uploadRouter from './routes/upload.js';
import projectsRouter from './routes/projects.js';
import { setupWebSocket } from './websocket/handler.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（用于提供生成的视频和项目资源）
app.use('/outputs', express.static('outputs'));
app.use('/artifacts', express.static('artifacts'));
app.use('/projects', express.static('projects'));

// API 路由
app.use('/api/chat', chatRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/projects', projectsRouter);

// WebSocket 设置
setupWebSocket(io);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Remotion Agent Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📁 Static Files: /outputs, /artifacts, /projects`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

export { io };
