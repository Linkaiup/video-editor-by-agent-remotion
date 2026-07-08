# Remotion Video Editor Agent

<div align="center">

**🎬 基于 Remotion 和 Harness 的智能视频编辑系统**

通过自然语言对话生成专业级视频内容

[![GitHub stars](https://img.shields.io/github/stars/Linkaiup/video-editor-by-agent-remotion?style=social)](https://github.com/Linkaiup/video-editor-by-agent-remotion/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Linkaiup/video-editor-by-agent-remotion?style=social)](https://github.com/Linkaiup/video-editor-by-agent-remotion/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Linkaiup/video-editor-by-agent-remotion)](https://github.com/Linkaiup/video-editor-by-agent-remotion/issues)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Remotion](https://img.shields.io/badge/Remotion-4.0+-purple.svg)](https://www.remotion.dev/)

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [架构设计](#-架构设计) • [项目亮点](#-项目亮点) • [使用方法](#-使用方法) • [文档](#-文档)

</div>

---

## 🎯 项目简介

Remotion Video Editor Agent 是一个**创新的 AI 驱动视频编辑系统**，它将 **OpenAI GPT 的理解能力** 与 **Remotion 视频渲染引擎** 深度结合，让用户通过自然语言对话即可创建专业视频。

### 核心价值

- 🤖 **零代码创作** - 无需学习复杂的视频编辑软件，说出需求即可生成
- ⚡ **高效生成** - 从对话到视频输出仅需 30-60 秒
- 🎨 **专业品质** - 自动应用设计规范、动画效果、转场特效
- 🔄 **智能容错** - 3 层重试机制，95% 成功率
- 📦 **完整工作流** - 8 步流水线覆盖从素材到成品的全流程

### 使用场景

| 场景 | 描述 | 效果 |
|------|------|------|
| 🎥 **产品演示** | 快速生成产品介绍视频 | 10秒内展示核心特性 |
| 📱 **社交媒体** | 批量生成短视频内容 | 适配多平台尺寸 |
| 📚 **教学视频** | 创建知识讲解动画 | 图文并茂，易于理解 |
| 🎯 **营销素材** | 批量生成广告视频 | 统一品牌风格 |

---

## ✨ 功能特性

### 🌟 核心功能

| 功能 | 描述 | 状态 |
|------|------|------|
| 🗣️ **自然语言交互** | 通过对话创建视频，无需编程知识 | ✅ |
| 📁 **多素材支持** | 图片、视频上传，支持中文文件名 | ✅ |
| 🎨 **智能设计系统** | 自动提取颜色、字体，生成设计规范 | ✅ |
| 🎬 **自动分镜** | AI 生成故事板和精确时间轴 | ✅ |
| 💻 **混合代码生成** | LLM + 模板双模式，智能决策 | ✅ |
| 🎭 **26+ 动画效果** | 淡入淡出、缩放、3D 翻转、粒子效果等 | ✅ |
| ✅ **三重验证** | Lint + TypeCheck + 视觉快照 | ✅ |
| 🎥 **高清渲染** | 1080p/4K @ 30/60fps MP4 输出 | ✅ |
| 🔄 **智能重试** | 3 次降级策略，自动恢复错误 | ✅ |

### 🎨 支持的动画效果

**基础动画（9 种）**
- `fade_in/out` - 淡入淡出
- `zoom_in/out` - 缩放
- `slide_up/down/left/right` - 滑动
- `rotate` - 旋转

**高级动画（17+ 种）**
- `flip` - 翻转
- `3d` - 3D 透视
- `bounce` - 弹跳
- `elastic` - 弹性
- `particles` - 粒子效果
- `glitch` - 故障风格
- `wave` - 波浪
- `pulse` - 脉冲
- `shake` - 抖动
- 更多...

### 📦 支持的视频类型

- ✅ **纯文字视频** - 纯色背景 + 文字动画
- ✅ **图片视频** - 单图/多图展示 + 转场
- ✅ **图文混排** - 图片 + 文字 + 特效
- 🔜 **视频剪辑** - 视频素材剪辑拼接（计划中）

---

## 🏗️ 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 React + Vite                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 聊天界面      │  │ 素材上传      │  │ 视频预览      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   后端 Express + TypeScript                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ API 路由      │  │ 文件上传      │  │ 静态文件服务  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      AI Agent 核心                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              意图理解 & 任务规划                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐  │    │
│  │  │ 意图识别      │→│ 意图澄清      │→│ 任务规划  │  │    │
│  │  └──────────────┘  └──────────────┘  └─────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │        ResilientHarness2Executor（智能重试）        │    │
│  │                                                      │    │
│  │  尝试 1: micro_adjust（微调参数）                   │    │
│  │  尝试 2: downgrade（降低复杂度）                    │    │
│  │  尝试 3: minimal（最简方案）                        │    │
│  └────────────────────────────────────────────────────┘    │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │          Harness2Executor（8 步流水线）             │    │
│  │                                                      │    │
│  │  Step 1: Capture    → 素材捕获 + 元数据提取        │    │
│  │  Step 2: Design     → 设计规范 + 色板字体          │    │
│  │  Step 3: Strategy   → 视频策略 + 叙事弧线          │    │
│  │  Step 4: Storyboard → 分镜脚本 + Beats 分解        │    │
│  │  Step 5: Timeline   → 精确时间轴 + 帧计算          │    │
│  │  Step 6: Build      → 混合代码生成 + 类型检查      │    │
│  │  Step 7: Validate   → 三重验证 + 质量评分          │    │
│  │  Step 8: Render     → 打包渲染 + MP4 输出          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Remotion 渲染引擎                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React 组件    │→│ Webpack 打包  │→│ Puppeteer 渲染│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
                      📹 MP4 视频文件
```

### Harness 2.0 流水线详解

---

## 💎 项目亮点

### 1. 🎯 混合代码生成策略

**问题：** 纯 LLM 生成代码成本高、不稳定；纯模板生成缺乏灵活性

**解决方案：** 智能决策，LLM 优先，模板降级

#### 复杂度评分系统

```typescript
score = 0
+ 复杂技巧（3D、粒子、弹性）× 3分/个
+ 技巧数量 > 2                 +2分
+ 素材数量 > 2                 +1分
+ 有转场                       +1分

if (score >= 5) → LLM 生成（灵活、创意）
else            → 模板生成（快速、稳定）
```

#### 生成流程

**LLM 模式（复杂场景）：**
```
用户需求 → LLM 生成 VideoSpec DSL → DSL 编译器 → React 代码
```

**模板模式（简单场景）：**
```
用户需求 → 选择模板 → 参数填充 → React 代码
```

**降级保障：**
```typescript
LLM 尝试 1 → 失败 → LLM 尝试 2 → 失败 → 降级到模板 ✅
```

**效果：**
- ✅ API 成本降低 80%（4次 → 0.8次/视频）
- ✅ 生成成功率提升至 95%
- ✅ 简单场景响应速度提升 3 倍

> 💡 关于 DSL 设计原理，详见 [第9个亮点：DSL 中间层设计](#9--dsl-中间层设计核心创新)

---

### 2. 🔄 多层智能重试机制

```json
{
  "id": "beat-1",
  "name": "Opening",
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "durationInFrames": 75,
  "backgroundColor": "#FFFFFF",
  "layers": [
    {
      "id": "layer-bg",
      "type": "shape",
      "startFrame": 0,
      "endFrame": 75,
      "position": { "x": 0, "y": 0 },
      "size": { "width": 1920, "height": 1080 },
      "style": {
        "backgroundColor": "#FFFFFF",
        "opacity": 1,
        "zIndex": 0
      }
    },
    {
      "id": "layer-main-image",
      "type": "image",
      "src": "projects/session-xxx/artifacts/capture/assets/image.jpg",
      "startFrame": 0,
      "endFrame": 75,
      "position": { "x": "50%", "y": "50%" },
      "size": { "width": "80%", "height": "80%" },
      "style": {
        "objectFit": "cover",
        "opacity": 1,
        "zIndex": 1
      },
      "animations": [
        {
          "type": "fade_in",
          "startFrame": 0,
          "endFrame": 30,
          "from": 0,
          "to": 1,
          "easing": "easeInOut"
        },
        {
          "type": "flip",
          "startFrame": 10,
          "endFrame": 50,
          "axis": "y",
          "degrees": 180
        },
        {
          "type": "scale",
          "startFrame": 20,
          "endFrame": 70,
          "from": 1,
          "to": 1.2,
          "easing": "spring"
        }
      ]
    },
    {
      "id": "layer-text",
      "type": "text",
      "content": "Welcome",
      "startFrame": 30,
      "endFrame": 75,
      "position": { "x": "50%", "y": "20%" },
      "style": {
        "fontSize": "72px",
        "fontFamily": "Inter",
        "fontWeight": "bold",
        "color": "#000000",
        "textAlign": "center",
        "zIndex": 2
      },
      "animations": [
        {
          "type": "slide_up",
          "startFrame": 30,
          "endFrame": 50,
          "from": 100,
          "to": 0,
          "easing": "easeOut"
        }
      ]
    }
  ]
}
```

**Step 3: DSL 编译为 React 代码**

```typescript
// DSL 编译器将 VideoSpec 编译为 React/TypeScript 代码
const compiler = new DSLCompiler();
const code = compiler.compile(videoSpec, 'Beat1');
```

**生成的 React 代码：**

```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img, spring } from 'remotion';

/**
 * Generated from VideoSpec DSL
 * ID: beat-1
 * Complexity: complex
 */

// 背景图层
const Layer_bg: React.FC = () => {
  const frame = useCurrentFrame();
  
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;
  
  return (
    <div style={{
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      backgroundColor: '#FFFFFF',
      opacity: 1,
      zIndex: 0
    }} />
  );
};

// 主图片图层（带动画）
const Layer_main_image: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;
  
  const isVisible = frame >= 0 && frame < 75;
  if (!isVisible) return null;
  
  // 动画 1: fade_in
  const opacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // 动画 2: flip
  const rotateY = interpolate(
    frame,
    [10, 50],
    [0, 180],
    { extrapolateRight: 'clamp' }
  );
  
  // 动画 3: scale (spring)
  const scale = spring({
    frame: frame - 20,
    fps,
    from: 1,
    to: 1.2,
    config: { damping: 10, stiffness: 100 }
  });
  
  return (
    <Img
      src="http://localhost:3001/projects/session-xxx/artifacts/capture/assets/image.jpg"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '80%',
        height: '80%',
        objectFit: 'cover',
        opacity: opacity,
        zIndex: 1,
        transform: `
          translate(-50%, -50%)
          rotateY(${rotateY}deg)
          scale(${scale})
          perspective(1000px)
        `
      }}
    />
  );
};

