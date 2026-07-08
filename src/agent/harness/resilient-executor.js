/**
 * Harness 2.0 - Phase 3: 容错与迭代增强
 *
 * 实现从任意步骤重入和错误恢复能力
 */
import { createTracer } from '../tracing.js';
import { Harness2Executor } from './executor.js';
import { ArtifactsManager } from './artifacts/manager.js';
const tracer = createTracer('Harness2.Recovery');
/**
 * 容错增强的执行器
 */
export class ResilientHarness2Executor extends Harness2Executor {
    constructor() {
        super(...arguments);
        this.maxRetries = 3;
        this.retryStrategies = [
            'micro_adjust', // 微调参数
            'downgrade', // 降级方案
            'minimal' // 最简方案
        ];
    }
    /**
     * 带重试的执行
     */
    async executeWithRetry(intent, assets) {
        let lastError = null;
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            const strategy = this.retryStrategies[attempt];
            tracer.log('info', `🔄 尝试 ${attempt + 1}/${this.maxRetries}`, { strategy });
            try {
                // 根据策略调整参数
                const adjustedIntent = this.applyStrategy(intent, strategy, attempt);
                // 执行
                const result = await this.execute(adjustedIntent, assets);
                tracer.log('info', `✅ 第 ${attempt + 1} 次尝试成功`);
                return result;
            }
            catch (error) {
                lastError = error;
                tracer.log('warn', `❌ 第 ${attempt + 1} 次尝试失败`, {
                    error: lastError.message,
                    strategy
                });
                if (attempt < this.maxRetries - 1) {
                    // 等待后重试
                    await this.delay(1000 * (attempt + 1));
                }
            }
        }
        // 所有重试都失败
        throw new Error(`所有 ${this.maxRetries} 次尝试都失败: ${lastError?.message}`);
    }
    /**
     * 从指定步骤重建（实现）
     */
    async rebuild(options) {
        const trace = tracer.startTrace('harness2_rebuild', { from: options.from });
        try {
            tracer.log('info', '🔄 从步骤重建', { from: options.from });
            // 1. 加载现有制品
            const artifactsManager = new ArtifactsManager(process.cwd());
            const artifacts = await artifactsManager.loadMetadata();
            if (!artifacts) {
                throw new Error('找不到项目元数据，无法重建');
            }
            // 2. 根据 from 选项决定从哪一步开始
            switch (options.from) {
                case 'build':
                    return await this.rebuildFromBuild(artifacts, options);
                case 'validate':
                    return await this.rebuildFromValidate(artifacts, options);
                case 'storyboard':
                    return await this.rebuildFromStoryboard(artifacts, options);
                default:
                    throw new Error(`不支持从 ${options.from} 重建`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            tracer.log('error', '❌ 重建失败', { error: errorMessage });
            trace.end({ error: errorMessage });
            throw error;
        }
    }
    /**
     * 从 Build 步骤重建
     */
    async rebuildFromBuild(artifacts, options) {
        tracer.log('info', '从 Build 步骤重建');
        if (!artifacts.storyboard || !artifacts.design || !artifacts.timeline) {
            throw new Error('缺少必要的制品（storyboard/design/timeline）');
        }
        // 重新执行 Build
        const buildStep = this.getSteps().build;
        const buildArtifact = await buildStep.execute(artifacts.storyboard, artifacts.design, artifacts.timeline, artifacts.projectPath);
        artifacts.build = buildArtifact;
        // 继续执行 Validate
        const validateStep = this.getSteps().validate;
        const validationArtifact = await validateStep.execute(buildArtifact, `${artifacts.projectPath}/artifacts`);
        artifacts.validation = validationArtifact;
        return {
            success: true,
            projectPath: artifacts.projectPath,
            artifacts,
            validationPassed: validationArtifact.status === 'passed',
            message: '✅ 从 Build 步骤重建成功'
        };
    }
    /**
     * 从 Validate 步骤重建
     */
    async rebuildFromValidate(artifacts, options) {
        tracer.log('info', '从 Validate 步骤重建');
        if (!artifacts.build) {
            throw new Error('缺少 Build 制品');
        }
        // 重新执行 Validate
        const validateStep = this.getSteps().validate;
        const validationArtifact = await validateStep.execute(artifacts.build, `${artifacts.projectPath}/artifacts`);
        artifacts.validation = validationArtifact;
        return {
            success: true,
            projectPath: artifacts.projectPath,
            artifacts,
            validationPassed: validationArtifact.status === 'passed',
            message: '✅ 从 Validate 步骤重建成功'
        };
    }
    /**
     * 从 Storyboard 步骤重建
     */
    async rebuildFromStoryboard(artifacts, options) {
        tracer.log('info', '从 Storyboard 步骤重建');
        if (!artifacts.strategy || !artifacts.capture) {
            throw new Error('缺少必要的制品（strategy/capture）');
        }
        // 重新执行 Storyboard → Timeline → Build → Validate
        // TODO: 实现完整流程
        throw new Error('从 Storyboard 重建待实现');
    }
    /**
     * 应用重试策略
     */
    applyStrategy(intent, strategy, attempt) {
        const adjusted = { ...intent };
        switch (strategy) {
            case 'micro_adjust':
                // 微调：降低时长
                if (adjusted.entities?.duration) {
                    adjusted.entities.duration = Math.max(5, adjusted.entities.duration - 2);
                }
                tracer.log('info', '应用微调策略', { duration: adjusted.entities?.duration });
                break;
            case 'downgrade':
                // 降级：简化需求
                adjusted.description = '创建简单视频';
                tracer.log('info', '应用降级策略');
                break;
            case 'minimal':
                // 最简：最基础方案
                adjusted.entities = { duration: 5 };
                tracer.log('info', '应用最简策略');
                break;
        }
        return adjusted;
    }
    /**
     * 获取步骤访问器
     */
    getSteps() {
        return this.steps;
    }
    /**
     * 延迟
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
