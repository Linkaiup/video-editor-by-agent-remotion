/**
 * 意图识别模块 - 分析用户消息以提取编辑意图
 *
 * 本模块负责：
 * 1. 解析用户的自然语言输入
 * 2. 识别编辑动作类型（创建、编辑、添加特效等）
 * 3. 提取实体信息（素材、特效、时长等）
 * 4. 计算置信度分数
 * 5. 确认意图并请求必要的澄清
 */
import OpenAI from 'openai';
import { AGENT_CONFIG, SYSTEM_PROMPTS } from './config.js';
import { createTracer } from './tracing.js';
import { withRetry } from './llm-retry.js';
// 初始化 OpenAI API 客户端
const openai = new OpenAI({
    apiKey: AGENT_CONFIG.apiKey,
    baseURL: AGENT_CONFIG.apiBase,
    defaultHeaders: {
        'User-Agent': 'Remotion-Video-Agent/0.1.0',
    },
    timeout: 60000, // 60秒超时
});
// 创建追踪器用于记录操作
const tracer = createTracer('IntentRecognition');
/**
 * 识别用户意图
 *
 * 使用 OpenAI LLM 分析用户消息，提取结构化的意图信息
 *
 * @param userMessage - 用户输入的自然语言消息
 * @returns 结构化的用户意图对象
 *
 * @example
 * const intent = await recognizeIntent("创建一个 5 秒的视频并添加淡入效果");
 * // 返回: { type: 'create', entities: { duration: 5, effects: ['fade'] }, confidence: 0.95 }
 */
export async function recognizeIntent(userMessage) {
    const trace = tracer.startTrace('recognize_intent', { message: userMessage });
    try {
        // 使用重试包装器调用 OpenAI API 进行意图识别
        tracer.log('info', 'OpenAI API 请求开始', {
            model: AGENT_CONFIG.model,
            baseURL: AGENT_CONFIG.apiBase,
            messageLength: userMessage.length,
        });
        const response = await withRetry(() => openai.chat.completions.create({
            model: AGENT_CONFIG.model,
            max_tokens: 1024,
            temperature: AGENT_CONFIG.temperature,
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPTS.intentRecognition,
                },
                {
                    role: 'user',
                    content: `分析这个视频编辑请求并提取结构化意图：\n\n"${userMessage}"\n\n返回 JSON 格式，包含: type, description, confidence (0-1), entities {assets, effects, transitions, duration, position, text}`,
                },
            ],
        }), 'intent_recognition', {
            maxRetries: 3,
            retryDelay: 2000,
            exponentialBackoff: true,
        });
        tracer.log('info', 'OpenAI API 响应成功', {
            usage: response.usage,
            model: response.model,
        });
        // 提取响应内容
        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('OpenAI API 返回了空响应');
        }
        // 从响应中提取 JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('响应中未找到 JSON 格式的数据');
        }
        const intent = JSON.parse(jsonMatch[0]);
        // 记录追踪信息
        trace.end({ intent });
        return intent;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        tracer.log('error', '意图识别失败', { error: errorMessage });
        trace.end({ error: errorMessage });
        throw error;
    }
}
/**
 * 确认用户意图
 *
 * 检查识别出的意图是否完整和明确，如果需要则生成澄清问题
 *
 * @param intent - 已识别的用户意图
 * @param context - 对话上下文（用于更准确的判断）
 * @returns 意图确认对象，包含是否需要澄清和澄清问题列表
 *
 * @example
 * const confirmation = await confirmIntent(intent, []);
 * if (confirmation.needsConfirmation) {
 *   console.log('需要澄清:', confirmation.clarifications);
 * }
 */