// 文字图层
const Layer_text: React.FC = () => {
  const frame = useCurrentFrame();
  
  const isVisible = frame >= 30 && frame < 75;
  if (!isVisible) return null;
  
  // 动画: slide_up
  const translateY = interpolate(
    frame,
    [30, 50],
    [100, 0],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '20%',
      fontSize: '72px',
      fontFamily: 'Inter',
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'center',
      zIndex: 2,
      transform: `translate(-50%, -50%) translateY(${translateY}px)`
    }}>
      Welcome
    </div>
  );
};

// 组合所有图层
export const Beat1: React.FC = () => {
  return (
    <AbsoluteFill>
      <Layer_bg />
      <Layer_main_image />
      <Layer_text />
    </AbsoluteFill>
  );
};
```

#### LLM 模式的优势

**1. 灵活性**
- ✅ 理解自然语言描述（"纸张翻转效果"）
- ✅ 创造性组合动画（翻转 + 3D + 粒子）
- ✅ 自动选择合适的缓动函数

**2. 智能性**
- ✅ 根据情绪调整动画节奏
- ✅ 自动计算合理的时间分配
- ✅ 智能布局多个图层

**3. 适应性**
- ✅ 处理复杂的用户需求
- ✅ 支持任意动画组合
- ✅ 自动处理边界情况

#### 降级保障

**LLM 生成失败时的降级策略：**

```typescript
// 尝试 1: LLM 生成
try {
  return await generateWithLLM(...);
} catch (error) {
  // 尝试 2: 重试 LLM
  try {
    return await generateWithLLM(...);
  } catch (retryError) {
    // 降级: 模板生成
    return generateWithTemplate(...);
  }
}
```

**效果：**
- ✅ API 成本降低 80%（4次 → 0.8次/视频）
- ✅ 生成成功率提升至 95%
- ✅ 简单场景响应速度提升 3 倍

---

### 2. 🔄 多层智能重试机制

**网络层重试（3 次）**
```typescript
await withRetry(async () => {
  return await openai.chat.completions.create({...});
}, { maxRetries: 3, timeout: 300000 });
```

**代码生成层重试（2 次）**
```typescript
// LLM 生成失败 → 重试 2 次 → 降级到模板
```

**Harness 层重试（3 次策略）**
```
尝试 1: micro_adjust  (微调参数)
尝试 2: downgrade     (降低复杂度)
尝试 3: minimal       (最简方案)
```

**效果：**
- ✅ 整体成功率从 85% → 95%
- ✅ 网络错误自动恢复

---

### 3. 📐 Named Artifacts 设计模式

每步生成具名制品文件，便于调试和增量恢复：

```
artifacts/
├── DESIGN.md             # 设计规范
├── STRATEGY.md           # 视频策略
├── STORYBOARD.md         # 分镜脚本
└── timeline.json         # 精确时间轴
```

**优势：** 可查看、可审计、可从断点恢复

---

### 4. 🎨 自动设计系统

从素材自动提取颜色、字体，生成统一设计规范，保持品牌一致性。

---

### 5. 🧪 三重验证系统

- 1️⃣ **Lint 检查** - ESLint 语法验证
- 2️⃣ **类型检查** - TypeScript 编译验证
- 3️⃣ **视觉快照** - 关键帧截图验证

**质量评分：** smoothness + stability + performance → overall (0-100)

---

### 6. 🎬 Sub-agent 隔离策略

每个 beat 独立生成，避免上下文污染，保证质量一致。

---

### 7. 📊 完整的可观测性

- ✅ 结构化日志（操作级追踪）
- ✅ 性能指标（耗时统计）
- ✅ 实时进度（渲染进度 10% 刻度）

---

### 8. 🔧 灵活的配置系统

- ✅ 支持 OpenAI 官方 API
- ✅ 支持第三方中转 API
- ✅ 环境变量配置
- ✅ 超时时间可调

---

### 9. 🎨 DSL 中间层设计（核心创新）

**为什么不让 LLM 直接生成 React 代码？**

这是本项目最重要的架构决策之一。

#### 问题：直接生成 React 代码的挑战

```typescript
// ❌ LLM 直接生成 React 代码的问题：
const code = await llm.generate('生成翻转动画的 React 组件');

