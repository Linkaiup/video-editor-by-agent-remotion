#!/bin/bash

# 测试脚本：自动测试 Agent 的各种功能

echo "🧪 开始测试 Remotion Harness Agent..."
echo ""

# 测试 1: 查询视频
echo "📋 测试 1: 查询现有视频"
echo "视频在哪？" | npm run agent:cli 2>&1 | grep -A 10 "最新视频" || echo "❌ 查询测试失败"
echo ""

# 测试 2: 编译检查
echo "📋 测试 2: TypeScript 编译"
npm run agent:build 2>&1 && echo "✅ 编译成功" || echo "❌ 编译失败"
echo ""

# 测试 3: 检查现有视频
echo "📋 测试 3: 检查输出目录"
ls -lh output/*.mp4 2>/dev/null && echo "✅ 发现视频文件" || echo "⚠️  没有视频文件"
echo ""

echo "🎉 测试完成！"
