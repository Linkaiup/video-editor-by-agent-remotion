/**
 * Harness 2.0 - Step 4: Storyboard
 *
 * 创意决策，定义每个 beat
 * - 分解为多个 beats
 * - 定义每个 beat 的视觉、音效、资产
 * - 资产审计
 */
import { createTracer } from '../../tracing.js';
const tracer = createTracer('Harness2.Storyboard');
export class StoryboardStep {
    /**
     * 执行 Storyboard 步骤
     *
     * @param strategyArtifact - Strategy 制品
     * @param captureArtifact - Capture 制品
     * @param outputPath - 输出目录
     * @returns Storyboard Artifact
     */
    async execute(strategyArtifact, captureArtifact, outputPath) {
        const trace = tracer.startTrace('storyboard_execute', {});
        try {
            tracer.log('info', '🎬 Step 4: Storyboard - 创建分镜脚本');
            const strategy = strategyArtifact.content;
            const assets = captureArtifact.metadata;
            // 1. 根据时长和叙事弧线分解为 beats
            const beats = this.generateBeats(strategy, assets);
            // 2. 资产审计
            const assetAudit = this.auditAssets(beats, assets);
            if (!assetAudit.passed) {
                tracer.log('warn', '资产审计发现问题', { issues: assetAudit.issues });
            }
            const storyboard = {
                beats,
                totalDuration: strategy.format.duration
            };
            const artifact = {
                path: outputPath ? `${outputPath}/STORYBOARD.md` : 'artifacts/STORYBOARD.md',
                content: storyboard,
                status: 'completed',
                createdAt: new Date()
            };
            tracer.log('info', '✅ Storyboard 完成', {
                beatCount: beats.length,
                totalDuration: storyboard.totalDuration
            });
            trace.end({ success: true, beatCount: beats.length });
            return artifact;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            tracer.log('error', '❌ Storyboard 失败', { error: errorMessage });
            trace.end({ error: errorMessage });
            throw error;
        }
    }
    /**
     * 生成 beats
     */
    generateBeats(strategy, assets) {
        const duration = strategy.format.duration;
        const beatCount = Math.min(Math.ceil(duration / 3), 5); // 每 beat 约 3 秒，最多 5 个
        const beatDuration = duration / beatCount;
        const beats = [];
        // 如果素材数量少于 beat 数量，重复使用素材
        const assetCount = assets.length || 1;
        // 从 strategy 提取用户期望的特效
        const userEffects = strategy.effects || [];
        const userTransitions = strategy.transitions || [];
        // 🆕 如果用户指定了特效序列，将其按顺序分配给 beats（每个 beat 一个动画）
        // 否则所有 beat 使用默认动画
        const hasUserEffects = userEffects.length > 0;
        const defaultTechniques = ['fade_in', 'scale'];
        const defaultTransitions = userTransitions.length > 0 ? userTransitions : ['crossfade'];
        for (let i = 0; i < beatCount; i++) {
            const startTime = i * beatDuration;
            const endTime = (i + 1) * beatDuration;
            let name;
            let mood;
            let narration;
            if (i === 0) {
                // 开场
                name = 'Opening';
                mood = 'Energetic';
                narration = strategy.narrativeArc.opening;
            }
            else if (i === beatCount - 1) {
                // 结尾
                name = 'Closing';
                mood = 'Inspiring';
                narration = strategy.narrativeArc.closing;
            }
            else {
                // 中间部分
                name = `Content ${i}`;
                mood = 'Professional';
                narration = strategy.narrativeArc.middle;
            }
            // 循环使用可用素材，确保每个 beat 都有素材
            const assetIndex = i % assetCount;
            const beatAssets = assets.length > 0 ? [assets[assetIndex].path] : [];
            // 🎯 智能分配动画：
            // 如果用户指定了动画序列（如 ['rotate_cw', 'fade_in', 'fade_out', 'fade_in', 'slide_right']）
            // 则按顺序分配给每个 beat（每个 beat 一个动画）
            let beatTechniques;
            if (hasUserEffects) {
                // 循环使用用户指定的动画序列
                const effectIndex = i % userEffects.length;
                beatTechniques = [userEffects[effectIndex]];
            }
            else {
                // 使用默认动画
                beatTechniques = defaultTechniques;
            }
            const beat = {
                id: `beat-${i + 1}`,
                name,
                startTime,
                endTime,
                mood,
                camera: 'Medium shot',
                assets: beatAssets,
                techniques: beatTechniques,
                transitions: i < beatCount - 1 ? defaultTransitions : [],
                sfx: [],
                narration
            };
            beats.push(beat);
        }
        return beats;
    }
    /**
     * 资产审计
     */
    auditAssets(beats, assets) {
        const issues = [];
        // 检查每个 beat 引用的资产是否存在
        for (const beat of beats) {
            for (const assetPath of beat.assets) {
                const found = assets.some(a => a.path === assetPath);
                if (!found) {
                    issues.push(`Beat ${beat.id} 引用的资产不存在: ${assetPath}`);
                }
            }
        }
        return {
            passed: issues.length === 0,
            issues
        };
    }
    /**
     * 检查通过标准
     */
    validate(artifact) {
        const issues = [];
        const content = artifact.content;
        // 1. 至少有 1 个 beat
        if (content.beats.length === 0) {
            issues.push('没有定义任何 beat');
        }
        // 2. 每个 beat 完整定义
        for (const beat of content.beats) {
            if (!beat.id || !beat.name) {
                issues.push(`Beat 缺少 id 或 name`);
            }
            if (beat.startTime >= beat.endTime) {
                issues.push(`Beat ${beat.id} 时间范围无效`);
            }
            // 3. 允许 beat 没有资产（无素材场景）
            // 不再要求每个 beat 必须有资产
        }
        // 4. Beat 时间无重叠
        for (let i = 0; i < content.beats.length - 1; i++) {
            if (content.beats[i].endTime > content.beats[i + 1].startTime) {
                issues.push(`Beat ${content.beats[i].id} 与 ${content.beats[i + 1].id} 时间重叠`);
            }
        }
        return {
            passed: issues.length === 0,
            issues
        };
    }
}