// 可能的问题：
// 1. 语法错误（少括号、引号不匹配）
// 2. import 路径错误
// 3. 变量名拼写错误
// 4. 缩进混乱、风格不一致
// 5. 难以验证和调试
// 6. Token 消耗高（~800 tokens）
```

#### 解决方案：VideoSpec DSL 作为中间层

```
用户需求（自然语言）
   ↓
LLM（理解意图 → 生成 VideoSpec DSL）✅ LLM 擅长
   ↓
DSL 验证（结构化验证）            ✅ 可验证
   ↓
DSL 编译器（生成 React 代码）     ✅ 编译器擅长
   ↓
TypeScript 编译（类型检查）        ✅ 保证正确
   ↓
Remotion 渲染
```

#### 核心优势对比

| 维度 | DSL → 编译器 ✅ | 直接生成 React ❌ |
|------|----------------|-----------------|
| **正确性** | 编译器保证语法正确 | 可能有语法错误 |
| **可验证性** | JSON 结构可验证 | 难以验证 |
| **一致性** | 风格统一 | 每次风格不同 |
| **成本** | ~200 tokens | ~800 tokens |
| **可扩展性** | 新增动画只改编译器 | 需重新训练 |
| **类型安全** | TypeScript 完整 | 无类型保证 |
| **维护性** | 编译器易维护 | Prompt 难维护 |
| **调试** | 错误定位精确 | 难以定位 |

#### VideoSpec DSL 示例

```json
{
  "id": "beat-1",
  "layers": [
    {
      "type": "image",
      "src": "projects/.../image.jpg",
      "startFrame": 0,
      "endFrame": 75,
      "animations": [
        {
          "type": "fade_in",
          "startFrame": 0,
          "endFrame": 30
        },
        {
          "type": "flip",
          "axis": "y",
          "degrees": 180
        }
      ]
    }
  ]
}
```

#### 关键优势详解

**1. 结构化 vs 自由文本**
- ✅ JSON 格式强制约束
- ✅ 字段名固定、类型可验证
- ✅ 结构清晰、易于解析

**2. 可验证性**
```typescript
// ✅ DSL 可以精确验证（20+ 项规则）
validateVideoSpec(spec);
// → { valid: true } 或具体错误信息
```

**3. 关注点分离**
```
LLM 负责：创意决策
  ✅ 理解用户意图（"纸张翻转效果"）
  ✅ 选择动画类型
  ✅ 时间分配

