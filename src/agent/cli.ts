/**
 * CLI interface for the Remotion Agent
 */

// 首先加载环境变量
import 'dotenv/config';
import { createInterface } from 'readline';
import { RemotionAgent } from './agent.js';
import { createTracer } from './tracing.js';

const tracer = createTracer('CLI');

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🎬  Remotion Harness Agent CLI  🎬                ║
║                                                            ║
║      基于 DeepSeek 的 AI 视频编辑助手                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

使用自然语言输入您的视频编辑需求。
示例:
  - "创建一个 10 秒的视频并添加淡入效果"
  - "在片段之间添加缩放转场"
  - "对背景应用模糊效果"

命令:
  /help     - 显示帮助信息
  /metrics  - 显示性能指标
  /traces   - 显示最近的追踪记录
  /clear    - 清除对话历史
  /exit     - 退出 CLI

准备就绪！您想创建什么？
`);

  const agent = new RemotionAgent();
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n🎥 > ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    // Handle commands
    if (input.startsWith('/')) {
      await handleCommand(input, agent, rl);
      rl.prompt();
      return;
    }

    // Process as agent message
    try {
      console.log('\n⏳ Processing...\n');

      const response = await agent.processMessage(input);

      console.log(`\n✨ ${response.message}\n`);

      if (response.needsConfirmation && response.clarifications.length > 0) {
        console.log('❓ Clarifications needed:');
        response.clarifications.forEach((c, i) => {
          console.log(`   ${i + 1}. ${c}`);
        });
        console.log();
      }

      if (response.code) {
        console.log('📝 Generated code preview:');
        console.log('─'.repeat(60));
        console.log(response.code.substring(0, 300) + (response.code.length > 300 ? '...' : ''));
        console.log('─'.repeat(60));
        console.log();
      }

      if (response.validationResult?.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        response.validationResult.warnings.forEach((w: string) => {
          console.log(`   - ${w}`);
        });
        console.log();
      }
    } catch (error) {
      console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n\n👋 Thanks for using Remotion Agent! Goodbye.\n');
    process.exit(0);
  });
}

async function handleCommand(command: string, agent: RemotionAgent, rl: any) {
  const cmd = command.toLowerCase();

  switch (cmd) {
    case '/help':
      console.log(`
Available Commands:
  /help     - Show this help message
  /metrics  - Show agent performance metrics
  /traces   - Show recent operation traces
  /clear    - Clear conversation history
  /exit     - Exit the CLI

Example Requests:
  "Create a 5 second video with my-image.jpg"
  "Add a fade in effect at the beginning"
  "Apply zoom and blur effects"
  "Create an Instagram story with transitions"
      `);
      break;

    case '/metrics':
      const metrics = agent.getMetrics();
      console.log('\n📊 Agent Metrics:');
      console.log('─'.repeat(50));
      Object.entries(metrics).forEach(([module, data]) => {
        console.log(`\n${module}:`);
        console.log(`  Requests: ${data.requestCount}`);
        console.log(`  Success: ${data.successCount}`);
        console.log(`  Failures: ${data.failureCount}`);
        console.log(`  Avg Response Time: ${data.avgResponseTime.toFixed(2)}ms`);
      });
      console.log();
      break;

    case '/traces':
      const traces = agent.getTraces({ since: Date.now() - 60000 }); // Last minute
      console.log(`\n🔍 Recent Traces (last ${traces.length}):`);
      console.log('─'.repeat(50));
      traces.slice(-10).forEach((trace) => {
        const timestamp = new Date(trace.timestamp).toLocaleTimeString();
        console.log(`[${timestamp}] ${trace.event} (${trace.duration || 0}ms)`);
      });
      console.log();
      break;

    case '/clear':
      console.log('\n🗑️  Conversation history cleared.\n');
      break;

    case '/exit':
      console.log('\n👋 Goodbye!\n');
      rl.close();
      process.exit(0);
      break;

    default:
      console.log(`\n❌ Unknown command: ${command}`);
      console.log('Type /help for available commands.\n');
  }
}

// 检查必需的环境变量
if (!process.env.DEEPSEEK_API_KEY) {
  console.error('\n❌ 错误: 需要设置 DEEPSEEK_API_KEY 环境变量。\n');
  console.error('请在运行 CLI 之前设置：');
  console.error('  export DEEPSEEK_API_KEY=your-api-key\n');
  process.exit(1);
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
