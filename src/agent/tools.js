/**
 * 工具函数模块 - Agent 的辅助工具集
 *
 * 本模块提供：
 * 1. 素材文件验证
 * 2. 代码文件保存和加载
 * 3. 时长格式转换
 * 4. 重试机制
 * 5. 组合规格验证
 */
import { existsSync, statSync, mkdirSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { createTracer } from './tracing.js';
const tracer = createTracer('Tools');
/**
 * 验证素材文件
 *
 * 检查素材文件是否存在、类型和基本属性
 *
 * @param assetPath - 素材文件路径
 * @returns 素材信息对象
 */
export async function validateAsset(assetPath) {
    const trace = tracer.startTrace('validate_asset', { path: assetPath });
    try {
        const exists = existsSync(assetPath);
        if (!exists) {
            trace.end({ exists: false });
            return {
                path: assetPath,
                type: 'unknown',
                exists: false,
            };
        }
        const stats = statSync(assetPath);
        const ext = extname(assetPath).toLowerCase();
        // 文件扩展名到类型的映射
        const typeMap = {
            '.mp4': 'video',
            '.mov': 'video',
            '.avi': 'video',
            '.webm': 'video',
            '.mkv': 'video',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.png': 'image',
            '.gif': 'image',
            '.webp': 'image',
            '.bmp': 'image',
            '.mp3': 'audio',
            '.wav': 'audio',
            '.aac': 'audio',
            '.ogg': 'audio',
            '.m4a': 'audio',
        };
        const info = {
            path: assetPath,
            type: typeMap[ext] || 'unknown',
            exists: true,
            size: stats.size,
        };
        trace.end({ info });
        return info;
    }
    catch (error) {
        trace.end({ error: error instanceof Error ? error.message : '未知错误' });
        throw error;
    }
}
/**
 * 保存组件代码到文件并更新 Root.tsx
 *
 * @param code - 生成的代码内容
 * @param componentName - 组件名称
 * @param outputDir - 输出目录（默认 ./src/compositions）
 * @returns 保存的文件路径
 */
export async function saveComponentCode(code, componentName, outputDir = './src/compositions') {
    const trace = tracer.startTrace('save_component', { componentName });
    try {
        // 确保输出目录存在
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }
        const filename = `${componentName}.tsx`;
        const filepath = join(outputDir, filename);
        // 保存组件代码
        await writeFile(filepath, code, 'utf-8');
        // 更新 Root.tsx 以注册新组合
        await updateRootFile(componentName, filepath);
        trace.end({ filepath });
        return filepath;
    }
    catch (error) {
        trace.end({ error: error instanceof Error ? error.message : '未知错误' });
        throw error;
    }
}
/**
 * 更新 Root.tsx 文件以注册新组合
 *
 * 策略：每次只保留 HelloWorld 和最新的组合，避免累积和冲突
 *
 * @param compositionId - 组合 ID
 * @param componentPath - 组件文件路径
 */
async function updateRootFile(compositionId, componentPath) {
    const rootPath = './src/Root.tsx';
    try {
        // 将组合 ID 转换为有效的标识符
        const safeComponentName = compositionId.replace(/[^a-zA-Z0-9]/g, '_');
        // 简单策略：每次重写整个 Root.tsx，只保留 HelloWorld 和最新的组合
        const rootContent = `import { Composition, registerRoot } from 'remotion';
import { HelloWorld } from './compositions/HelloWorld';
import { ${safeComponentName} as Comp_${safeComponentName} } from './compositions/${compositionId}';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="${compositionId}"
        component={Comp_${safeComponentName}}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

registerRoot(RemotionRoot);
`;
        // 写回文件
        await writeFile(rootPath, rootContent, 'utf-8');
        tracer.log('info', 'Root.tsx 已更新（完全重写）', { compositionId });
    }
    catch (error) {
        tracer.log('warn', 'Root.tsx 更新失败', { error: error instanceof Error ? error.message : '未知错误' });
    }
}
/**
 * 从文件加载组件代码
 *
 * @param filepath - 文件路径
 * @returns 代码内容
 */
export async function loadComponentCode(filepath) {
    const trace = tracer.startTrace('load_component', { filepath });
    try {
        const code = await readFile(filepath, 'utf-8');
        trace.end({ codeLength: code.length });
        return code;
    }
    catch (error) {
        trace.end({ error: error instanceof Error ? error.message : '未知错误' });
        throw error;
    }
}
/**
 * 格式化时长（从帧数到可读格式）
 *
 * @param frames - 帧数
 * @param fps - 帧率
 * @returns 格式化的时长字符串
 */
export function formatDuration(frames, fps) {
    const seconds = frames / fps;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    if (minutes > 0) {
        return `${minutes}分${remainingSeconds}秒`;
    }
    else if (remainingSeconds > 0) {
        return `${remainingSeconds}.${String(milliseconds).padStart(3, '0')}秒`;
    }
    else {
        return `${milliseconds}毫秒`;
    }
}
/**
 * 解析时长字符串为帧数
 *
 * 支持多种格式：5s, 1m30s, 500ms, 120f, 2.5
 *
 * @param duration - 时长字符串
 * @param fps - 帧率
 * @returns 帧数
 */
