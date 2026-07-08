# Remotion Harness Agent - 方案设计文档

## 1. 总体架构

### 1.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
├─────────────────────┬───────────────────────────────────────┤
│   CLI Interface     │        Web UI (React)                 │
│   - 命令行交互      │   - 对话界面                           │
│   - 脚本调用        │   - 素材上传/管理                      │
│                     │   - 视频预览/下载                      │
└─────────────────────┴───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API 层 (Express)                          │
├─────────────────────────────────────────────────────────────┤
│  - RESTful API           - WebSocket (实时通信)             │
│  - 文件上传              - 进度推送                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   核心 Agent 层                              │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ 意图识别模块  │ 任务规划模块  │ 执行引擎     │ 上下文管理    │
│ (LLM)        │ (Harness)    │              │               │
└──────────────┴──────────────┴──────────────┴───────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Harness 工程化流程层                         │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ 规划生成     │ 代码生成      │ 校验模块     │ 调整优化      │
│ - 分步计划   │ - React代码   │ - 语法检查   │ - 错误修复    │
│ - 依赖分析   │ - 类型安全    │ - 渲染测试   │ - 参数调优    │
│ - 资源估算   │ - 模板应用    │ - 质量评分   │ - 重试机制    │
└──────────────┴──────────────┴──────────────┴───────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    基础服务层                                │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ 素材管理     │ Remotion渲染  │ 文件存储     │ 日志追踪      │
│ - 上传       │ - Bundle      │ - 会话       │ - 性能监控    │
│ - 处理       │ - Render      │ - 素材       │ - 错误追踪    │
│ - 缓存       │ - Export      │ - 模板       │               │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

## 2. 核心模块设计

### 2.1 Harness 工程化流程（P0 - 最高优先级）

#### 2.1.1 整体流程

```
用户输入 → 意图识别 → 工程化规划 → 代码生成 → 校验 → 调整 → 输出
                ↓            ↓           ↓        ↓      ↓
              确认意图    制定计划    生成代码   检查质量  修复问题
                          ↓
                    [规划生成阶段]
                    1. 分析需求
                    2. 拆解任务
                    3. 估算资源
                    4. 制定步骤
                          ↓
                    [执行阶段]
                    1. 按步骤生成
                    2. 实时校验
                    3. 错误捕获
                          ↓
                    [校验阶段]
                    1. 语法检查
                    2. 类型检查
                    3. 渲染测试
                    4. 质量评分
                          ↓
                    [调整优化阶段]
                    1. 自动修复
                    2. 参数调优
                    3. 重试机制
                    4. 人工确认（可选）
```

#### 2.1.2 规划生成模块

```typescript
interface HarnessPlan {
  id: string;
  intent: UserIntent;
  
  // 任务分解
  tasks: {
    id: string;
    type: 'validate' | 'generate' | 'render' | 'verify';
    description: string;
    dependencies: string[];
    estimatedTime: number;
    retryable: boolean;
  }[];
  
  // 资源需求
  resources: {
    assets: AssetRequirement[];
    memory: number;
    diskSpace: number;
  };
  
  // 质量标准
  qualityGates: {
    syntaxCheck: boolean;
    typeCheck: boolean;
    renderTest: boolean;
    minQualityScore: number;
  };
  
  // 风险评估
  risks: {
    level: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }[];
}

class HarnessPlanner {
  async createPlan(intent: UserIntent): Promise<HarnessPlan>;
  async validatePlan(plan: HarnessPlan): Promise<ValidationResult>;
  async optimizePlan(plan: HarnessPlan): Promise<HarnessPlan>;
}
```

#### 2.1.3 校验模块

```typescript
interface ValidationResult {
  passed: boolean;
  score: number; // 0-100
  
  checks: {
    syntax: {
      passed: boolean;
      errors: string[];
    };
    types: {
      passed: boolean;
      errors: string[];
    };
    render: {
      passed: boolean;
      frameCount: number;
      errors: string[];
    };
    quality: {
      smoothness: number;      // 0-100
      stability: number;       // 0-100
      performance: number;     // 0-100
    };
  };
  
  issues: Issue[];
  suggestions: string[];
}

class VideoValidator {
  // 语法检查
  async checkSyntax(code: string): Promise<SyntaxCheckResult>;
  
  // 类型检查
  async checkTypes(filePath: string): Promise<TypeCheckResult>;
  
  // 渲染测试（快速渲染关键帧）
  async testRender(compositionId: string): Promise<RenderTestResult>;
  
  // 质量评分
  async evaluateQuality(result: RenderTestResult): Promise<QualityScore>;
}
```

#### 2.1.4 调整优化模块