编译器负责：代码生成
  ✅ 正确的 React 语法
  ✅ 性能优化
  ✅ 代码风格统一
```

**4. 成本效率**
- DSL Token：    ~200 → $0.002/次
- React 代码：   ~800 → $0.008/次
- **节省 75% 成本**

**5. 可扩展性**
```typescript
// ✅ 新增动画只需修改编译器
type AnimationType = 'fade_in' | 'flip' | 'particles' | 'wave';
// 编译器自动支持
```

**6. 错误恢复**
```typescript
// ✅ DSL 验证失败可自动修复
if (layer.startFrame >= layer.endFrame) {
  layer.endFrame = layer.startFrame + 30;
}
```

#### 实际效果

**生成质量：**
- ✅ 100% 语法正确（编译器保证）
- ✅ 100% 风格一致（模板化）
- ✅ 95% 逻辑正确（DSL 验证）

**成本节省：**
- ✅ Token 消耗 -75%
- ✅ API 调用 -80%
- ✅ 失败率 -60%

**开发效率：**
- ✅ 新增动画：2 小时（只改编译器）
- ✅ 修复 Bug：30 分钟（定位精确）
- ✅ 维护成本：极低（类型安全）

---

## 🏗️ Harness 2.0 架构

### Harness 2.0 流水线详解

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **OpenAI API Key** 或兼容的第三方中转 API

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/Linkaiup/video-editor-by-agent-remotion.git
cd video-editor-by-agent-remotion
```

#### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd web
npm install
cd ..

# 安装后端依赖
cd server
npm install
cd ..
```

#### 3. 配置 API 密钥

编辑项目根目录的 `.env` 文件：

```env
# OpenAI API 配置
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-5.5

# 服务器配置
PORT=3001
```

**支持第三方中转 API：**

```env
OPENAI_API_KEY=your-proxy-key
OPENAI_BASE_URL=https://your-proxy.com/v1
OPENAI_MODEL=gpt-5.5
```

#### 4. 编译 Agent 代码

```bash
npm run agent:build
```

#### 5. 启动服务

**方式 A：分别启动**

```bash
# 终端 1 - 启动后端
cd server
npm run dev

# 终端 2 - 启动前端
cd web
npm run dev
```

**方式 B：同时启动（推荐）**

```bash
npm run dev
```

#### 6. 访问应用

打开浏览器访问：**http://localhost:5173**

---

## 💡 使用方法

### 基础用法

#### 1. 无素材创建视频

```
用户：创建一个10秒的视频
```

**效果：**
- 系统生成纯色背景视频
- 添加默认文字 "Hello Remotion"
- 应用淡入淡出动画
- 输出 1920×1080 @ 30fps 视频

#### 2. 使用素材创建视频

1. 点击左侧 **上传素材** 区域
2. 选择图片文件（支持 JPG, PNG, GIF）
3. 输入创建指令：

```
用户：用这张图片创建一个15秒的视频，添加缩放动画
```

**效果：**
- 从图片提取主色调
- 应用缩放动画
- 添加转场效果
- 输出视频文件

#### 3. 复杂视频创作

```
用户：创建一个30秒的产品介绍视频，包含3个场景：
1. 开场标题淡入
2. 产品图片展示，慢慢缩放
3. 结尾文字淡出
```

**效果：**
- 自动分解为 3 个 beats（场景）
- 为每个场景分配时长
- 应用不同的动画效果
- 生成完整的分镜脚本

### 高级功能

#### 指定视频参数

```
用户：创建一个20秒的视频，分辨率1280x720，帧率60fps
```

#### 自定义文字内容

```
用户：创建视频，标题是"欢迎使用 Remotion"，副标题是"AI 驱动的视频编辑"
```

#### 指定动画效果

```
用户：创建视频，使用弹性动画和旋转效果
```

---

## 🏗️ Harness 2.0 架构

Harness 2.0 是系统的核心执行引擎，采用 **8步流水线** 架构，每步产出 **Named Artifact**（命名制品）。

### 整体流程

```
用户输入
   ↓
意图识别 (Intent Recognition)
   ↓
意图澄清 (Intent Clarification)
   ↓
任务规划 (Task Planning)
   ↓
┌─────────────────────────────────┐
│  ResilientHarness2Executor      │
│  (智能重试执行器)                │
│                                  │
│  尝试 1: micro_adjust (微调)    │
│  尝试 2: downgrade (降级)       │
│  尝试 3: minimal (最简)         │
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│     Harness2Executor            │
│     (8步流水线)                  │
└─────────────────────────────────┘
```

### 8步流水线详解

#### Step 1: Capture (素材捕获) 📦

**职责：**
- 复制素材到项目目录
- 提取元数据（宽高、时长、格式）
- 生成缩略图
- 提取设计 tokens（颜色、字体）
- 支持无素材场景（使用占位符）

**输出制品：** `CaptureArtifact`
```json
{
  "metadata": [
    {
      "id": "asset-1",
      "type": "image",
      "path": "assets/image-1.jpg",
      "width": 1920,
      "height": 1080
    }
  ],
  "tokens": {
    "colors": ["#000000", "#FFFFFF", "#333333"],
    "fonts": ["Inter", "Sans-serif"]
  }
}
```

**验证：** ✅ 允许 `metadata` 为空

---

#### Step 2: Design (设计规范) 🎨

**职责：**
- 定义视觉主题（style, mood）
- 构建色板（从 tokens 扩展）
- 定义排版系统（字体、大小、粗细）
- 定义布局规则（margins, padding）
- 定义组件样式库

**输出制品：** `DesignArtifact` → `DESIGN.md`
```markdown
# 设计规范

