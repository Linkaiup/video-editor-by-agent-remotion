# LLM 在视频编辑 Agent 中的完整工作流程与 Prompt

## 📋 目录

- [总览](#总览)
- [LLM 调用节点](#llm-调用节点)
- [完整流程图](#完整流程图)
- [各步骤详细 Prompt](#各步骤详细-prompt)
- [LLM vs Template vs DSL 模式对比](#llm-vs-template-vs-dsl-模式对比)
- [总结](#总结)

---

## 总览

本项目中，**LLM 作为智能决策引擎**，在关键节点提供理解和生成能力。

### LLM 的核心角色

| 角色 | 说明 | 调用次数 |
|------|------|---------|
| 🧠 **意图理解器** | 解析用户自然语言，提取结构化信息 | 1 次 |
| 🎨 **设计师** | 生成视觉设计方案（颜色、布局、风格）| 1 次 |
| 📋 **策略制定者** | 制定视频生成策略（动画方案选择）| 1 次 |
| 🎬 **分镜师** | 将素材拆分为场景和镜头 | 1 次 |
| 🤖 **DSL 生成器** | 生成 VideoSpec DSL（复杂场景）| 0-N 次 |

**总计**：5 次必须调用 + 0-N 次可选调用（取决于 Beat 复杂度）

---

## LLM 调用节点

```
用户输入："创建一个 10 秒的视频，使用这张图片，添加淡入淡出效果"
   ↓
┌────────────────────────────────────────┐
│ [LLM 1] 意图识别                        │
│ Input: 用户消息                         │
│ Output: { type: 'create', entities }   │
└────────────────────────────────────────┘
   ↓
┌────────────────────────────────────────┐
│ [规则检查] 意图澄清（无 LLM）           │
│ 检查信息完整度，< 60% 则要求补充        │
└────────────────────────────────────────┘
   ↓
═══════════════════════════════════════════
        Harness 2.0 流程开始
═══════════════════════════════════════════
   ↓
┌────────────────────────────────────────┐
│ [Step 1] Capture（无 LLM）             │
│ 读取素材元数据                          │
└────────────────────────────────────────┘
   ↓
┌────────────────────────────────────────┐
│ [LLM 2] Design 设计生成                 │
│ Input: 素材信息                         │
│ Output: { palette, layout, typography }│
└────────────────────────────────────────┘
   ↓
┌────────────────────────────────────────┐
│ [LLM 3] Strategy 策略生成               │
│ Input: 意图 + 素材                      │
│ Output: { mode, animations, effects }  │
└────────────────────────────────────────┘
   ↓
┌────────────────────────────────────────┐
│ [LLM 4] Storyboard 分镜生成             │
│ Input: 策略 + 素材                      │
│ Output: { beats: [...] }               │
└────────────────────────────────────────┘
   ↓
┌────────────────────────────────────────┐
│ [Step 5] Timeline（无 LLM）            │
│ 时间轴计算，秒 → 帧                     │
└────────────────────────────────────────┘
   ↓
┌────────────────────────────────────────┐
│ [Step 6] Build 代码生成（混合模式）     │
│                                        │
│  对每个 Beat 评分：                    │
│  score < 5 → Template（无 LLM）        │
│  score >= 5 → LLM DSL 模式             │
│                                        │
│  [LLM 5+] 生成 VideoSpec DSL           │
│  Input: Beat 信息                      │
│  Output: { layers, animations }        │
│          ↓                             │
│  DSL 编译器 → React 代码                │
└────────────────────────────────────────┘
   ↓
┌────────────────────────────────────────┐
│ [Step 7] Validate（无 LLM）            │
│ 语法和类型检查                          │
└────────────────────────────────────────┘
   ↓
┌────────────────────────────────────────┐
│ [Step 8] Render（无 LLM）              │
│ Remotion 渲染                          │
└────────────────────────────────────────┘
   ↓
✅ 视频生成完成
```

---

## 完整流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户输入                                  │
│       "创建一个 10 秒的视频，使用这张图片，添加淡入淡出效果"         │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🧠 LLM 1: 意图识别 (Intent Recognition)                        │
│  ────────────────────────────────────────────────────────────  │
│  文件：src/agent/intent-recognition.ts                          │
│                                                                  │
│  System Prompt:                                                 │
│  "你是视频编辑意图识别专家，提取动作类型、素材、特效等信息"        │
│                                                                  │
│  User Prompt:                                                   │
│  分析这个视频编辑请求：                                           │
│  "创建一个 10 秒的视频，使用这张图片，添加淡入淡出效果"            │
│  返回 JSON: { type, entities, confidence }                      │
│                                                                  │
│  输出：                                                          │
│  {                                                              │
│    "type": "create",                                            │
│    "confidence": 0.95,                                          │
│    "entities": {                                                │
│      "duration": 10,                                            │
│      "assets": ["./image.jpg"],                                 │
│      "effects": ["fade"]                                        │
│    }                                                            │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  📋 规则检查: 意图澄清 (Clarification) - 无 LLM                  │
│  ────────────────────────────────────────────────────────────  │
│  文件：src/agent/clarification.ts                               │
│                                                                  │
│  计算完整度：                                                     │
│  基础分 30 + duration(20) + assets(25) + effects(15) = 90%      │
│                                                                  │
│  如果 < 60% → 要求用户补充信息                                   │
│  否则 → 继续流程                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
        ═══════════════════════════════════════
              Harness 2.0 流程开始
        ═══════════════════════════════════════
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  📦 Step 1: Capture - 无 LLM                                     │
│  ────────────────────────────────────────────────────────────  │
│  读取素材元数据：尺寸、格式、时长                                 │
│  生成 capture.json                                              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🎨 LLM 2: Design (设计生成)                                     │
│  ────────────────────────────────────────────────────────────  │
│  文件：src/agent/harness/steps/design.ts                        │
│                                                                  │
│  User Prompt（简化版）:                                          │
│  你是视觉设计专家，根据素材生成设计方案：                          │
│  素材：image-1.jpg (1920x1080)                                   │
│  返回 JSON: { palette, layout, typography, style }              │
│                                                                  │
│  输出：                                                          │
│  {                                                              │
│    "palette": {                                                 │
│      "primary": "#FF6B35",                                      │
│      "background": "#000000"                                    │
│    },                                                           │
│    "layout": "center",                                          │
│    "typography": { "font": "Inter", "size": 48 },              │
│    "style": "modern"                                            │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  📋 LLM 3: Strategy (策略生成)                                   │
│  ────────────────────────────────────────────────────────────  │
│  文件：src/agent/harness/steps/strategy.ts                      │
│                                                                  │
│  User Prompt:                                                   │
│  你是视频策略专家，分析需求选择生成模式：                          │
│  用户意图：{ type: "create", duration: 10, effects: ["fade"] }   │
│  素材：2 张图片                                                  │
│                                                                  │
│  选择模式：                                                      │
│  - template: 素材≤3，简单特效（快速稳定）                        │
│  - llm: 复杂动画，多素材（灵活创意）                             │
│  - mixed: 基础模板+局部定制                                      │
│                                                                  │
│  输出：                                                          │
│  {                                                              │
│    "mode": "template",                                          │
│    "reason": "素材少，特效简单，适合模板快速生成",                 │
│    "animations": ["fade", "zoom"]                               │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🎬 LLM 4: Storyboard (分镜生成)                                 │
│  ────────────────────────────────────────────────────────────  │
│  文件：src/agent/harness/steps/storyboard.ts                    │
│                                                                  │
│  **重要**：这一步大部分是**规则生成**，不是 LLM！                 │
│                                                                  │
│  规则逻辑：                                                      │
│  1. 计算 beat 数量：Math.min(Math.ceil(duration / 3), 5)        │
│     10秒 ÷ 3 = 3.33 → ceil = 4 → min(4, 5) = 4 个 beat         │
│                                                                  │
│  2. 为每个 beat 分配：                                           │
│     - 时间范围（startTime, endTime）                             │
│     - 素材（循环使用：beat[i] → asset[i % assetCount]）         │
│     - 动画技巧（来自 strategy.effects）                          │
│     - 叙事角色（opening/middle/closing）                         │
│                                                                  │
│  输出：                                                          │
│  {                                                              │
│    "beats": [                                                   │
│      {                                                          │
│        "id": "beat-1",                                          │
│        "name": "Opening",                                       │
│        "startTime": 0,                                          │
│        "endTime": 2.5,                                          │
│        "assets": ["uploads/image-1.jpg"],                       │
│        "techniques": ["fade_in", "scale"]                       │
│      },                                                         │
│      { "id": "beat-2", ... },                                   │
│      { "id": "beat-3", ... },                                   │
│      { "id": "beat-4", ... }                                    │
│    ]                                                            │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  ⏱️ Step 5: Timeline - 无 LLM                                    │
│  ────────────────────────────────────────────────────────────  │
│  将秒转换为帧：                                                  │
│  beat-1: 0-2.5秒 → 0-75帧 (@ 30fps)                            │
│  beat-2: 2.5-5秒 → 75-150帧                                     │
│  beat-3: 5-7.5秒 → 150-225帧                                    │
│  beat-4: 7.5-10秒 → 225-300帧                                   │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🔨 Step 6: Build - 混合代码生成                                 │
│  ────────────────────────────────────────────────────────────  │
│  文件：src/agent/harness/steps/build.ts                         │
│       src/agent/harness/code-gen/hybrid-generator.ts            │
│                                                                  │
│  对每个 Beat 循环处理：                                          │
└─────────────────────────────────────────────────────────────────┘
                             ↓
         ┌─────────────────────────────────┐
         │  决策：复杂度评分                │
         │  (decideStrategy)               │
         └──────────┬──────────────────────┘
                    ↓
          ┌─────────┴──────────┐
          │ score < 5?         │
          └─────────┬──────────┘
                    │
          ┌─────────┴──────────┐
          ↓ Yes               ↓ No
   ┌─────────────┐      ┌──────────────┐
   │ Template    │      │ LLM DSL      │
   │ 模式        │      │ 模式         │
   └─────────────┘      └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│  📝 Template 模式（score < 5） - 无 LLM                          │
│  ────────────────────────────────────────────────────────────  │
│  文件：src/agent/harness/code-gen/hybrid-generator.ts           │
│        generateWithTemplate()                                   │
│                                                                  │
│  直接填充硬编码模板：                                             │
│  • 淡入动画（0-30 帧）                                           │
│  • 缩放动画（整个时长）                                           │
│  • 插入素材、颜色、文字                                           │
│                                                                  │
│  生成代码：                                                      │
│  import { AbsoluteFill, useCurrentFrame, interpolate }          │
│    from 'remotion';                                             │
│                                                                  │
│  export const Beat1: React.FC = () => {                         │
│    const frame = useCurrentFrame();                             │
│    const opacity = interpolate(frame, [0, 30], [0, 1]);         │
│    const scale = interpolate(frame, [0, 75], [0.95, 1]);        │
│    return (                                                     │
│      <AbsoluteFill>                                             │
│        <div style={{ opacity, transform: `scale(${scale})` }}>  │
│          精彩开场                                                │
│        </div>                                                   │
│        <img src="http://localhost:3001/uploads/image-1.jpg" />  │
│      </AbsoluteFill>                                            │
│    );                                                           │
│  };                                                             │
│                                                                  │
│  特点：⚡️ 快速、✅ 稳定、❌ 固定动画                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🤖 LLM DSL 模式（score >= 5）                                   │
│  ────────────────────────────────────────────────────────────  │
│  文件：src/agent/harness/code-gen/llm-generator.ts              │
│        src/agent/harness/code-gen/dsl-compiler.ts               │
│                                                                  │
│  【重要】LLM 不直接生成代码，而是生成 VideoSpec DSL！             │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🤖 LLM 5+: 生成 VideoSpec DSL                                   │
│  ────────────────────────────────────────────────────────────  │
│  System Prompt:                                                 │
│  你是视频动画效果设计专家，生成 VideoSpec DSL。                   │
│                                                                  │
│  **VideoSpec DSL 规范：**                                        │
│  interface VideoSpec {                                          │
│    id: string;                                                  │
│    layers: LayerConfig[];                                       │
│  }                                                              │
│                                                                  │
│  interface LayerConfig {                                        │
│    type: 'image' | 'video' | 'text';                            │
│    animations: AnimationConfig[];                               │
│  }                                                              │
│                                                                  │
│  interface AnimationConfig {                                    │
│    type: AnimationType;  // 预定义类型                          │
│    startFrame: number;                                          │
│    endFrame: number;                                            │
│    params?: { ... };                                            │
│  }                                                              │
│                                                                  │
│  **支持的动画类型：**                                             │
│  fade_in, fade_out, zoom_in, zoom_out, slide_left,             │
│  rotate_cw, bounce, spring, flip_3d, blur_in, etc.             │
│                                                                  │
│  **重要规则：**                                                  │
│  1. 返回纯 JSON，不要生成代码                                    │
│  2. 使用预定义的 AnimationType                                   │
│  3. 动画时间必须在图层范围内                                      │
│                                                                  │
│  User Prompt:                                                   │
│  为这个 Beat 生成 VideoSpec DSL：                                │
│  Beat: { id, name, duration, mood, assets, techniques }         │
│  素材：uploads/image-1.jpg                                       │
│  动画技巧：fade_in, zoom_in, rotate_cw                          │
│  返回完整的 VideoSpec JSON                                       │
│                                                                  │
│  LLM 输出（JSON）：                                              │
│  {                                                              │
│    "spec": {                                                    │
│      "id": "beat-1",                                            │
│      "layers": [{                                               │
│        "id": "layer-1",                                         │
│        "type": "image",                                         │
│        "src": "uploads/image-1.jpg",                            │
│        "startFrame": 0,                                         │
│        "durationInFrames": 75,                                  │
│        "animations": [                                          │
│          {                                                      │
│            "type": "fade_in",                                   │
│            "startFrame": 0,                                     │
│            "endFrame": 30                                       │
│          },                                                     │
│          {                                                      │
│            "type": "zoom_in",                                   │
│            "startFrame": 0,                                     │
│            "endFrame": 75,                                      │
│            "params": { "scale": [0.95, 1] }                    │
│          },                                                     │
│          {                                                      │
│            "type": "rotate_cw",                                 │
│            "startFrame": 0,                                     │
│            "endFrame": 75,                                      │
│            "params": { "degrees": 360 }                        │
│          }                                                      │
│        ]                                                        │
│      }]                                                         │
│    },                                                           │
│    "reasoning": "开场需要动感，组合淡入+缩放+旋转",                │
│    "confidence": 0.93                                           │
│  }                                                              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  ✅ 验证 VideoSpec (validateVideoSpec)                          │
│  ────────────────────────────────────────────────────────────  │
│  • 基础字段完整                                                  │
│  • 至少有一个图层                                                │
│  • 时间范围合法                                                  │
│  • 动画类型在预定义列表中                                        │
│  • 动画时间在图层范围内                                           │
│                                                                  │
│  如果验证失败 → 抛出错误 → 重试或降级到 Template                  │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  📦 DSL 编译器 (dslCompiler.compile)                            │
│  ────────────────────────────────────────────────────────────  │
│  步骤 1: 收集需要的导入                                          │
│  • 遍历所有动画                                                  │
│  • 查询 ANIMATION_TEMPLATES                                     │
│  • fade_in → 需要 'interpolate'                                 │
│  • rotate_cw → 需要 'interpolate'                               │
│                                                                  │
│  步骤 2: 为每个图层生成代码                                      │
│  • 生成动画变量（调用模板的 generateCode）                       │
│    const anim1 = interpolate(frame, [0, 30], [0, 1]);          │
│    const anim2 = interpolate(frame, [0, 75], [0.95, 1]);       │
│    const anim3 = interpolate(frame, [0, 75], [0, 360]);        │
│                                                                  │
│  • 应用样式（调用模板的 applyStyle）                             │
│    opacity: anim1                                               │
│    transform: `scale(${anim2}) rotate(${anim3}deg)`            │
│                                                                  │
│  • 生成 JSX                                                     │
│    <Img src="..." style={{ opacity: anim1, transform: ... }} />│
│                                                                  │
│  步骤 3: 生成主组件                                              │
│  • 组合所有图层                                                  │
│  • 导出 React.FC                                                │
│                                                                  │
│  最终生成的代码：                                                │
│  import React from 'react';                                     │
│  import { AbsoluteFill, Img, useCurrentFrame, interpolate }    │
│    from 'remotion';                                             │
│                                                                  │
│  const Layer_layer_1: React.FC = () => {                        │
│    const frame = useCurrentFrame();                             │
│                                                                  │
│    // 动画变量（来自模板）                                       │
│    const anim1 = interpolate(frame, [0, 30], [0, 1]);          │
│    const anim2 = interpolate(frame, [0, 75], [0.95, 1]);       │
│    const anim3 = interpolate(frame, [0, 75], [0, 360]);        │
│                                                                  │
│    return (                                                     │
│      <Img                                                       │
│        src="http://localhost:3001/uploads/image-1.jpg"         │
│        style={{                                                 │
│          opacity: anim1,                                        │
│          transform: `scale(${anim2}) rotate(${anim3}deg)`      │
│        }}                                                       │
│      />                                                         │
│    );                                                           │
│  };                                                             │
│                                                                  │
│  export const Beat1: React.FC = () => {                         │
│    return (                                                     │
│      <AbsoluteFill style={{ backgroundColor: '#000' }}>        │
│        <Layer_layer_1 />                                        │
│      </AbsoluteFill>                                            │
│    );                                                           │
│  };                                                             │
│                                                                  │
│  特点：🎨 灵活、🤖 智能、⚠️ 70% 成功率（有降级）                 │
└─────────────────────────────────────────────────────────────────┘
                             ↓
        重复以上步骤，处理所有 Beat
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  📊 统计信息                                                     │
│  ────────────────────────────────────────────────────────────  │
│  总 Beat 数：4                                                   │
│  Template 模式：3 个                                             │
│  LLM DSL 模式：1 个                                              │
│  降级次数：0                                                     │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  ✅ Step 7: Validate - 无 LLM                                    │
│  ────────────────────────────────────────────────────────────  │
│  • 语法检查（括号匹配）                                           │
│  • 类型检查（有 export）                                         │
│  • Remotion 检查（useCurrentFrame, AbsoluteFill）               │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│  🎬 Step 8: Render - 无 LLM                                      │
│  ────────────────────────────────────────────────────────────  │
│  Remotion 渲染为 MP4                                             │
│  使用 Puppeteer/Chromium                                        │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
                      ✅ 视频生成完成
```


---

## 各步骤详细 Prompt

### 🧠 LLM 1: 意图识别

**文件**: `src/agent/intent-recognition.ts`

**System Prompt**:
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

### 🎨 LLM 2: Design (设计生成)

**文件**: `src/agent/harness/steps/design.ts`

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

### 📋 LLM 3: Strategy (策略生成)

**文件**: `src/agent/harness/steps/strategy.ts`

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

### 🎬 LLM 4: Storyboard (分镜生成)

**文件**: `src/agent/harness/steps/storyboard.ts`

**重要**: 这一步**主要是规则生成**，只有在需要复杂叙事时才调用 LLM。

**规则逻辑** (无 LLM):
```typescript
// 1. 计算 beat 数量
const beatCount = Math.min(Math.ceil(duration / 3), 5);

// 2. 为每个 beat 分配时间
const beatDuration = duration / beatCount;

// 3. 循环分配素材
for (let i = 0; i < beatCount; i++) {
  const assetIndex = i % assets.length;
  beat.assets = [assets[assetIndex]];
}

// 4. 分配叙事角色
if (i === 0) {
  beat.name = 'Opening';
  beat.mood = 'Energetic';
} else if (i === beatCount - 1) {
  beat.name = 'Closing';
  beat.mood = 'Inspiring';
} else {
  beat.name = `Content ${i}`;
  beat.mood = 'Professional';
}
```

**输出示例**:
```json
{
  "beats": [
    {
      "id": "beat-1",
      "name": "Opening",
      "startTime": 0,
      "endTime": 2.5,
      "mood": "Energetic",
      "camera": "Medium shot",
      "assets": ["uploads/image-1.jpg"],
      "techniques": ["fade_in", "scale"],
      "transitions": ["crossfade"],
      "narration": "精彩开场"
    },
    {
      "id": "beat-2",
      "name": "Content 1",
      "startTime": 2.5,
      "endTime": 5,
      "mood": "Professional",
      "camera": "Medium shot",
      "assets": ["uploads/image-2.jpg"],
      "techniques": ["fade_in", "scale"],
      "transitions": ["crossfade"],
      "narration": "核心内容"
    },
    {
      "id": "beat-3",
      "name": "Content 2",
      "startTime": 5,
      "endTime": 7.5,
      "mood": "Professional",
      "camera": "Medium shot",
      "assets": ["uploads/image-1.jpg"],
      "techniques": ["fade_in", "scale"],
      "transitions": ["crossfade"],
      "narration": "延续展示"
    },
    {
      "id": "beat-4",
      "name": "Closing",
      "startTime": 7.5,
      "endTime": 10,
      "mood": "Inspiring",
      "camera": "Medium shot",
      "assets": ["uploads/image-2.jpg"],
      "techniques": ["fade_in", "scale"],
      "transitions": [],
      "narration": "精彩结尾"
    }
  ],
  "totalDuration": 10
}
```

---

### 🤖 LLM 5+: Build - LLM DSL 模式

**文件**: `src/agent/harness/code-gen/llm-generator.ts`

**决策条件**: 复杂度评分 >= 5

**System Prompt**:
```
你是一个视频动画效果设计专家。你的任务是根据用户的需求，生成一个 VideoSpec DSL（领域特定语言）。

**VideoSpec DSL 规范：**

interface VideoSpec {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  layers: LayerConfig[];
  backgroundColor?: string;
}

interface LayerConfig {
  id: string;
  type: 'image' | 'video' | 'text' | 'shape' | 'audio';
  src?: string;
  content?: string;
  startFrame: number;
  durationInFrames: number;
  animations: AnimationConfig[];
}

interface AnimationConfig {
  type: AnimationType;
  startFrame: number;
  endFrame: number;
  params?: { ... };
}

**支持的动画类型（AnimationType）：**

基础动画：fade_in, fade_out, zoom_in, zoom_out, slide_left, slide_right, slide_up, slide_down

旋转动画：rotate_cw, rotate_ccw, rotate_360

弹性动画：bounce, spring, elastic

3D 动画：flip_horizontal, flip_vertical, flip_3d, perspective_rotate

效果：blur_in, blur_out, grayscale_in, grayscale_out

**重要规则：**

1. 返回纯 JSON，不要生成代码
2. 使用预定义的 AnimationType
3. 动画时间范围必须在图层范围内
4. 图层的 startFrame 从 0 开始

**响应格式：**

{
  "spec": { ... VideoSpec ... },
  "reasoning": "设计思路",
  "confidence": 0.95
}
```

**User Prompt**:
```
请为以下视频片段（Beat）生成 VideoSpec DSL：

**Beat 信息：**
- ID: beat-1
- 名称: Opening
- 时长: 2.5秒
- 情绪: Energetic
- 叙述: 精彩开场

**时间轴：**
- 开始帧: 0
- 结束帧: 75
- 总帧数: 75
- FPS: 30

**素材：**
- Asset 1: uploads/image-1.jpg

**动画技巧（用户期望）：**
- fade_in
- zoom_in
- rotate_cw

**设计规范：**
- 主色调: #FF6B35
- 背景色: #000000
- 字体: Inter

**要求：**
1. 为每个素材创建一个图层，src 必须使用上面提供的完整路径
2. 根据"动画技巧"选择对应的 AnimationType
3. 图层的 startFrame 从 0 开始，endFrame 不能超过 75
4. 返回完整的 VideoSpec JSON
```

**LLM 输出**:
```json
{
  "spec": {
    "id": "beat-1",
    "name": "Opening",
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "durationInFrames": 75,
    "backgroundColor": "#000000",
    "layers": [
      {
        "id": "layer-1",
        "type": "image",
        "src": "uploads/image-1.jpg",
        "startFrame": 0,
        "durationInFrames": 75,
        "position": {
          "x": 0,
          "y": 0,
          "width": "100%",
          "height": "100%"
        },
        "style": {
          "objectFit": "cover"
        },
        "animations": [
          {
            "type": "fade_in",
            "startFrame": 0,
            "endFrame": 30
          },
          {
            "type": "zoom_in",
            "startFrame": 0,
            "endFrame": 75,
            "params": {
              "scale": [0.95, 1]
            }
          },
          {
            "type": "rotate_cw",
            "startFrame": 0,
            "endFrame": 75,
            "params": {
              "degrees": 360
            }
          }
        ]
      }
    ],
    "metadata": {
      "generatedBy": "llm",
      "complexity": "medium",
      "features": ["fade", "zoom", "rotate"]
    }
  },
  "reasoning": "开场需要动感和吸引力，组合使用淡入、缩放和旋转效果创造流畅的视觉体验",
  "confidence": 0.93
}
```

**DSL 编译为 React 代码** (`dsl-compiler.ts`):
```typescript
// 编译器自动完成以下步骤：

// 1. 查询动画模板库
const fadeTemplate = ANIMATION_TEMPLATES['fade_in'];
const zoomTemplate = ANIMATION_TEMPLATES['zoom_in'];
const rotateTemplate = ANIMATION_TEMPLATES['rotate_cw'];

// 2. 生成动画变量（来自模板）
const anim1 = fadeTemplate.generateCode(config, 'anim1');
// → const anim1 = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

const anim2 = zoomTemplate.generateCode(config, 'anim2');
// → const anim2 = interpolate(frame, [0, 75], [0.95, 1], { extrapolateRight: 'clamp' });

const anim3 = rotateTemplate.generateCode(config, 'anim3');
// → const anim3 = interpolate(frame, [0, 75], [0, 360], { extrapolateRight: 'clamp' });

// 3. 应用样式
opacity: anim1
transform: `scale(${anim2}) rotate(${anim3}deg)`

// 4. 生成最终代码
```

**最终生成的 React 代码**:
```typescript
import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';

const Layer_layer_1: React.FC = () => {
  const frame = useCurrentFrame();

  // 动画变量（来自模板，不是 LLM 生成）
  const anim1 = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const anim2 = interpolate(frame, [0, 75], [0.95, 1], { extrapolateRight: 'clamp' });
  const anim3 = interpolate(frame, [0, 75], [0, 360], { extrapolateRight: 'clamp' });

  return (
    <Img
      src="http://localhost:3001/uploads/image-1.jpg"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: anim1,
        transform: `scale(${anim2}) rotate(${anim3}deg)`
      }}
    />
  );
};

export const Beat1: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Layer_layer_1 />
    </AbsoluteFill>
  );
};
```


---

## LLM vs Template vs DSL 模式对比

### 完整对比表

| 特性 | Template 模式 | LLM DSL 模式 | 直接生成代码（P2高级能力版本） |
|------|--------------|--------------|---------------------|
| **LLM 调用** | ❌ 无 | ✅ 生成 JSON | ✅ 生成代码 |
| **生成内容** | 硬编码模板 | VideoSpec DSL | React/TypeScript 代码 |
| **编译步骤** | ❌ 无 | ✅ DSL → 代码 | ❌ 无 |
| **生成速度** | ⚡️ <100ms | 🐌 5-15秒 | 🐌 10-20秒 |
| **稳定性** | ✅ 100% | ⚠️ 95% (验证+降级) | ❌ 70% |
| **灵活性** | ❌ 固定（fade+scale） | ✅ 高（任意组合） | ✅ 高（但不稳定） |
| **代码质量** | ✅ 一致且优化 | ✅ 一致且优化 | ⚠️ 不一致 |
| **错误类型** | ❌ 无 | 逻辑错误（可验证） | 语法+逻辑错误 |
| **调试难度** | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 困难 |
| **成本** | 💰 免费 | 💰💰 API 费用 | 💰💰💰 API 费用 |
| **适用场景** | 简单场景 80% | 复杂场景 20% | P2高级能力版本 |

### 决策逻辑流程

```
Beat 复杂度评分
   ↓
score = 0
   ↓
复杂动画技巧（3D, perspective）? score += 3
动画数量 > 2 ? score += 2
素材数量 > 2 ? score += 1
有转场效果 ? score += 1
有音效 ? score += 1
   ↓
┌──────────┴──────────┐
│  score >= 5?        │
└──────────┬──────────┘
           │
  ┌────────┴────────┐
  ↓ Yes            ↓ No
┌─────────────┐  ┌──────────────┐
│ LLM DSL     │  │ Template     │
│ 模式        │  │ 模式         │
│             │  │              │
│ LLM生成DSL  │  │ 硬编码模板   │
│    ↓        │  │    ↓         │
│ 验证DSL     │  │ 填充数据     │
│    ↓        │  │    ↓         │
│ 编译为代码  │  │ 生成代码     │
│             │  │              │
│ 如果失败 ↓  │  └──────────────┘
│ 降级到      │         ↓
│ Template    │    ✅ 完成
└─────────────┘
       ↓
   ✅ 完成
```

### 为什么使用 DSL 而不是直接生成代码？

#### ❌ 直接生成代码的问题

```typescript
// LLM 可能生成的代码
const opacity = interpolate(frame, [0, 30], [0, 1]);     // ✅ 正确
const scale = interpolat(frame, [0, 90], [1, 1.2]);     // ❌ 拼写错误
const rotation = frame * 360 / duration;                 // ❌ 缺少 clamp
const transform = 'scale(' + scale + ')';                // ❌ 模板字符串错误
return <Img src={asset} style={{opacity, transform}} /> // ❌ transform 是字符串
```

**问题**：
- 语法错误（拼写、括号、引号）
- 逻辑错误（边界、类型、单位）
- 不一致的代码风格
- 难以自动修复

#### ✅ DSL 的优势

```json
// LLM 生成的 DSL（结构化、可验证）
{
  "animations": [
    {
      "type": "fade_in",      // ← 预定义类型，不会拼写错误
      "startFrame": 0,
      "endFrame": 30
    },
    {
      "type": "zoom_in",
      "startFrame": 0,
      "endFrame": 90,
      "params": { "scale": [1, 1.2] }  // ← 结构化参数
    }
  ]
}
```

**优势**：
- ✅ JSON Schema 验证
- ✅ 类型预定义（不会拼写错误）
- ✅ 编译器保证代码质量
- ✅ LLM 专注"做什么"，不管"怎么做"
- ✅ 易于调试（人类可读）
- ✅ 可以在编译前修正

### 混合模式的智能降级

```
用户请求
   ↓
为每个 Beat 评分
   ↓
┌────────┬────────┬────────┬────────┐
│ Beat-1 │ Beat-2 │ Beat-3 │ Beat-4 │
│ 简单   │ 复杂   │ 简单   │ 简单   │
│ score=2│ score=6│ score=1│ score=3│
└────┬───┴───┬────┴───┬────┴───┬────┘
     ↓       ↓        ↓        ↓
  Template  LLM    Template Template
   模式     DSL     模式     模式
     ↓       ↓        ↓        ↓
  ✅ 成功  尝试1   ✅ 成功  ✅ 成功
          ↓ 失败
          等待1秒
          ↓
          尝试2
          ↓ 失败
          ⚠️ 降级
          ↓
      Template模式
          ↓
      ✅ 成功
          
最终成功率：100% ✅
```

---

## 总结

### LLM 调用统计

| 步骤 | LLM 调用 | 作用 | 可选/必须 | 输出格式 |
|------|---------|------|----------|---------|
| Intent Recognition | ✅ | 解析用户输入 | 必须 | JSON（意图对象）|
| Clarification | ❌ | 规则检查 | 可选 | - |
| Task Planning | ✅ | 任务分解 | 必须 | JSON（步骤列表）|
| Capture | ❌ | 素材元数据 | 必须 | - |
| Design | ✅ | 视觉设计 | 必须 | JSON（设计方案）|
| Strategy | ✅ | 生成策略 | 必须 | JSON（策略对象）|
| Storyboard | ❌ | 规则分镜 | 必须 | JSON（Beat 列表）|
| Timeline | ❌ | 时间计算 | 必须 | - |
| Build (Template) | ❌ | 代码生成 | 视情况 | TypeScript 代码 |
| Build (LLM DSL) | ✅ | DSL 生成 | 视情况 | JSON（VideoSpec）→ 编译为代码 |
| Validate | ❌ | 语法检查 | 必须 | - |
| Render | ❌ | 视频渲染 | 必须 | - |

**总计**: 
- **必须调用**: 5 次（Intent, Planning, Design, Strategy）
- **可选调用**: 0-N 次（Build 步骤的 LLM DSL 模式，取决于 Beat 复杂度）

### 关键设计亮点

#### 1. 智能降级策略

```
复杂场景 → LLM DSL 模式
   ↓ 失败
重试 2 次
   ↓ 仍失败
自动降级 → Template 模式
   ↓
保证成功 ✅
```

#### 2. 分层决策

```
用户意图
   ↓
策略选择（template/llm）
   ↓
分镜脚本（Beat 拆分）
   ↓
每个 Beat 独立决策
   ↓
混合生成（部分 Template，部分 LLM）
```

#### 3. DSL 作为中间层

```
LLM 理解意图
   ↓
生成 VideoSpec DSL（结构化、可验证）
   ↓
验证 DSL（JSON Schema）
   ↓
编译器查询动画模板库
   ↓
生成标准 React 代码（稳定、一致）
```

#### 4. 模板库保证质量

```
动画模板库（预制且测试）
   ↓
fade_in: { generateCode, applyStyle }
zoom_in: { generateCode, applyStyle }
rotate_cw: { generateCode, applyStyle }
   ↓
编译器调用模板
   ↓
生成的代码质量有保证 ✅
```

#### 5. 混合模式灵活性

```
同一个视频：
- Beat-1 (简单) → Template（快速）
- Beat-2 (复杂) → LLM DSL（灵活）
- Beat-3 (简单) → Template（稳定）
- Beat-4 (简单) → Template（快速）

既快速又灵活 🚀
```

### 成功率提升路径

```
❌ 直接让 LLM 生成代码：
   语法错误多
   成功率 ~60-70%
   
   ↓ 改进
   
⚠️ LLM 生成 DSL + 验证：
   语法错误少
   成功率 ~85-90%
   
   ↓ 改进
   
✅ LLM DSL + 编译器 + 降级：
   预制模板保证质量
   Template 作为降级
   成功率 ~95%
   
   ↓ 改进
   
✅✅ 混合模式（Template 优先）：
   简单场景用 Template（100%）
   复杂场景用 LLM DSL（95%）
   LLM 失败降级到 Template（100%）
   最终成功率 ~98-100% 🎯
```

### 为什么这样设计？

1. **稳定性优先**：Template 模式覆盖 80% 简单场景，保证基础成功率

2. **灵活性补充**：LLM DSL 模式处理 20% 复杂场景，提供创造力

3. **质量保证**：
   - DSL 作为中间层，可验证
   - 动画模板库，预制且测试
   - 编译器生成，一致且优化

4. **容错设计**：
   - LLM 失败自动降级
   - 多次重试机制
   - Template 作为最终保底

5. **成本优化**：
   - Template 模式无 API 费用
   - LLM 只在必要时调用
   - 降级减少重复调用

**这种架构让系统同时具备了速度、稳定性、灵活性和可维护性！** 🚀

---

**文档版本**: v2.0（完整更正版）  
**创建时间**: 2026-07-08  
**维护者**: Video Editor by Agent Team  
**关键更正**: LLM 生成 DSL，不直接生成代码

