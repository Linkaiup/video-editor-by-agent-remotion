/**
 * 测试新的路径解析逻辑
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

      console.log('解析:', { src, projectRoot, urlPath });

      // 从 urlPath 中找到 projects 后面的部分
      const match = urlPath.match(/\/projects\/[^\/]+\/(.*)/);
      if (match) {
        const result = resolve(projectRoot, match[1]);
        console.log('匹配成功:', { match: match[1], result });
        return result;
      }

      // 降级
      console.log('匹配失败，使用降级');
      return resolve(projectRoot, urlPath.substring(1));
    } catch (error) {
      return src;
    }
  }

  if (src.startsWith('/')) {
    return src;
  }

  return resolve(projectRoot, src);
}

// 测试用例
const testCases = [
  {
    name: '测试 1: HTTP URL - 正常路径',
    src: 'http://localhost:3001/projects/session-xxx/artifacts/capture/assets/image.jpg',
    projectRoot: '/Users/bingerlin/visCodeClaudeProject/video-editor-by-agent-remotion/server/projects/session-xxx',
    expected: '/Users/bingerlin/visCodeClaudeProject/video-editor-by-agent-remotion/server/projects/session-xxx/artifacts/capture/assets/image.jpg'
  },
  {
    name: '测试 2: 相对路径',
    src: 'artifacts/capture/assets/image.jpg',
    projectRoot: '/Users/bingerlin/server/projects/session-xxx',
    expected: '/Users/bingerlin/server/projects/session-xxx/artifacts/capture/assets/image.jpg'
  }
];

console.log('🧪 开始测试路径解析...\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\n${testCase.name}`);
  const result = resolveAssetPath(testCase.src, testCase.projectRoot);
  const success = result === testCase.expected;

  if (success) {
    console.log(`✅ 通过`);
    console.log(`   结果: ${result}\n`);
    passed++;
  } else {
    console.log(`❌ 失败`);
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
  console.log('❌ 有测试失败！');
  process.exit(1);
}