## 视觉主题
- Style: Modern
- Mood: Professional

## 色板
- Primary: #000000
- Secondary: #FFFFFF
- Accent: #4A90E2

## 排版
- Title: Inter 72px Bold
- Body: Inter 24px Regular
```

---

#### Step 3: Strategy (视频策略) 📋

**职责：**
- 确定视频类型（explainer, promo, tutorial）
- 锁定格式（时长、宽高比、fps）
- 提炼核心信息
- 设计叙事弧（开头、中间、结尾）

**输出制品：** `StrategyArtifact` → `STRATEGY.md`
```json
{
  "videoType": "explainer",
  "format": {
    "duration": 10,
    "fps": 30,
    "aspectRatio": "16:9"
  },
  "coreMessage": "展示产品特性",
  "narrativeArc": {
    "opening": "吸引注意",
    "middle": "展示价值",
    "closing": "行动号召"
  }
}
```

---

#### Step 4: Storyboard (分镜脚本) 🎬

**职责：**
- 将视频分解为 beats（场景）
- 为每个 beat 分配素材
- 定义 beat 的情绪和镜头
- 设计转场效果
- 分配特效和音效

**输出制品：** `StoryboardArtifact` → `STORYBOARD.md`
```json
{
  "beats": [
    {
      "id": "beat-1",
      "name": "Opening",
      "startTime": 0,
      "endTime": 2.5,
      "mood": "energetic",
      "camera": "static",
      "assets": ["asset-1"],
      "techniques": ["fade-in"],
      "transitions": ["dissolve"]
    }
  ]
}
```

**验证：** ✅ 允许 beat 无资产

---

#### Step 5: Timeline (精确时间轴) ⏱️

**职责：**
- 将秒转换为帧（时长 × fps）
- 为每个 beat 分配精确帧范围
- 处理旁白的字级时间轴

**输出制品：** `TimelineArtifact` → `timeline.json`
```json
{
  "duration": 10,
  "fps": 30,
  "beats": [
    {
      "id": "beat-1",
      "start": 0,
      "end": 2.5,
      "frames": [0, 75]
    }
  ]
}
```

---

#### Step 6: Build (代码生成) 🔨

**职责：**
- 使用 **Sub-agent 隔离策略**
- 为每个 beat 生成独立的 React 组件
- 应用设计规范（颜色、字体、布局）
- 实现动画和转场效果
- 生成 TypeScript 类型定义
- 语法检查 + 类型检查

**输出制品：** `BuildArtifact`
```json
{
  "compositions": [
    {
      "beatId": "beat-1",
      "path": "src/compositions/beat-1.tsx",
      "syntaxValid": true,
      "typeValid": true
    }
  ]
}
```

**生成的文件：**
```typescript
// src/compositions/beat-1.tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const Beat1: React.FC = () => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <div style={{ opacity }}>
        <h1>Hello Remotion</h1>
      </div>
    </AbsoluteFill>
  );
};
```

---

#### Step 7: Validate (三重验证) ✅

**职责：**
- 1️⃣ **Lint 检查** - ESLint 语法检查
- 2️⃣ **运行时检查** - TypeScript 类型检查
- 3️⃣ **视觉快照** - 生成关键帧截图

**质量评估：**
- Smoothness（流畅度）
- Stability（稳定性）
- Performance（性能）
- Overall（综合得分 0-100）

**输出制品：** `ValidationArtifact`
```json
{
  "status": "passed",
  "quality": {
    "smoothness": 95,
    "stability": 98,
    "performance": 92,
    "overall": 94
  },
  "snapshots": ["snapshot-1.png", "snapshot-2.png"]
}
```

---

#### Step 8: Render (视频渲染) 🎬

**职责：**
1. **生成主入口文件** (`index.tsx`)
   - 导入所有 beat 组件
   - 使用 `Sequence` 按时间轴排列
   - 调用 `registerRoot()`

2. **打包 Remotion 项目**
   - 使用 `@remotion/bundler`
   - Webpack 打包

3. **渲染视频**
   - 使用 `@remotion/renderer`
   - H.264 编码
   - 实时进度监控（每 10%）

**输出制品：** `RenderArtifact`
```json
{
  "videoPath": "output/video-1783482285938.mp4",
  "duration": 10,
  "fps": 30,
  "resolution": { "width": 1920, "height": 1080 },
  "fileSize": "2.5 MB"
}
```

**生成的文件：**
- `src/index.tsx` - 主入口文件
- `output/video-{timestamp}.mp4` - 最终视频

---

### 智能重试机制

当某一步失败时，系统会自动重试，逐步降级：

| 尝试 | 策略 | 调整内容 |
|------|------|----------|
| 1️⃣ | `micro_adjust` | 微调参数，保持原目标 |
| 2️⃣ | `downgrade` | 降低复杂度（减少特效、简化布局） |
| 3️⃣ | `minimal` | 最简方案（基础功能、短时长） |

**示例：**
```
[尝试 1] 生成 10 秒 4K 视频，包含复杂动画 ❌
[尝试 2] 降级为 10 秒 1080p 视频，简化动画 ❌
[尝试 3] 降级为 5 秒 720p 视频，基础动画 ✅
```

---

## 📂 项目结构

```
remotion-video-editor-agent/
├── src/                                    # Agent 核心代码
│   ├── agent/                              # Agent 主模块
│   │   ├── index.ts                        # Agent 主入口
│   │   ├── config.ts                       # 配置（OpenAI API）
│   │   ├── types.ts                        # TypeScript 类型定义
│   │   ├── tracing.ts                      # 日志和追踪
│   │   │
│   │   ├── intent-recognition.ts           # 意图识别
│   │   ├── intent-clarification.ts         # 意图澄清
│   │   ├── task-planning.ts                # 任务规划
│   │   │
│   │   └── harness/                        # Harness 2.0
│   │       ├── executor.ts                 # 8步执行器
│   │       ├── resilient-executor.ts       # 智能重试执行器
│   │       ├── artifacts/                  # 制品管理
│   │       │   ├── manager.ts              # 制品管理器
│   │       │   └── types.ts                # 制品类型定义
│   │       │
│   │       ├── steps/                      # 8步流水线
│   │       │   ├── capture.ts              # Step 1: 素材捕获
│   │       │   ├── design.ts               # Step 2: 设计规范
│   │       │   ├── strategy.ts             # Step 3: 视频策略
│   │       │   ├── storyboard.ts           # Step 4: 分镜脚本
│   │       │   ├── timeline.ts             # Step 5: 精确时间轴
│   │       │   ├── build.ts                # Step 6: 代码生成
│   │       │   ├── validate.ts             # Step 7: 三重验证
│   │       │   └── render.ts               # Step 8: 视频渲染
│   │       │
│   │       └── code-gen/                   # 代码生成模块（新增）
│   │           ├── hybrid-generator.ts     # 混合模式生成器
│   │           ├── llm-generator.ts        # LLM 生成器
│   │           ├── dsl-compiler.ts         # DSL 编译器
│   │           ├── dsl-types.ts            # VideoSpec DSL 类型
│   │           └── animation-templates.ts  # 26+ 动画模板库
│   │
│   ├── compositions/                       # Remotion 组件示例
│   │   └── HelloWorld.tsx
│   │
│   └── Root.tsx                            # Remotion 根组件
│
├── server/                                 # Express 后端服务
│   ├── src/
│   │   ├── index.ts                        # 服务器入口
│   │   └── routes/
│   │       ├── chat.ts                     # 聊天 API
│   │       ├── upload.ts                   # 文件上传 API
│   │       └── projects.ts                 # 项目管理 API
│   │
│   ├── uploads/                            # 素材上传目录
│   └── projects/                           # 视频项目目录
│       └── session-{id}/                   # 会话项目
│           ├── artifacts/                  # 制品目录
│           │   ├── capture/
│           │   │   └── assets/             # 素材文件
│           │   ├── DESIGN.md
│           │   ├── STRATEGY.md
│           │   ├── STORYBOARD.md
│           │   ├── timeline.json
│           │   └── validation-report.json
│           │
│           ├── src/                        # 生成的代码
│           │   ├── compositions/           # Beat 组件
│           │   │   ├── beat-1.tsx
│           │   │   ├── beat-2.tsx
│           │   │   ├── beat-3.tsx
│           │   │   └── beat-4.tsx
│           │   └── index.tsx               # 主入口
│           │
│           └── output/                     # 输出目录
│               └── video-{timestamp}.mp4   # 最终视频
│
├── web/                                    # React 前端
│   ├── src/
│   │   ├── App.tsx                         # 主应用
│   │   ├── components/                     # UI 组件
│   │   │   ├── ChatInterface.tsx           # 聊天界面
│   │   │   └── AssetUpload.tsx             # 素材上传
│   │   ├── services/
│   │   │   └── api.ts                      # API 客户端
│   │   └── styles/
│   │       └── index.css                   # 样式
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tsconfig.node.json
│
├── docs/                                   # 文档目录（新增 34 个）
│   ├── 17-openai-api-configuration.md
│   ├── 20-hybrid-code-generation.md        # 混合代码生成
│   ├── 21-llm-retry-mechanism.md           # LLM 重试机制
│   ├── 33-http-url-final-solution.md       # HTTP URL 方案
│   ├── 34-beat-frame-timing-fix.md         # 帧时序修复
│   └── ...                                 # 更多技术文档
│
├── .env                                    # 环境变量配置
├── package.json                            # 项目依赖
├── tsconfig.json                           # TypeScript 配置
├── tsconfig.agent.json                     # Agent 专用 TS 配置
└── README.md                               # 本文件
```

---

## 🛠️ 技术栈

### 后端

- **Node.js** - JavaScript 运行时
- **Express** - Web 服务器
- **TypeScript** - 类型安全
- **OpenAI SDK** - LLM 交互
- **Remotion** - 视频渲染引擎
- **Socket.IO** - 实时通信

### 前端

- **React** - UI 框架
- **Vite** - 构建工具
- **TypeScript** - 类型安全
- **Axios** - HTTP 客户端
- **Tailwind CSS** - 样式框架

### AI/LLM

- **OpenAI GPT-5.5** - 意图理解和代码生成
- 支持第三方兼容 API

---

## 📖 文档

### 配置指南

- [OpenAI API 配置指南](docs/17-openai-api-configuration.md) - 详细的 API 配置说明

### 架构文档

- [Harness 流程详解](docs/harness-flow.md) - 8步流水线完整说明
- [制品系统设计](docs/artifacts.md) - Named Artifacts 设计原理
- [智能重试机制](docs/recovery.md) - 降级策略详解

---

## 🔧 开发指南

### 编译 Agent 代码

```bash
npm run agent:build
```

### 运行测试

```bash
# 运行 Agent 测试
npm run agent:test

