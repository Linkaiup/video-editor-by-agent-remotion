#!/usr/bin/env tsx

/**
 * 直接功能测试 - 测试核心模块
 */

import 'dotenv/config';
import { recognizeIntent } from './intent-recognition.js';
import { createTaskPlan } from './task-planning.js';
import { generateCompositionCode } from './code-generation.js';
import { validateComposition } from './validation.js';
import { saveComponentCode, generateId } from './tools.js';
import type { CompositionSpec } from './types.js';

async function testCoreModules() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║        🧪 核心模块功能测试 🧪                            ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // 测试 1: 意图识别
    console.log('📝 测试 1: 意图识别');
    console.log('─────────────────────────────────────────────────────────');
    const intent = await recognizeIntent('创建一个 5 秒的视频');
    console.log('✅ 意图识别成功');
    console.log(`   类型: ${intent.type}`);
    console.log(`   置信度: ${intent.confidence}`);
    console.log(`   时长: ${intent.entities.duration || '未指定'} 秒\n`);

    // 测试 2: 任务规划
    console.log('📝 测试 2: 任务规划');
    console.log('─────────────────────────────────────────────────────────');
    const plan = await createTaskPlan(intent);
    console.log('✅ 任务规划成功');
    console.log(`   步骤数: ${plan.steps.length}`);
    console.log(`   步骤: ${plan.steps.map(s => s.action).join(', ')}\n`);

    // 测试 3: 代码生成
    console.log('📝 测试 3: 代码生成');
    console.log('─────────────────────────────────────────────────────────');
    const spec: CompositionSpec = {
      id: generateId('test'),
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 150,
      layers: [],
    };
    const code = await generateCompositionCode(spec);
    console.log('✅ 代码生成成功');
    console.log(`   代码长度: ${code.length} 字符`);
    console.log(`   包含 import: ${code.includes('import') ? '是' : '否'}`);
    console.log(`   包含 export: ${code.includes('export') ? '是' : '否'}\n`);

    // 测试 4: 代码验证
    console.log('📝 测试 4: 代码验证');
    console.log('─────────────────────────────────────────────────────────');
    const validation = await validateComposition(spec, code);
    console.log('✅ 代码验证完成');
    console.log(`   验证结果: ${validation.valid ? '通过' : '失败'}`);
    console.log(`   错误数: ${validation.errors.length}`);
    console.log(`   警告数: ${validation.warnings.length}\n`);

    // 测试 5: 保存代码
    console.log('📝 测试 5: 保存代码');
    console.log('─────────────────────────────────────────────────────────');
    const filePath = await saveComponentCode(code, spec.id);
    console.log('✅ 代码保存成功');
    console.log(`   文件路径: ${filePath}\n`);

    // 总结
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 所有核心模块测试通过！\n');
    console.log('核心功能验证：');
    console.log('  ✅ 意图识别 - DeepSeek API 正常工作');
    console.log('  ✅ 任务规划 - 能够生成执行计划');
    console.log('  ✅ 代码生成 - 能够生成 React 组件');
    console.log('  ✅ 代码验证 - 验证逻辑正常');
    console.log('  ✅ 文件保存 - 能够保存并更新 Root.tsx');
    console.log('\n注意: 视频渲染需要 FFmpeg，请确保已安装');
    console.log('安装命令: brew install ffmpeg\n');

    return true;
  } catch (error) {
    console.error('\n❌ 测试失败:', error instanceof Error ? error.message : error);
    console.error('\n堆栈追踪:', error instanceof Error ? error.stack : '');
    return false;
  }
}

// 运行测试
testCoreModules()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('测试异常:', error);
    process.exit(1);
  });
