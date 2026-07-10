/**
 * Harness 2.0 - Step 5: Timeline
 *
 * 生成精确的时间轴
 * - 将 beats 转换为精确的帧级时间轴
 * - 生成配音时间戳（如有）
 * - 确保时间边界无重叠
 */

import { createTracer } from '../../tracing.js';
import type {
  TimelineArtifact,
  Timeline,
  BeatTiming,
  StoryboardArtifact,
  StrategyArtifact
} from '../artifacts/types.js';

const tracer = createTracer('Harness2.Timeline');

export class TimelineStep {
  /**
   * 执行 Timeline 步骤
   *
   * @param storyboardArtifact - Storyboard 制品
   * @param strategyArtifact - Strategy 制品
   * @param outputPath - 输出目录
   * @returns Timeline Artifact
   */
  async execute(
    storyboardArtifact: StoryboardArtifact,
    strategyArtifact: StrategyArtifact,
    outputPath?: string
  ): Promise<TimelineArtifact> {
    const trace = tracer.startTrace('timeline_execute', {});

    try {
      tracer.log('info', '⏱️  Step 5: Timeline - 生成精确时间轴');

      const storyboard = storyboardArtifact.content;
      const fps = strategyArtifact.content.format.fps;

      // 1. 将每个 beat 转换为精确的帧级时间轴
      const beatTimings: BeatTiming[] = storyboard.beats.map(beat => {
        const startFrame = Math.floor(beat.startTime * fps);
        const endFrame = Math.floor(beat.endTime * fps);

        const timing: BeatTiming = {
          id: beat.id,
          start: beat.startTime,
          end: beat.endTime,
          frames: [startFrame, endFrame]
        };

        // 2. 如果有配音，生成词级时间戳
        if (beat.narration) {
          timing.narration = this.generateNarrationTiming(
            beat.narration,
            beat.startTime,
            beat.endTime
          );
        }

        return timing;
      });

      const timeline: Timeline = {
        duration: storyboard.totalDuration,
        fps,
        beats: beatTimings
      };

      const artifact: TimelineArtifact = {
        path: outputPath ? `${outputPath}/timeline.json` : 'artifacts/timeline.json',
        content: timeline,
        status: 'completed',
        createdAt: new Date()
      };

      tracer.log('info', '✅ Timeline 完成', {
        beatCount: beatTimings.length,
        duration: timeline.duration,
        fps
      });

      trace.end({ success: true });
      return artifact;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '❌ Timeline 失败', { error: errorMessage });
      trace.end({ error: errorMessage });
      throw error;
    }
  }

  /**
   * 生成配音时间戳（简化版本）
   *
   * 实际应该使用 TTS + 转录工具
   */
  private generateNarrationTiming(text: string, startTime: number, endTime: number) {
    // 🔧 防御性检查：确保 text 是字符串
    if (typeof text !== 'string') {
      tracer.log('warn', '⚠️ narration 不是字符串类型', {
        type: typeof text,
        value: text
      });
      // 转换为字符串或使用空字符串
      text = text ? String(text) : '';
    }

    // 如果是空字符串，返回空的配音时间戳
    if (!text || text.trim().length === 0) {
      return {
        text: '',
        words: []
      };
    }

    const words = text.split(/\s+/);
    const duration = endTime - startTime;
    const wordDuration = duration / words.length;

    return {
      text,
      words: words.map((word, i) => ({
        text: word,
        start: startTime + i * wordDuration,
        end: startTime + (i + 1) * wordDuration
      }))
    };
  }

  /**
   * 检查通过标准
   */
  validate(artifact: TimelineArtifact): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    const content = artifact.content;

    // 1. 时间轴精确到帧
    for (const beat of content.beats) {
      if (!Number.isInteger(beat.frames[0]) || !Number.isInteger(beat.frames[1])) {
        issues.push(`Beat ${beat.id} 帧数不是整数`);
      }
    }

    // 2. Beats 时间边界无重叠
    for (let i = 0; i < content.beats.length - 1; i++) {
      if (content.beats[i].end > content.beats[i + 1].start) {
        issues.push(`Beat ${content.beats[i].id} 与 ${content.beats[i + 1].id} 时间重叠`);
      }
    }

    // 3. 配音时间戳完整（如有）
    // 🔧 只在有实际文本内容时检查词级时间戳
    for (const beat of content.beats) {
      if (beat.narration && beat.narration.text && beat.narration.text.trim().length > 0) {
        if (beat.narration.words.length === 0) {
          issues.push(`Beat ${beat.id} 配音没有词级时间戳`);
        }
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}