```typescript
class VideoOptimizer {
  // 自动修复常见问题
  async autoFix(issues: Issue[]): Promise<FixResult>;
  
  // 参数调优
  async optimizeParameters(
    composition: CompositionSpec,
    validationResult: ValidationResult
  ): Promise<CompositionSpec>;
  
  // 智能重试
  async retryWithAdjustments(
    plan: HarnessPlan,
    previousAttempts: Attempt[]
  ): Promise<ExecutionResult>;
}
```

### 2.2 上下文管理模块

```typescript
interface ConversationContext {
  sessionId: string;
  userId: string;
  
  // 对话历史
  messages: Message[];
  
  // 当前工作
  currentWork: {
    compositionId?: string;
    filePath?: string;
    assets: Asset[];
    status: 'idle' | 'planning' | 'generating' | 'rendering' | 'validating';
  };
  
  // 历史作品
  history: {
    compositionId: string;
    createdAt: Date;
    filePath: string;
    thumbnail?: string;
  }[];
  
  // 用户偏好
  preferences: {
    defaultDuration: number;
    defaultFps: number;
    defaultResolution: [number, number];
    qualityThreshold: number;
  };
}

class ContextManager {
  // 保存上下文
  async saveContext(context: ConversationContext): Promise<void>;
  
  // 加载上下文
  async loadContext(sessionId: string): Promise<ConversationContext>;
  
  // 更新当前工作
  async updateCurrentWork(
    sessionId: string,
    work: Partial<ConversationContext['currentWork']>
  ): Promise<void>;
  
  // 引用历史作品
  async getReferenceComposition(
    sessionId: string,
    ref: string // "上一个" | "刚才的" | compositionId
  ): Promise<CompositionSpec | null>;
}
```

### 2.3 素材管理模块

```typescript
interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio';
  originalName: string;
  storedPath: string;
  url: string;
  
  metadata: {
    size: number;
    width?: number;
    height?: number;
    duration?: number;
    format: string;
  };
  
  uploadedAt: Date;
  userId: string;
}

class AssetManager {
  // 上传素材
  async upload(file: File, userId: string): Promise<Asset>;
  
  // 列出素材
  async list(userId: string, filters?: AssetFilters): Promise<Asset[]>;
  
  // 删除素材
  async delete(assetId: string): Promise<void>;
  
  // 处理素材（压缩、转码、生成缩略图）
  async process(asset: Asset): Promise<Asset>;
  
  // 获取素材 URL
  async getUrl(assetId: string): Promise<string>;
}
```

## 3. Web UI 设计

### 3.1 页面结构

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | 素材 | 历史 | 设置                     │
├─────────────────────┬───────────────────────────────────┤
│                     │                                   │
│   素材面板          │       主工作区                     │
│   ┌──────────────┐  │  ┌─────────────────────────────┐ │
│   │ 上传按钮     │  │  │                             │ │
│   ├──────────────┤  │  │    对话界面                  │ │
│   │ [图片1] 400KB│  │  │    - 用户消息                │ │
│   │ [图片2] 520KB│  │  │    - Agent 回复              │ │
│   │ [视频1] 2.1MB│  │  │    - 进度显示                │ │
│   │ ...          │  │  │                             │ │
│   └──────────────┘  │  └─────────────────────────────┘ │
│                     │  ┌─────────────────────────────┐ │
│   历史记录          │  │                             │ │
│   ┌──────────────┐  │  │    视频预览                  │ │
│   │ 视频1        │  │  │    [播放器]                  │ │
│   │ 5秒 1080p   │  │  │                             │ │
│   ├──────────────┤  │  │    [下载] [分享] [重新编辑] │ │
│   │ 视频2        │  │  │                             │ │
│   │ 10秒 4K     │  │  └─────────────────────────────┘ │
│   └──────────────┘  │                                   │
└─────────────────────┴───────────────────────────────────┘
```

### 3.2 关键功能

#### 3.2.1 对话界面
- 实时消息流（WebSocket）
- Markdown 渲染
- 代码高亮
- 进度条展示
- 错误提示

#### 3.2.2 素材管理
- 拖拽上传
- 批量上传
- 预览缩略图
- 筛选搜索
- 删除管理

#### 3.2.3 视频预览与导出
- Remotion Player 集成
- 播放控制（播放/暂停/进度条）
- 时间轴显示
- 帧预览
- **一键导出多格式**
  - MP4（默认）
  - WebM
  - GIF（可选）
  - 帧序列（PNG/JPEG）
- 下载管理
- 分享功能

## 4. API 设计

### 4.1 RESTful API

```typescript
// 会话管理
POST   /api/sessions              // 创建会话
GET    /api/sessions/:id          // 获取会话
DELETE /api/sessions/:id          // 删除会话

// 消息
POST   /api/sessions/:id/messages // 发送消息
GET    /api/sessions/:id/messages // 获取历史消息

// 素材
POST   /api/assets                // 上传素材
GET    /api/assets                // 列出素材
DELETE /api/assets/:id            // 删除素材
GET    /api/assets/:id/url        // 获取素材URL

