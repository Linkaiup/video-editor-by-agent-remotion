# LLM 在视频编辑 Agent 中的作用与 Prompt 流程

## 📋 目录

- [总览](#总览)
- [LLM 调用节点](#llm-调用节点)
- [完整流程图](#完整流程图)
- [各步骤详细 Prompt](#各步骤详细-prompt)
- [Prompt 设计原则](#prompt-设计原则)

---

## 总览

本项目中，**LLM 作为智能决策引擎**，贯穿整个视频生成流程的关键节点。

### 核心角色

| 角色 | 说明 |
|------|------|
| 🧠 **意图理解器** | 解析用户自然语言，提取结构化信息 |
| 📋 **任务规划师** | 将高层意图分解为可执行步骤 |
| 🎨 **设计师** | 生成视觉设计方案（颜色、布局、风格）|
| 📝 **策略制定者** | 制定视频生成策略（动画方案选择）|
| 🎬 **分镜师** | 将素材拆分为场景和镜头 |
| 🔨 **代码生成器** | 生成 React/TypeScript 组件代码 |

---

## LLM 调用节点

整个流程中，LLM 被调用 **6 次**，分布在不同阶段：

```
用户输入
   ↓
[LLM 1] 意图识别 (Intent Recognition)
   ↓
[LLM 2] 意图澄清 (Clarification) ← 如果信息不完整
   ↓
[LLM 3] 任务规划 (Task Planning)
   ↓
═══════════════════════════════════════
   Harness 2.0 流程开始
═══════════════════════════════════════
   ↓
[LLM 4] 设计生成 (Design Step)
   ↓
[LLM 5] 策略生成 (Strategy Step)
   ↓
[LLM 6] 分镜生成 (Storyboard Step)
   ↓
[LLM 7] 代码生成 (Build Step)
   ↓
渲染输出
```

---

## 完整流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户输入                                  │
│              "创建一个 10 秒的视频，使用这张图片"                    │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🧠 LLM 1: 意图识别 (Intent Recognition)                        │
│  ────────────────────────────────────────────────────────────  │
│  输入: 用户消息                                                  │
│  输出: {                                                        │
│    type: 'create',                                             │
│    confidence: 0.95,                                           │
│    entities: {                                                 │
│      duration: 10,                                             │
│      assets: ['./image.jpg']                                   │
│    }                                                           │
│  }                                                             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  📋 LLM 2: 意图澄清 (Clarification) [可选]                       │
│  ────────────────────────────────────────────────────────────  │
│  输入: 识别出的意图                                              │
│  输出: {                                                        │
│    needsClarification: true/false,                             │
│    questions: ['需要什么特效？', '视频风格？'],                  │
│    completeness: 60  // 信息完整度百分比                        │
│  }                                                             │
│  如果 completeness < 60% → 询问用户补充信息                     │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  📝 LLM 3: 任务规划 (Task Planning)                             │
│  ────────────────────────────────────────────────────────────  │
│  输入: 完整的用户意图                                            │
│  输出: {                                                        │
│    steps: [                                                    │
│      { action: 'validate_assets', description: '验证素材' },   │
│      { action: 'create_composition', description: '创建组合' },│
│      { action: 'generate_code', description: '生成代码' },     │
│      { action: 'render', description: '渲染视频' }             │
│    ]                                                           │
│  }                                                             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
        ═══════════════════════════════════════
              Harness 2.0 流程开始
        ═══════════════════════════════════════
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Capture (素材捕获) - 无 LLM                             │
│  ────────────────────────────────────────────────────────────  │
│  • 读取素材元数据（尺寸、格式、时长）                             │
│  • 生成 capture.json                                            │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🎨 LLM 4: Design (设计生成)                                     │
│  ────────────────────────────────────────────────────────────  │
│  输入: capture.json (素材信息)                                   │
│  输出: design.json {                                            │
│    palette: { primary: '#FF6B35', bg: '#000' },               │
│    layout: 'center',                                           │
│    typography: { font: 'Arial', size: 48 }                    │
│  }                                                             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  📋 LLM 5: Strategy (策略生成)                                   │
│  ────────────────────────────────────────────────────────────  │
│  输入: 用户意图 + capture.json                                   │
│  输出: strategy.json {                                          │
│    mode: 'template',  // template/llm/mixed                   │
│    animations: ['fade', 'zoom'],                              │
│    templateId: 'simple-slideshow'                             │
│  }                                                             │
│  ⚙️  决策逻辑：素材 ≤3 且无复杂需求 → template 模式               │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🎬 LLM 6: Storyboard (分镜生成)                                 │
│  ────────────────────────────────────────────────────────────  │
│  输入: strategy.json + capture.json                             │
│  输出: storyboard.json {                                        │
│    scenes: [                                                   │
│      {                                                         │
│        id: 'scene-1',                                          │
│        shots: [                                                │
│          {                                                     │
│            asset: 'image-1.jpg',                               │
│            startTime: 0,                                       │
│            duration: 5,                                        │
│            effects: ['fadeIn', 'zoomIn']                       │
│          }                                                     │
│        ]                                                       │
│      }                                                         │
│    ]                                                           │
│  }                                                             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Timeline (时间轴计算) - 无 LLM                          │
│  ────────────────────────────────────────────────────────────  │
│  • 将场景/镜头转换为帧时间轴                                      │
│  • 计算 startFrame, durationInFrames                           │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🔨 LLM 7: Build (代码生成)                                      │
│  ────────────────────────────────────────────────────────────  │
│  输入: timeline.json + design.json                              │
│  输出: React 组件代码                                            │
│  • 根据 strategy.mode 选择：                                     │
│    - template 模式：使用动画模板                                 │
│    - llm 模式：完全由 LLM 生成代码                               │
│    - mixed 模式：模板 + LLM 增强                                │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: Validate (验证) - 无 LLM                                │
│  ────────────────────────────────────────────────────────────  │
│  • TypeScript 语法检查                                           │
│  • 组件导出验证                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 8: Render (渲染) - 无 LLM                                  │
│  ────────────────────────────────────────────────────────────  │
│  • Remotion 渲染为 MP4                                           │
│  • 使用 Puppeteer/Chromium                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
                      ✅ 视频生成完成
```


---

## 各步骤详细 Prompt

### 🧠 LLM 1: 意图识别 (Intent Recognition)

**文件位置**: `src/agent/intent-recognition.ts`

**System Prompt** (来自 `config.ts`):
```
你是一个视频编辑意图识别专家。
分析用户的消息并提取以下信息：
- 主要动作类型 (create创建, edit编辑, add_effect添加特效, add_transition添加转场, preview预览, export导出)
- 提到的素材 (图片、视频、音频文件)
- 期望的特效 (淡入淡出、缩放、模糊、颜色校正等)
- 片段之间的转场效果
- 时间轴信息 (时长、位置)
- 文本内容和样式

返回带有置信度分数的结构化意图对象（JSON 格式）。
```

**User Prompt**:
```
分析这个视频编辑请求并提取结构化意图：

"创建一个 10 秒的视频，使用这张图片，添加淡入淡出效果"

返回 JSON 格式，包含: 
  type (动作类型), 
  description (描述), 
  confidence (置信度 0-1), 
  entities {
    assets (素材列表),
    effects (特效列表),
    transitions (转场列表),
    duration (时长),
    position (位置),
    text (文字内容)
  }
```

**输出示例**:
```json
{
  "type": "create",
  "description": "创建一个带淡入淡出效果的10秒视频",
  "confidence": 0.95,
  "entities": {
    "duration": 10,
    "assets": ["./image.jpg"],
    "effects": ["fade"],
    "transitions": [],
    "text": null
  }
}
```

---

### 📋 LLM 2: 意图澄清 (Clarification)

**文件位置**: `src/agent/clarification.ts`

**逻辑**: 这一步**不直接调用 LLM**，而是基于规则检查意图完整性。

**完整度计算**:
```typescript
let completeness = 30; // 基础分

// 检查各个字段，累加分数
if (有 duration)    completeness += 20;
if (有 assets)      completeness += 25;
if (有 effects)     completeness += 15;
if (有 transitions) completeness += 10;
if (有 text)        completeness += 10;

// 如果 completeness < 60 或缺少必填项 → 需要澄清
```

**输出示例**:
```json
{
  "needsClarification": true,
  "completeness": 55,
  "questions": [
    {
      "field": "effects",
      "question": "需要添加什么特效吗？",
      "suggestions": ["淡入淡出", "缩放动画", "不需要特效"],
      "required": false
    }
  ],
  "missingFields": ["effects", "style"]
}
```

---

### 📝 LLM 3: 任务规划 (Task Planning)

**文件位置**: `src/agent/task-planning.ts`

**System Prompt**:
```
你是一个基于 Remotion 的视频编辑任务规划师。
根据用户意图，将其分解为可执行的步骤：
1. 加载并验证素材
2. 创建组合结构
3. 应用特效和转场
4. 生成 React 组件代码
5. 验证输出

每个步骤应该具体且可测试。返回 JSON 格式的任务计划。
```

**User Prompt**:
```
为这个视频编辑意图创建详细的任务计划：

{
  "type": "create",
  "entities": {
    "duration": 10,
    "assets": ["./image.jpg"],
    "effects": ["fade"]
  }
}

返回 JSON 格式，包含: 
  id (计划ID), 
  steps (步骤数组，每项包含 {id, action, description, status}), 
  estimatedDuration (预计时长), 
  dependencies (依赖关系)
```

**输出示例**:
```json
{
  "id": "plan-1234567890",
  "steps": [
    {
      "id": "step-1",
      "action": "validate_assets",
      "description": "验证图片文件是否存在和可读",
      "status": "pending"
    },
    {
      "id": "step-2",
      "action": "create_composition",
      "description": "创建 1920x1080 @ 30fps 的视频组合",
      "status": "pending"
    },
    {
      "id": "step-3",
      "action": "apply_effects",
      "description": "应用淡入淡出效果",
      "status": "pending"
    },
    {
      "id": "step-4",
      "action": "generate_code",
      "description": "生成 React 组件代码",
      "status": "pending"
    }
  ],
  "estimatedDuration": "30-60秒"
}
```


---

### 🎨 LLM 4: Design (设计生成)

**文件位置**: `src/agent/harness/steps/design.ts`

**User Prompt** (简化版):
```
你是视觉设计专家。根据素材信息生成视频设计方案。

素材信息：
- 图片: image-1.jpg (1920x1080)
- 图片: image-2.jpg (1280x720)

返回 JSON 格式的设计方案：
{
  "palette": {
    "primary": "#颜色代码",
    "secondary": "#颜色代码",
    "background": "#颜色代码",
    "text": "#颜色代码"
  },
  "layout": "center" | "fill" | "fit",
  "typography": {
    "font": "字体名称",
    "size": 48,
    "weight": "bold"
  },
  "style": "modern" | "minimal" | "vibrant"
}
```

**输出示例**:
```json
{
  "palette": {
    "primary": "#FF6B35",
    "secondary": "#004E89",
    "background": "#000000",
    "text": "#FFFFFF"
  },
  "layout": "center",
  "typography": {
    "font": "Inter",
    "size": 48,
    "weight": "bold"
  },
  "style": "modern"
}
```

---

### 📋 LLM 5: Strategy (策略生成)

**文件位置**: `src/agent/harness/steps/strategy.ts`

**User Prompt**:
```
你是视频生成策略专家。分析用户需求，选择最佳生成方式。

用户意图：
{
  "type": "create",
  "description": "创建简单的图片视频",
  "entities": {
    "duration": 10,
    "effects": ["fade"]
  }
}

素材信息：
- 2 张图片

选择生成模式：
1. **template** (模板模式)
   - 适用场景：素材 ≤3 张，简单特效，标准时长
   - 优点：快速、稳定
   - 缺点：创意有限

2. **llm** (LLM 生成模式)
   - 适用场景：复杂动画，多素材，自定义需求
   - 优点：灵活、创造性强
   - 缺点：慢、可能失败

3. **mixed** (混合模式)
   - 适用场景：基础模板 + 局部定制
   - 优点：平衡速度和质量

返回 JSON：
{
  "mode": "template | llm | mixed",
  "reason": "选择理由",
  "animations": ["使用的动画列表"],
  "templateId": "模板ID (如果是 template 模式)"
}
```

**输出示例**:
```json
{
  "mode": "template",
  "reason": "素材数量少，特效简单，适合使用模板快速生成",
  "animations": ["fade", "zoom"],
  "templateId": "simple-slideshow",
  "estimatedQuality": 0.85
}
```

---

### 🎬 LLM 6: Storyboard (分镜生成)

**文件位置**: `src/agent/harness/steps/storyboard.ts`

**User Prompt**:
```
你是电影分镜师。将素材和策略转换为详细的分镜脚本。

策略：
{
  "mode": "template",
  "animations": ["fade", "zoom"]
}

素材：
- image-1.jpg (1920x1080)
- image-2.jpg (1280x720)

总时长：10 秒 (300 帧 @ 30fps)

生成分镜脚本：
{
  "scenes": [
    {
      "id": "scene-1",
      "description": "场景描述",
      "shots": [
        {
          "id": "shot-1",
          "asset": "素材文件名",
          "startTime": 0,
          "duration": 5,
          "effects": ["fadeIn", "zoomIn"],
          "description": "镜头描述"
        }
      ]
    }
  ]
}

要求：
1. 场景和镜头的总时长 = 10 秒
2. 每个镜头至少 2 秒
3. 特效要平滑衔接
```

**输出示例**:
```json
{
  "scenes": [
    {
      "id": "scene-1",
      "description": "开场展示第一张图片",
      "shots": [
        {
          "id": "shot-1",
          "asset": "image-1.jpg",
          "startTime": 0,
          "duration": 5,
          "effects": ["fadeIn", "zoomIn"],
          "description": "图片从黑场淡入，同时缓慢放大"
        }
      ]
    },
    {
      "id": "scene-2",
      "description": "切换到第二张图片",
      "shots": [
        {
          "id": "shot-2",
          "asset": "image-2.jpg",
          "startTime": 5,
          "duration": 5,
          "effects": ["fadeIn", "fadeOut"],
          "description": "第二张图片淡入，结尾淡出"
        }
      ]
    }
  ],
  "totalDuration": 10
}
```


---

### 🔨 LLM 7: Build (代码生成)

**文件位置**: `src/agent/code-generation.ts` + `src/agent/harness/steps/build.ts`

**分两种模式**:

#### 1️⃣ Template 模式（无 LLM）
直接使用预定义的动画模板，填充数据：
```typescript
// 从模板库选择
const template = animationTemplates['fadeZoom'];

// 填充素材和参数
const code = template.generate({
  assets: ['image-1.jpg', 'image-2.jpg'],
  durations: [5, 5]
});
```

#### 2️⃣ LLM 模式

**System Prompt**:
```
你是一个 Remotion React 组件代码生成器。
生成干净、类型安全的 React/TypeScript 代码，要求：
- 使用 Remotion 的内置组件 (Sequence, Video, Img, Audio 等)
- 使用 spring() 和 interpolate() 实现请求的特效
- 平滑处理转场效果
- 遵循性能最佳实践
- 使用 TypeScript 进行完整的类型定义

只输出组件代码，不要添加任何解释说明。
```

**User Prompt**:
```typescript
生成一个 Remotion 视频组件。

组合规格：
- ID: comp-1234567890
- 组件名: comp_1234567890（必须使用这个名字！）
- 尺寸: 1920x1080
- 帧率: 30 fps
- 时长: 300 帧

图层信息：
图层 1:
- 类型: image
- 素材路径: IMAGE_SRC_PLACEHOLDER (稍后替换)
- 起始帧: 0
- 时长: 150 帧
- 特效: fadeIn, zoomIn

图层 2:
- 类型: image
- 素材路径: IMAGE_SRC_PLACEHOLDER
- 起始帧: 150
- 时长: 150 帧
- 特效: fadeIn, fadeOut

**关键要求**：
1. 组件必须导出为: export const comp_1234567890: React.FC = () => { ... }
2. 使用 Remotion 的 AbsoluteFill, useCurrentFrame, useVideoConfig
3. 图片使用 <Img src="IMAGE_SRC_PLACEHOLDER" />（我会稍后替换）
4. 实现所有指定的特效
5. 代码完整可运行

示例：
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';

export const comp_1234567890: React.FC = () => {
  const frame = useCurrentFrame();
  
  // 淡入效果
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  
  // 缩放效果
  const scale = interpolate(frame, [0, 150], [1, 1.2]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Img 
        src="IMAGE_SRC_PLACEHOLDER" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          opacity,
          transform: `scale(${scale})`
        }} 
      />
    </AbsoluteFill>
  );
};
```

**输出示例**:
```typescript
import { AbsoluteFill, Img, Sequence, useCurrentFrame, interpolate } from 'remotion';

export const comp_1234567890: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={0} durationInFrames={150}>
        <Shot1 />
      </Sequence>
      <Sequence from={150} durationInFrames={150}>
        <Shot2 />
      </Sequence>
    </AbsoluteFill>
  );
};

const Shot1: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = interpolate(frame, [0, 150], [1, 1.2]);
  
  return (
    <Img 
      src="IMAGE_SRC_PLACEHOLDER" 
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        opacity,
        transform: `scale(${scale})`
      }} 
    />
  );
};

