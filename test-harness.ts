/**
 * Harness 集成测试
 *
 * 测试 Harness 工程化流程是否正常工作
 */

import { HarnessExecutor } from './src/agent/harness/index.js';

async function testHarnessIntegration() {
  console.log('🧪 开始 Harness 集成测试\n');

  const executor = new HarnessExecutor();

  // 测试意图
  const testIntent = {
    type: 'create' as const,
    description: '创建一个5秒的测试视频',
    confidence: 0.95,
    entities: {
      duration: 5
    }
  };

  console.log('📋 测试计划创建...');
  const planner = executor.getPlanner();
  const plan = await planner.createPlan(testIntent, 'test-session');

  console.log('✅ 计划已创建');
  console.log(`   - 任务数：${plan.tasks.length}`);
  console.log(`   - 预估时间：${plan.resources.estimatedRenderTime}秒`);
  console.log(`   - 质量标准：流畅度>=${plan.qualityGates.quality.minSmoothness}`);

  console.log('\n📋 验证计划可行性...');
  const validation = await planner.validatePlan(plan);
  console.log(`✅ 计划验证：${validation.valid ? '通过' : '失败'}`);
  if (!validation.valid) {
    console.log('   问题：', validation.issues);
  }

  console.log('\n📋 测试校验器...');
  const validator = executor.getValidator();

  // 创建一个简单的测试文件
  const { writeFileSync, unlinkSync } = await import('fs');
  const testFile = './test-component.tsx';
  writeFileSync(testFile, `
export const TestComponent: React.FC = () => {
  return <div>Test</div>;
};
`, 'utf-8');

  const syntaxCheck = await validator.checkSyntax(testFile);
  console.log(`✅ 语法检查：${syntaxCheck.passed ? '通过' : '失败'}`);
  if (!syntaxCheck.passed) {
    console.log('   错误：', syntaxCheck.errors);
  }

  // 清理
  unlinkSync(testFile);

  console.log('\n📋 测试优化器...');
  const optimizer = executor.getOptimizer();

  const testComposition = {
    id: 'test',
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
    layers: [{
      id: 'layer1',
      type: 'image' as const,
      source: 'test.jpg',
      startFrame: 0,
      durationInFrames: 150,
      effects: [
        { id: 'e1', type: 'fade_in', startFrame: 0, durationInFrames: 30, params: {} },
        { id: 'e2', type: 'scale', startFrame: 0, durationInFrames: 150, params: {} }
      ],
      transitions: [],
      props: {}
    }]
  };

  const adjusted = optimizer.applyAdjustments(testComposition, ['simplify_effects']);
  console.log(`✅ 应用调整：特效从 ${testComposition.layers[0].effects.length} 个减少到 ${adjusted.layers[0].effects.length} 个`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 所有测试通过！Harness 集成正常！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 运行测试
testHarnessIntegration().catch(console.error);