// 视频
GET    /api/videos                // 列出视频
GET    /api/videos/:id            // 获取视频详情
GET    /api/videos/:id/download   // 下载视频
DELETE /api/videos/:id            // 删除视频
```

### 4.2 WebSocket Events

```typescript
// 客户端 → 服务器
'message'           // 发送消息
'cancel'            // 取消当前任务

// 服务器 → 客户端
'message'           // Agent 回复
'progress'          // 进度更新
'plan_created'      // 计划已创建
'validation_result' // 校验结果
'video_ready'       // 视频就绪
'error'             // 错误信息
```

## 5. 数据存储设计

### 5.1 文件系统结构

```
data/
├── sessions/           # 会话数据
│   ├── {sessionId}.json
│   └── ...
├── assets/             # 用户素材
│   ├── {userId}/
│   │   ├── {assetId}.jpg
│   │   ├── {assetId}.mp4
│   │   └── metadata.json
│   └── ...
├── compositions/       # 生成的组合
│   ├── {compositionId}.tsx
│   └── ...
├── videos/             # 渲染的视频
│   ├── {compositionId}.mp4
│   └── thumbnails/
│       └── {compositionId}.jpg
└── logs/               # 日志
    ├── agent-{date}.log
    └── render-{date}.log
```

### 5.2 会话数据格式

```json
{
  "sessionId": "session-xxx",
  "userId": "user-123",
  "createdAt": "2026-07-07T08:00:00Z",
  "updatedAt": "2026-07-07T08:30:00Z",
  
  "messages": [
    {
      "role": "user",
      "content": "创建一个10秒的视频",
      "timestamp": "2026-07-07T08:00:00Z"
    },
    {
      "role": "assistant",
      "content": "好的，我来为您创建...",
      "timestamp": "2026-07-07T08:00:02Z"
    }
  ],
  
  "currentWork": {
    "compositionId": "comp-xxx",
    "status": "rendering",
    "progress": 0.65
  },
  
  "history": [
    {
      "compositionId": "comp-yyy",
      "createdAt": "2026-07-07T07:50:00Z",
      "filePath": "./videos/comp-yyy.mp4"
    }
  ],
  
  "preferences": {
    "defaultDuration": 5,
    "defaultFps": 30,
    "qualityThreshold": 85
  }
}
```

## 6. 质量保障措施

### 6.1 Harness 检查点

```typescript
const QUALITY_GATES = {
  // 代码质量
  syntax: {
    maxErrors: 0,
    required: true
  },
  
  types: {
    maxErrors: 0,
    required: true
  },
  
  // 渲染质量
  render: {
    minSuccessRate: 0.95,  // 95% 帧成功渲染
    maxDroppedFrames: 5,
    required: true
  },
  
  // 视频质量
  quality: {
    minSmoothness: 85,     // 流畅度 >= 85
    minStability: 90,      // 稳定性 >= 90
    minPerformance: 70,    // 性能 >= 70
    required: true
  }
};
```

### 6.2 自动重试策略

```typescript
const RETRY_STRATEGY = {
  maxAttempts: 3,
  
  strategies: [
    // 第1次重试：微调参数
    {
      adjustments: ['reduce_quality', 'simplify_effects'],
      timeout: 30000
    },
    
    // 第2次重试：降级方案
    {
      adjustments: ['fallback_template', 'remove_complex_animations'],
      timeout: 60000
    },
    
    // 第3次重试：最简方案
    {
      adjustments: ['minimal_effects', 'static_composition'],
      timeout: 90000
    }
  ]
};
```

## 7. 技术选型总结

| 层次 | 技术栈 | 说明 |
|------|--------|------|
| LLM | DeepSeek | 意图识别和规划 |
| 后端 | Node.js + Express | API 服务 |
| 前端 | React + TypeScript | Web UI |
| 渲染 | Remotion 4.x | 视频生成引擎 |
| 存储 | 文件系统 | 会话、素材、视频 |
| 通信 | WebSocket | 实时消息和进度 |
| 部署 | CLI + Web UI | 双模式支持 |

## 8. 开发计划

### Phase 2.1 - Harness 工程化（2-3周）
- Week 1: 规划生成模块、校验模块
- Week 2: 调整优化模块、重试机制
- Week 3: 集成测试、性能优化

### Phase 2.2 - 上下文管理（1周）
- 会话存储
- 历史引用
- 用户偏好

### Phase 2.3 - Web UI（2周）
- Week 1: 对话界面、素材管理
- Week 2: 视频预览、API 集成

### Phase 2.4 - 测试与优化（1周）
- 单元测试
- 集成测试
- 端到端测试
- 性能优化

**总计：6-7周**

---

**文档版本**：v1.0  
**创建时间**：2026-07-07  
**负责人**：Claude Code  
**审核状态**：待审核
