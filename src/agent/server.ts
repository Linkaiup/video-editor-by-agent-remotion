/**
 * Server entry point - HTTP API for the Remotion Agent
 */

// 首先加载环境变量
import 'dotenv/config';
import { createServer } from 'http';
import { RemotionAgent } from './agent.js';
import { createTracer } from './tracing.js';

const tracer = createTracer('Server');
const PORT = process.env.PORT || 3001;

interface RequestBody {
  message: string;
  sessionId?: string;
}

// Store active agent sessions
const sessions = new Map<string, RemotionAgent>();

const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', version: '0.1.0' }));
    return;
  }

  // Metrics endpoint
  if (req.url === '/metrics' && req.method === 'GET') {
    const sessionId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('sessionId');

    if (sessionId && sessions.has(sessionId)) {
      const agent = sessions.get(sessionId)!;
      const metrics = agent.getMetrics();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(metrics));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
    }
    return;
  }

  // Traces endpoint
  if (req.url?.startsWith('/traces') && req.method === 'GET') {
    const sessionId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('sessionId');

    if (sessionId && sessions.has(sessionId)) {
      const agent = sessions.get(sessionId)!;
      const traces = agent.getTraces();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(traces));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
    }
    return;
  }

  // Chat endpoint
  if (req.url === '/chat' && req.method === 'POST') {
    const trace = tracer.startTrace('handle_chat', {});

    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }

      const data: RequestBody = JSON.parse(body);

      if (!data.message) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Message is required' }));
        return;
      }

      // Get or create agent session
      const sessionId = data.sessionId || `session-${Date.now()}`;
      let agent = sessions.get(sessionId);

      if (!agent) {
        agent = new RemotionAgent(sessionId);
        sessions.set(sessionId, agent);
        tracer.log('info', 'Created new agent session', { sessionId });
      }

      // Process message
      tracer.log('info', 'Processing message', { sessionId, message: data.message });
      const response = await agent.processMessage(data.message);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          sessionId,
          response,
          context: agent.getContext(),
        })
      );

      trace.end({ success: true, sessionId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      tracer.log('error', 'Error handling chat', { error: errorMessage });
      trace.end({ error: errorMessage });

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: errorMessage }));
    }
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`\n🎬 Remotion Agent Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ Chat endpoint: POST http://localhost:${PORT}/chat`);
  console.log(`✓ Metrics: GET http://localhost:${PORT}/metrics?sessionId=<id>`);
  console.log(`✓ Traces: GET http://localhost:${PORT}/traces?sessionId=<id>`);
  console.log(`\nReady to process video editing requests! 🚀\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  tracer.log('info', 'SIGTERM received, shutting down gracefully');
  server.close(() => {
    tracer.log('info', 'Server closed');
    process.exit(0);
  });
});