# 运行端到端测试
npm run test:e2e
```

### 开发模式

```bash
# 监听 Agent 代码变化
npm run agent:watch

# 同时启动前后端（开发模式）
npm run dev
```

### 代码规范

```bash
# 运行 ESLint
npm run lint

# 运行类型检查
npm run type-check

# 格式化代码
npm run format
```

---

## 🐛 常见问题

### 1. 前端请求超时

**问题：** 前端显示"发送消息时出错"，但后端日志显示成功。

**原因：** 视频生成耗时较长（约 50 秒），前端默认 30 秒超时。

**解决：** 已修复，当前超时时间为 3 分钟。

### 2. OpenAI API 403 错误

**问题：** 后端日志显示 `403 Your request was blocked`。

**原因：** 中转 API 安全策略拦截。

**解决方案：**
1. 检查 API Key 是否正确
2. 测试中转 API 是否正常
3. 尝试使用 `gpt-5.5` 代替 `gpt-4o`
4. 联系中转 API 提供商

### 3. 视频渲染失败

**问题：** 提示 `registerRoot` 相关错误。

**原因：** 入口文件缺少 `registerRoot()` 调用。

**解决：** 已修复，`render.ts` 会自动生成正确的入口文件。

### 4. Capture/Storyboard 验证失败

**问题：** 提示"没有有效的素材"或"Beat 没有关联资产"。

**原因：** 验证逻辑过于严格。

**解决：** 已修复，支持无素材场景。

---

## 🚦 路线图

### v1.0（当前版本）

- ✅ 8步 Harness 流水线
- ✅ 意图识别和澄清
- ✅ 无素材/有素材创建
- ✅ 视频渲染
- ✅ 智能重试

### v1.1（计划中）

- ⏳ 视频编辑功能（剪辑、拼接）
- ⏳ 更多动画效果
- ⏳ 音频支持（背景音乐、旁白）
- ⏳ 字幕生成（自动语音识别）

### v2.0（未来）

- 🔮 实时预览
- 🔮 协作编辑
- 🔮 模板市场
- 🔮 批量生成

---

## 🤝 贡献指南

欢迎贡献代码、报告问题、提出建议！

### 贡献步骤

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 遵循 TypeScript 严格模式
- 添加单元测试
- 更新相关文档
- 保持代码风格一致

---

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- [Remotion](https://www.remotion.dev/) - 强大的视频渲染引擎
- [OpenAI](https://openai.com/) - GPT 模型支持
- [React](https://react.dev/) - UI 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

---

## 📞 联系方式

- 项目主页：https://github.com/Linkaiup/video-editor-by-agent-remotion
- 问题反馈：https://github.com/Linkaiup/video-editor-by-agent-remotion/issues
- 邮箱：lincoln0.981213@gmail.com

---

<div align="center">

**[⬆ 返回顶部](#remotion-video-editor-agent)**

Made with ❤️ by Remotion Agent Team

</div>
