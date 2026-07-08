/**
 * 测试路径解析逻辑
 */

import { resolve } from 'path';

function resolveAssetPath(src: string, projectRoot: string): string {
  if (!src) {
    return '';
  }

  // 如果是 HTTP/HTTPS URL
  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const url = new URL(src);
      const urlPath = url.pathname;

      // 找到 server 目录
      const serverDir = resolve(projectRoot, '../..');

      // urlPath 从第一个 / 后开始
      const relativePath = urlPath.substring(1);

      // 拼接
      return resolve(serverDir, relativePath);
    } catch (error) {
      return src;
    }
  }

  // 如果已经是绝对路径
  if (src.startsWith('/')) {
    return src;
  }

  // 相对路径
  return resolve(projectRoot, src);
}

// 测试用例
const testCases = [
  {
    name: '测试 1: HTTP URL (localhost:3001)',
    src: 'http://localhost:3001/projects/session-xxx/artifacts/capture/assets/image.jpg',
    projectRoot: '/Users/bingerlin/server/projects/session-xxx',
    expected: '/Users/bingerlin/server/projects/session-xxx/artifacts/capture/assets/image.jpg'
  },
  {
    name: '测试 2: HTTP URL (localhost:3000)',
    src: 'http://localhost:3000/projects/session-yyy/artifacts/capture/assets/photo.jpg',
    projectRoot: '/Users/bingerlin/server/projects/session-yyy',
    expected: '/Users/bingerlin/server/projects/session-yyy/artifacts/capture/assets/photo.jpg'
  },
  {
    name: '测试 3: 相对路径',
    src: 'artifacts/capture/assets/image.jpg',
    projectRoot: '/Users/bingerlin/server/projects/session-xxx',
    expected: '/Users/bingerlin/server/projects/session-xxx/artifacts/capture/assets/image.jpg'
  },
  {
    name: '测试 4: 绝对路径',
    src: '/Users/bingerlin/server/projects/session-xxx/artifacts/capture/assets/image.jpg',
    projectRoot: '/Users/bingerlin/server/projects/session-xxx',
    expected: '/Users/bingerlin/server/projects/session-xxx/artifacts/capture/assets/image.jpg'
  }
];

console.log('🧪 开始测试路径解析...\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const result = resolveAssetPath(testCase.src, testCase.projectRoot);
  const success = result === testCase.expected;

  if (success) {
    console.log(`✅ ${testCase.name}`);
    console.log(`   输入: ${testCase.src}`);
    console.log(`   输出: ${result}\n`);
    passed++;
  } else {
    console.log(`❌ ${testCase.name}`);
    console.log(`   输入: ${testCase.src}`);
    console.log(`   预期: ${testCase.expected}`);
    console.log(`   实际: ${result}\n`);
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