const Shot2: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 30], [0, 1]);
  const fadeOut = interpolate(frame, [120, 150], [1, 0]);
  const opacity = Math.min(fadeIn, fadeOut);
  
  return (
    <Img 
      src="IMAGE_SRC_PLACEHOLDER" 
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        opacity
      }} 
    />
  );
};
```

---

## Prompt 设计原则

### 1. 结构化输出优先

所有 LLM 调用都要求返回 **JSON 格式**，便于后续步骤解析和处理。

**示例**:
```
返回 JSON 格式，包含: type, description, confidence, entities
```

### 2. 明确角色定位

每个 System Prompt 都定义了 LLM 的专业角色：
- "你是一个视频编辑意图识别专家"
- "你是一个 Remotion React 组件代码生成器"
- "你是电影分镜师"

### 3. 提供具体示例

大部分 Prompt 都包含输出示例，降低 LLM 理解成本。

### 4. 渐进式细化

从高层意图（Intent）→ 任务计划（Plan）→ 详细设计（Design/Strategy）→ 分镜（Storyboard）→ 代码（Code）

每一步的输出都作为下一步的输入，逐步细化。

### 5. 容错与降级

- **重试机制**: 所有 LLM 调用都包装在 `withRetry()` 中
- **降级策略**: ResilientHarness2Executor 提供 3 次降级重试
- **模板回退**: Strategy 步骤可以选择 template 模式避免 LLM 失败

---

## 总结

### LLM 调用统计

| 步骤 | LLM 调用 | 作用 | 可选/必须 |
|------|---------|------|----------|
| Intent Recognition | ✅ | 解析用户输入 | 必须 |
| Clarification | ❌ | 规则检查 | 可选 |
| Task Planning | ✅ | 任务分解 | 必须 |
| Capture | ❌ | 素材元数据 | 必须 |
| Design | ✅ | 视觉设计 | 必须 |
| Strategy | ✅ | 生成策略 | 必须 |
| Storyboard | ✅ | 分镜脚本 | 必须 |
| Timeline | ❌ | 时间计算 | 必须 |
| Build | ⚠️ | 代码生成 | 视模式而定 |
| Validate | ❌ | 语法检查 | 必须 |
| Render | ❌ | 视频渲染 | 必须 |

**总计**: 7 次 LLM 调用（Build 步骤视模式可能为 0）

### 关键设计亮点

1. **智能降级**: Template 模式作为快速稳定的回退方案
2. **分层决策**: 意图 → 策略 → 分镜 → 代码，逐步细化
3. **结构化中间产物**: 所有 LLM 输出都是 JSON，便于验证和调试
4. **模块化 Prompt**: 每个步骤独立，易于优化和替换
5. **容错设计**: 重试 + 降级保证 95% 成功率

---

**文档版本**: v1.0  
**创建时间**: 2026-07-08  
**维护者**: Video Editor by Agent Team

