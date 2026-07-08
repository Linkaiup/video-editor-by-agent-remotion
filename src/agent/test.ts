#!/usr/bin/env tsx

/**
 * 端到端测试脚本
 * 测试完整的视频创建流程
 */

import 'dotenv/config';
import { RemotionAgent } from './agent.js';

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║           🧪 Remotion Agent 端到端测试 🧪               ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const agent = new RemotionAgent();

  // 测试 1: 创建简单视频
  console.log('📝 测试 1: 创建简单视频');
  console.log('─────────────────────────────────────────────────────────\n');

  try {
    const result1 = await agent.processMessage('创建一个 3 秒的测试视频');
    console.log('\n✅ 测试 1 通过');
    console.log(`响应: ${result1.message.substring(0, 200)}...\n`);
  } catch (error) {
    console.error('❌ 测试 1 失败:', error instanceof Error ? error.message : error);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  // 测试 2: 查看指标
  console.log('📝 测试 2: 查看性能指标');
  console.log('─────────────────────────────────────────────────────────\n');

  try {
    const result2 = await agent.processMessage('/metrics');
    console.log('✅ 测试 2 通过');
    console.log(`响应: ${result2.message}\n`);
  } catch (error) {
    console.error('❌ 测试 2 失败:', error instanceof Error ? error.message : error);
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('🎉 测试完成！\n');
}

// 运行测试
runTests().catch(console.error);
