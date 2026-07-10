/**
 * LLM 调用重试工具
 *
 * 提供统一的重试逻辑，处理超时、限流等临时性错误
 */
import { createTracer } from './tracing.js';
const tracer = createTracer('LLMRetry');
/**
 * 默认重试配置
 */
const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 2000, // 2秒
    exponentialBackoff: true,
    timeout: 60000, // 60秒
};
/**
 * 判断错误是否可重试
 */
function isRetryableError(error) {
    if (!error)
        return false;
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';
    // 可重试的错误类型
    const retryablePatterns = [
        'timeout',
        'timed out',
        'request timed out',
        'econnreset',
        'enotfound',
        'econnrefused',
        'etimedout',
        'rate limit',
        'rate_limit',
        'too many requests',
        '429',
        'service unavailable',
        '503',
        'bad gateway',
        '502',
        'gateway timeout',
        '504',
    ];
    return retryablePatterns.some(pattern => errorMessage.includes(pattern) || errorCode.includes(pattern));
}
/**
 * 延迟函数
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * 带重试的 LLM 调用包装器
 *
 * @param fn - 要执行的异步函数
 * @param operationName - 操作名称（用于日志）
 * @param config - 重试配置
 * @returns 函数执行结果
 *
 * @example
 * const result = await withRetry(
 *   () => openai.chat.completions.create({ ... }),
 *   'intent_recognition',
 *   { maxRetries: 3 }
 * );
 */
export async function withRetry(fn, operationName, config = {}) {
    const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    const { maxRetries, retryDelay, exponentialBackoff } = finalConfig;
    let lastError;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            tracer.log('info', `🔄 执行 ${operationName}`, {
                attempt,
                maxRetries: maxRetries + 1,
            });
            const result = await fn();
            if (attempt > 1) {
                tracer.log('info', `✅ ${operationName} 重试成功`, {
                    attempt,
                    totalAttempts: attempt,
                });
            }
            return result;
        }
        catch (error) {
            lastError = error;
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            // 如果是最后一次尝试，直接抛出错误
            if (attempt > maxRetries) {
                tracer.log('error', `❌ ${operationName} 失败，已达最大重试次数`, {
                    attempt,
                    maxRetries,
                    error: errorMessage,
                });
                throw error;
            }
            // 判断是否可重试
            const canRetry = isRetryableError(error);
            if (!canRetry) {
                tracer.log('error', `❌ ${operationName} 失败，错误不可重试`, {
                    attempt,
                    error: errorMessage,
                });
                throw error;
            }
            // 计算延迟时间
            const currentDelay = exponentialBackoff
                ? retryDelay * Math.pow(2, attempt - 1)
                : retryDelay;
            tracer.log('warn', `⚠️  ${operationName} 失败，${currentDelay}ms 后重试`, {
                attempt,
                nextAttempt: attempt + 1,
                maxRetries: maxRetries + 1,
                error: errorMessage,
                retryDelay: currentDelay,
            });
            await delay(currentDelay);
        }
    }
    // 理论上不会到这里，但为了类型安全
    throw lastError;
}
/**
 * 创建带重试的 OpenAI 客户端包装器
 */
export class RetryableOpenAI {
    /**
     * 带重试的 chat.completions.create
     */
    static async chatCompletions(openai, params, operationName, retryConfig) {
        return withRetry(() => openai.chat.completions.create(params), operationName, retryConfig);
    }
}
