/**
 * 测试 extractEffects 方法
 */

function extractEffects(effects: any): string[] {
  if (!effects) {
    return [];
  }

  // 如果已经是数组
  if (Array.isArray(effects)) {
    // 过滤并转换为字符串
    return effects
      .filter(e => e != null)
      .map(e => {
        // 如果是对象，尝试提取 name 或 type 字段
        if (typeof e === 'object') {
          return e.name || e.type || e.id || String(e);
        }
        // 如果是字符串，直接返回
        if (typeof e === 'string') {
          return e;
        }
        // 其他类型转换为字符串
        return String(e);
      })
      .filter(e => e && e.length > 0);
  }

  // 如果是单个值，转换为数组
  if (typeof effects === 'string') {
    return [effects];
  }

  // 如果是对象，尝试提取值
  if (typeof effects === 'object') {
    const name = effects.name || effects.type || effects.id;
    if (name && typeof name === 'string') {
      return [name];
    }
  }

  return [];
}

// 测试用例
const testCases = [
  {
    name: '测试 1: 字符串数组',
    input: ['flip', '3d', 'perspective', 'particles'],
    expected: ['flip', '3d', 'perspective', 'particles']
  },
  {
    name: '测试 2: 对象数组（有 name 字段）',
    input: [
      { name: 'flip', value: 180 },
      { name: '3d', enabled: true },
      { name: 'particles', count: 100 }
    ],
    expected: ['flip', '3d', 'particles']
  },
  {
    name: '测试 3: 对象数组（有 type 字段）',
    input: [
      { type: 'flip' },
      { type: '3d' },
      { type: 'particles' }
    ],
    expected: ['flip', '3d', 'particles']
  },
  {
    name: '测试 4: 混合数组',
    input: [
      'flip',
      { name: '3d' },
      'perspective',
      { type: 'particles' },
      null,
      undefined
    ],
    expected: ['flip', '3d', 'perspective', 'particles']
  },
  {
    name: '测试 5: 空数组',
    input: [],
    expected: []
  },
  {
    name: '测试 6: null',
    input: null,
    expected: []
  },
  {
    name: '测试 7: undefined',
    input: undefined,
    expected: []
  },
  {
    name: '测试 8: 单个字符串',
    input: 'flip',
    expected: ['flip']
  },
  {
    name: '测试 9: 单个对象',
    input: { name: 'flip' },
    expected: ['flip']
  },
  {
    name: '测试 10: 数字数组',
    input: [1, 2, 3],
    expected: ['1', '2', '3']
  }
];

console.log('🧪 开始测试 extractEffects...\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const result = extractEffects(testCase.input);
  const success = JSON.stringify(result) === JSON.stringify(testCase.expected);

  if (success) {
    console.log(`✅ ${testCase.name}`);
    console.log(`   输入: ${JSON.stringify(testCase.input)}`);
    console.log(`   输出: ${JSON.stringify(result)}\n`);
    passed++;
  } else {
    console.log(`❌ ${testCase.name}`);
    console.log(`   输入: ${JSON.stringify(testCase.input)}`);
    console.log(`   预期: ${JSON.stringify(testCase.expected)}`);
    console.log(`   实际: ${JSON.stringify(result)}\n`);
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
