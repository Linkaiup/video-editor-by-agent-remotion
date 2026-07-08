/**
 * Agent 配置和系统提示词
 *
 * 本模块包含：
 * 1. Agent 基础配置（模型、参数等）
 * 2. 各个功能模块的系统提示词
 * 3. 预设的视频规格（社交媒体、标准格式）
 */
/**
 * Agent 核心配置
 */
// 从环境变量读取 OpenAI API 配置
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY 环境变量未设置');
}
export const AGENT_CONFIG = {
    name: 'Remotion Video Editor Agent',
    version: '0.1.0',
    // OpenAI API 配置
    apiKey: OPENAI_API_KEY,
    apiBase: OPENAI_BASE_URL,
    model: OPENAI_MODEL,
    // 最大生成 token 数
    maxTokens: 4096,
    // 温度参数：控制生成的随机性（0-1）
    // 0.7 适合需要创造性的任务
    temperature: 0.7,
    // 重试配置
    retryConfig: {
        maxRetries: 3, // 最多重试 3 次
        retryDelay: 1000, // 初始重试延迟 1 秒
        exponentialBackoff: true, // 启用指数退避（1s, 2s, 4s）
    },
};
/**
 * 系统提示词配置
 *
 * 每个功能模块都有专门的系统提示词，用于指导 LLM 完成特定任务
 */
export const SYSTEM_PROMPTS = {
    /**
     * 意图识别提示词
     *
     * 功能：解析用户的自然语言输入，提取编辑意图
     * 输出：结构化的意图对象（JSON 格式）
     */
    intentRecognition: `你是一个视频编辑意图识别专家。
分析用户的消息并提取以下信息：
- 主要动作类型 (create创建, edit编辑, add_effect添加特效, add_transition添加转场, preview预览, export导出)
- 提到的素材 (图片、视频、音频文件)
- 期望的特效 (淡入淡出、缩放、模糊、颜色校正等)
- 片段之间的转场效果
- 时间轴信息 (时长、位置)
- 文本内容和样式

返回带有置信度分数的结构化意图对象（JSON 格式）。`,
    /**
     * 任务规划提示词
     *
     * 功能：将用户意图分解为可执行的步骤
     * 输出：详细的任务计划（JSON 格式）
     */
    taskPlanning: `你是一个基于 Remotion 的视频编辑任务规划师。
根据用户意图，将其分解为可执行的步骤：
1. 加载并验证素材
2. 创建组合结构
3. 应用特效和转场
4. 生成 React 组件代码
5. 验证输出

每个步骤应该具体且可测试。返回 JSON 格式的任务计划。`,
    /**
     * 代码生成提示词
     *
     * 功能：生成 Remotion React 组件代码
     * 输出：纯 TypeScript/React 代码
     */
    codeGeneration: `你是一个 Remotion React 组件代码生成器。
生成干净、类型安全的 React/TypeScript 代码，要求：
- 使用 Remotion 的内置组件 (Sequence, Video, Img, Audio 等)
- 使用 spring() 和 interpolate() 实现请求的特效
- 平滑处理转场效果
- 遵循性能最佳实践
- 使用 TypeScript 进行完整的类型定义

只输出组件代码，不要添加任何解释说明。`,
    /**
     * 验证提示词
     *
     * 功能：检查生成的组合和代码是否正确
     * 输出：验证结果（JSON 格式，包含错误和警告）
     */
    validation: `你是一个视频输出验证专家。
检查生成的组合是否存在以下问题：
- 时长和帧数是否正确
- 素材加载错误
- 特效时序问题
- 视觉故障或瑕疵
- 音频同步问题

对发现的任何问题提供详细反馈，返回 JSON 格式，包含 errors 和 warnings 数组。`,
};
/**
 * 视频预设配置
 *
 * 提供常用的视频规格，方便用户快速创建特定平台的视频
 */
export const VIDEO_PRESETS = {
    // 社交媒体平台预设
    social: {
        instagram_story: { width: 1080, height: 1920, fps: 30 }, // Instagram 故事（竖屏）
        instagram_post: { width: 1080, height: 1080, fps: 30 }, // Instagram 帖子（正方形）
        youtube: { width: 1920, height: 1080, fps: 60 }, // YouTube 视频（高帧率）
        tiktok: { width: 1080, height: 1920, fps: 30 }, // TikTok 视频（竖屏）
    },
    // 标准视频格式
    standard: {
        hd: { width: 1280, height: 720, fps: 30 }, // 720p HD
        fullhd: { width: 1920, height: 1080, fps: 30 }, // 1080p Full HD
        '4k': { width: 3840, height: 2160, fps: 30 }, // 4K Ultra HD
    },
};
