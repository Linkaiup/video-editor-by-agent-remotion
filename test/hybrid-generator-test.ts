/**
 * 自测脚本 - HybridCodeGenerator.decideStrategy()
 *
 * 测试各种输入情况，确保不会崩溃
 */

import { Beat } from '../src/agent/harness/artifacts/types.js';

// 模拟 HybridCodeGenerator 的 decideStrategy 逻辑
function decideStrategy(beat: Beat): 'llm' | 'template' {
  let score = 0;

  const complexTechniques = [
    'flip', '3d', 'perspective', 'particle', 'confetti',
    'bounce', 'spring', 'elastic', 'blur', 'color_shift'
  ];

  // 确保 techniques 是数组
  const techniques = Array.isArray(beat.techniques) ? beat.techniques : [];

  for (const technique of techniques) {
    // 确保 technique 是字符串
    if (typeof technique === 'string') {
      const techLower = technique.toLowerCase();
      if (complexTechniques.some(ct => techLower.includes(ct))) {
        score += 3;
      }
    }
  }

  // 2. 动画技巧数量
  if (techniques.length > 2) {
    score += 2;
  }

  // 3. 素材数量
  const assets = Array.isArray(beat.assets) ? beat.assets : [];
  if (assets.length > 2) {
    score += 1;
  }

  // 4. 转场效果
  const transitions = Array.isArray(beat.transitions) ? beat.transitions : [];
  if (transitions.length > 0) {
    score += 1;
  }

  // 5. 特殊音效
  const sfx = Array.isArray(beat.sfx) ? beat.sfx : [];
  if (sfx.length > 0) {
    score += 1;
  }

  return score >= 5 ? 'llm' : 'template';
}

// 测试用例
const testCases = [
  {
    name: '测试 1: 正常字符串数组（简单）',
    beat: {
      id: 'beat-1',
      name: 'Test',
      startTime: 0,
      endTime: 3,
      mood: 'happy',
      camera: 'medium',
      assets: [],
      techniques: ['fade_in', 'scale'],
      transitions: [],
      sfx: [],
      narration: 'test'
    },
    expected: 'template'
  },
  {
    name: '测试 2: 正常字符串数组（复杂）',
    beat: {
      id: 'beat-2',
      name: 'Test',
      startTime: 0,
      endTime: 3,
      mood: 'happy',
      camera: 'medium',
      assets: [],
      techniques: ['flip', '3d', 'perspective', 'particles'],
      transitions: [],
      sfx: [],
      narration: 'test'
    },
    expected: 'llm'
  },
  {
    name: '测试 3: 空数组',
    beat: {
      id: 'beat-3',
      name: 'Test',
      startTime: 0,
      endTime: 3,
      mood: 'happy',
      camera: 'medium',
      assets: [],
      techniques: [],
      transitions: [],
      sfx: [],
      narration: 'test'
    },
    expected: 'template'
  },
  {
    name: '测试 4: techniques 是 undefined',
    beat: {
      id: 'beat-4',
      name: 'Test',
      startTime: 0,
      endTime: 3,
      mood: 'happy',
      camera: 'medium',
      assets: [],
      techniques: undefined as any,
      transitions: [],
      sfx: [],
      narration: 'test'
    },
    expected: 'template'
  },
  {
    name: '测试 5: techniques 包含非字符串',
    beat: {
      id: 'beat-5',
      name: 'Test',
      startTime: 0,
      endTime: 3,
      mood: 'happy',
      camera: 'medium',
      assets: [],
      techniques: ['fade_in', 123 as any, { name: 'flip' } as any, 'scale'],
      transitions: [],
      sfx: [],
      narration: 'test'
    },
    expected: 'template'
  },
  {
    name: '测试 6: 复杂技巧 + 非字符串混合',
    beat: {
      id: 'beat-6',
      name: 'Test',
      startTime: 0,
      endTime: 3,
      mood: 'happy',
      camera: 'medium',
      assets: [],
      techniques: ['flip', '3d', null as any, 'perspective', undefined as any],
      transitions: [],
      sfx: [],
      narration: 'test'
    },
    expected: 'llm'
  },
  {
    name: '测试 7: 大量简单技巧（数量 > 2）',
    beat: {
      id: 'beat-7',
      name: 'Test',
      startTime: 0,
      endTime: 3,
      mood: 'happy',
      camera: 'medium',
      assets: [],
      techniques: ['fade_in', 'fade_out', 'zoom_in'],
      transitions: [],
      sfx: [],
      narration: 'test'
    },
    expected: 'template'
  },
  {
    name: '测试 8: 复杂技巧 + 多素材 + 转场',
    beat: {
      id: 'beat-8',
      name: 'Test',
      startTime: 0,
      endTime: 3,
      mood: 'happy',
      camera: 'medium',
      assets: ['a', 'b', 'c', 'd'],
      techniques: ['bounce'],
      transitions: ['crossfade'],
      sfx: [],
      narration: 'test'
    },
    expected: 'llm'
  },
];

// 运行测试
console.log('🧪 开始自测...\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  try {
    const result = decideStrategy(testCase.beat as Beat);
    const success = result === testCase.expected;

    if (success) {
      console.log(`✅ ${testCase.name}`);
      console.log(`   预期: ${testCase.expected}, 实际: ${result}\n`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}`);
      console.log(`   预期: ${testCase.expected}, 实际: ${result}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`💥 ${testCase.name}`);
    console.log(`   错误: ${error instanceof Error ? error.message : error}\n`);
    failed++;
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (failed === 0) {
  console.log('🎉 所有测试通过！');
  process.exit(0);
} else {
  console.log('❌ 有测试失败，请检查！');
  process.exit(1);
}