export async function confirmIntent(intent, context) {
    const trace = tracer.startTrace('confirm_intent', { intent, context });
    try {
        const clarifications = [];
        let needsConfirmation = false;
        // 检查置信度阈值
        // 如果置信度低于 0.7，说明理解不够准确，需要用户确认
        if (intent.confidence < 0.7) {
            needsConfirmation = true;
            clarifications.push(`置信度较低 (${intent.confidence.toFixed(2)})。您是想 ${intent.type} 吗？`);
        }
        // 检查创建视频时是否指定了素材
        if (intent.type === 'create' && !intent.entities.assets?.length) {
            needsConfirmation = true;
            clarifications.push('未指定素材。请问应该使用哪些图片或视频？');
        }
        // 检查是否指定了时长
        if (intent.entities.duration === undefined && intent.type === 'create') {
            clarifications.push('未指定时长。是否使用默认值（每个素材 5 秒）？');
        }
        // 检查特效和素材的匹配
        // 如果指定了特效但没有素材，无法应用
        if (intent.entities.effects?.length && !intent.entities.assets?.length) {
            needsConfirmation = true;
            clarifications.push('已指定特效但未指定目标素材。这些特效应该应用到哪些片段？');
        }
        // 构建确认对象
        const confirmation = {
            intent,
            clarifications,
            needsConfirmation,
        };
        trace.end({ confirmation });
        return confirmation;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        trace.end({ error: errorMessage });
        throw error;
    }
}
/**
 * 从消息中提取素材路径
 *
 * 使用正则表达式匹配文件路径、URL 等素材引用
 *
 * @param message - 用户消息
 * @returns 提取到的素材路径数组
 *
 * @example
 * extractAssets("使用 ./images/photo.jpg 和 video.mp4")
 * // 返回: ["./images/photo.jpg", "video.mp4"]
 */
export function extractAssets(message) {
    // 定义多种素材匹配模式
    const patterns = [
        // 文件路径（相对或绝对）
        /(?:\.\/|\/)[^\s]+\.(?:mp4|mov|avi|jpg|jpeg|png|gif|mp3|wav)/gi,
        // URL 路径
        /https?:\/\/[^\s]+\.(?:mp4|mov|avi|jpg|jpeg|png|gif|mp3|wav)/gi,
        // 引号包裹的文件名
        /"([^"]+\.(?:mp4|mov|avi|jpg|jpeg|png|gif|mp3|wav))"/gi,
        /'([^']+\.(?:mp4|mov|avi|jpg|jpeg|png|gif|mp3|wav))'/gi,
    ];
    const assets = new Set();
    // 遍历所有模式，提取匹配的素材
    for (const pattern of patterns) {
        const matches = message.matchAll(pattern);
        for (const match of matches) {
            // match[1] 是捕获组，match[0] 是完整匹配
            assets.add(match[1] || match[0]);
        }
    }
    return Array.from(assets);
}
/**
 * 从消息中提取特效关键词
 *
 * 根据预定义的关键词映射，识别用户想要的特效类型
 *
 * @param message - 用户消息
 * @returns 识别到的特效类型数组
 *
 * @example
 * extractEffects("添加淡入和缩放效果")
 * // 返回: ["fade", "zoom"]
 */
export function extractEffects(message) {
    // 特效关键词映射表
    // 键：特效类型，值：可能的关键词列表
    const effectKeywords = {
        fade: ['淡入', '淡出', 'fade', 'fade in', 'fade out'],
        zoom: ['缩放', '放大', '缩小', 'zoom', 'zoom in', 'zoom out', 'scale'],
        blur: ['模糊', '虚化', 'blur', 'blurry', 'defocus'],
        brightness: ['亮度', '变亮', '变暗', 'bright', 'brightness', 'darken', 'lighten'],
        contrast: ['对比度', 'contrast', 'contrasty'],
        saturate: ['饱和度', '鲜艳', 'saturate', 'saturation', 'vivid', 'vibrant'],
        grayscale: ['灰度', '黑白', 'grayscale', 'black and white', 'monochrome'],
        rotate: ['旋转', '转动', 'rotate', 'spin', 'rotation'],
        slide: ['滑动', '平移', '移动', 'slide', 'pan', 'move'],
    };
    const effects = new Set();
    const lowerMessage = message.toLowerCase();
    // 遍历关键词映射，检查消息中是否包含相关关键词
    for (const [effect, keywords] of Object.entries(effectKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            effects.add(effect);
        }
    }
    return Array.from(effects);
}