export function parseDuration(duration, fps) {
    const patterns = [
        { regex: /(\d+)分\s*(\d+)?秒?/, handler: (m) => (parseInt(m[1]) * 60 + (parseInt(m[2]) || 0)) * fps },
        { regex: /(\d+)m\s*(\d+)?s?/, handler: (m) => (parseInt(m[1]) * 60 + (parseInt(m[2]) || 0)) * fps },
        { regex: /(\d+(?:\.\d+)?)秒/, handler: (m) => parseFloat(m[1]) * fps },
        { regex: /(\d+(?:\.\d+)?)s/, handler: (m) => parseFloat(m[1]) * fps },
        { regex: /(\d+)毫秒/, handler: (m) => (parseInt(m[1]) / 1000) * fps },
        { regex: /(\d+)ms/, handler: (m) => (parseInt(m[1]) / 1000) * fps },
        { regex: /(\d+)帧/, handler: (m) => parseInt(m[1]) },
        { regex: /(\d+)f/, handler: (m) => parseInt(m[1]) },
    ];
    for (const { regex, handler } of patterns) {
        const match = duration.match(regex);
        if (match) {
            return Math.round(handler(match));
        }
    }
    // 默认：作为秒数处理
    return Math.round(parseFloat(duration) * fps);
}
/**
 * 带指数退避的重试辅助函数
 *
 * @param fn - 要执行的函数
 * @param maxRetries - 最大重试次数
 * @param initialDelay - 初始延迟（毫秒）
 * @param exponential - 是否使用指数退避
 * @returns 函数执行结果
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000, exponential = true) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error('未知错误');
            if (attempt < maxRetries) {
                const delay = exponential ? initialDelay * Math.pow(2, attempt) : initialDelay;
                tracer.log('warn', `尝试 ${attempt + 1} 失败，${delay}ms 后重试`, { error: lastError.message });
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError || new Error('超过最大重试次数');
}
/**
 * 生成唯一 ID
 *
 * @param prefix - ID 前缀
 * @returns 唯一 ID 字符串
 */
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * 处理本地图片素材
 *
 * 将本地图片转换为 base64 编码，可以直接嵌入代码中
 *
 * @param imagePath - 原始图片路径
 * @returns base64 data URL
 */
export async function processLocalImage(imagePath) {
    const trace = tracer.startTrace('process_local_image', { imagePath });
    try {
        // 检查是否是本地文件路径
        if (!imagePath.startsWith('http://') && !imagePath.startsWith('https://') && !imagePath.startsWith('data:')) {
            // 读取文件并转换为 base64
            const fs = await import('fs/promises');
            const buffer = await fs.readFile(imagePath);
            const base64 = buffer.toString('base64');
            // 获取文件扩展名来确定 MIME 类型
            const ext = extname(imagePath).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.bmp': 'image/bmp',
            };
            const mimeType = mimeTypes[ext] || 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${base64}`;
            tracer.log('info', '图片已转换为 base64', {
                original: imagePath,
                size: buffer.length,
                base64Length: base64.length
            });
            trace.end({ success: true, method: 'base64' });
            return dataUrl;
        }
        // 如果已经是 URL 或 data URL，直接返回
        trace.end({ success: true, unchanged: true });
        return imagePath;
    }
    catch (error) {
        tracer.log('error', '处理图片失败', { error: error instanceof Error ? error.message : '未知错误' });
        trace.end({ error: error instanceof Error ? error.message : '未知错误' });
        // 如果失败，返回原始路径
        return imagePath;
    }
}
/**
 * 根据预设名称获取视频尺寸
 *
 * @param preset - 预设名称
 * @returns 视频尺寸对象
 */
export function getVideoDimensions(preset) {
    const presets = {
        'instagram-story': { width: 1080, height: 1920, fps: 30 },
        'instagram-post': { width: 1080, height: 1080, fps: 30 },
        'youtube': { width: 1920, height: 1080, fps: 60 },
        'tiktok': { width: 1080, height: 1920, fps: 30 },
        'hd': { width: 1280, height: 720, fps: 30 },
        'fullhd': { width: 1920, height: 1080, fps: 30 },
        '4k': { width: 3840, height: 2160, fps: 30 },
    };
    // 中文预设名称映射
    const chineseMap = {
        'instagram故事': 'instagram-story',
        'instagram帖子': 'instagram-post',
        '抖音': 'tiktok',
        '高清': 'hd',
        '全高清': 'fullhd',
        '超高清': '4k',
    };
    const normalizedPreset = chineseMap[preset.toLowerCase()] || preset.toLowerCase();
    return presets[normalizedPreset] || presets['fullhd'];
}
/**
 * 验证组合规格
 *
 * @param spec - 组合规格对象
 * @returns 验证结果
 */
export function validateCompositionSpec(spec) {
    const errors = [];
    if (!spec.width || spec.width <= 0) {
        errors.push('宽度无效');
    }
    if (!spec.height || spec.height <= 0) {
        errors.push('高度无效');
    }
    if (!spec.fps || spec.fps <= 0) {
        errors.push('帧率无效');
    }
    if (!spec.durationInFrames || spec.durationInFrames <= 0) {
        errors.push('时长无效');
    }
    if (!Array.isArray(spec.layers)) {
        errors.push('图层必须是数组');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
