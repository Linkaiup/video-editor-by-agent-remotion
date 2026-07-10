/**
 * Harness 2.0 - 主执行器
 *
 * 协调 7 步流程，实现完整的视频生成工作流
 * 参考 HyperFrames pipeline 设计
 */

import { join } from 'path';
import { createTracer } from '../tracing.js';
import { ArtifactsManager } from './artifacts/manager.js';
import { CaptureStep } from './steps/capture.js';
import { DesignStep } from './steps/design.js';
import { StrategyStep } from './steps/strategy.js';
import { StoryboardStep } from './steps/storyboard.js';
import { TimelineStep } from './steps/timeline.js';
import { BuildStep } from './steps/build.js';
import { ValidateStep } from './steps/validate.js';
import { RenderStep } from './steps/render.js';
import type { UserIntent } from '../types.js';
import type { RebuildOptions, ProjectArtifacts, RenderArtifact } from './artifacts/types.js';

const tracer = createTracer('Harness2.Executor');

export interface Harness2Result {
  success: boolean;
  projectPath: string;
  artifacts: ProjectArtifacts;
  validationPassed: boolean;
  renderArtifact?: RenderArtifact;
  videoPath?: string;
  message: string;
}

export class Harness2Executor {
  private artifactsManager: ArtifactsManager;
  private steps: {
    capture: CaptureStep;
    design: DesignStep;
    strategy: StrategyStep;
    storyboard: StoryboardStep;
    timeline: TimelineStep;
    build: BuildStep;
    validate: ValidateStep;
    render: RenderStep;
  };

  constructor(projectPath: string) {
    this.artifactsManager = new ArtifactsManager(projectPath);
    this.steps = {
      capture: new CaptureStep(),
      design: new DesignStep(),
      strategy: new StrategyStep(),
      storyboard: new StoryboardStep(),
      timeline: new TimelineStep(),
      build: new BuildStep(),
      validate: new ValidateStep(),
      render: new RenderStep()
    };
  }

  /**
   * 执行完整的 8 步流程
   *
   * @param intent - 用户意图
   * @param assets - 素材路径列表
   * @returns 执行结果
   */
  async execute(intent: UserIntent, assets: string[]): Promise<Harness2Result> {
    const trace = tracer.startTrace('harness2_execute', { intent, assetCount: assets.length });

    try {
      tracer.log('info', '🚀 Harness 2.0 - 开始执行');

      // 初始化项目
      const projectId = `project-${Date.now()}`;
      let artifacts = await this.artifactsManager.initialize(projectId);

      // Step 1: Capture
      tracer.log('info', '📦 Step 1/8: Capture');
      const captureArtifact = await this.steps.capture.execute(
        assets,
        artifacts.projectPath
      );
      const captureValidation = this.steps.capture.validate(captureArtifact);
      if (!captureValidation.passed) {
        throw new Error(`Capture 未通过: ${captureValidation.issues.join(', ')}`);
      }
      await this.artifactsManager.saveCapture(captureArtifact);
      artifacts.capture = captureArtifact;

      // Step 2: Design
      tracer.log('info', '🎨 Step 2/8: Design');
      const designArtifact = await this.steps.design.execute(
        captureArtifact,
        undefined,
        artifacts.projectPath
      );
      const designValidation = this.steps.design.validate(designArtifact);
      if (!designValidation.passed) {
        throw new Error(`Design 未通过: ${designValidation.issues.join(', ')}`);
      }
      await this.artifactsManager.saveDesign(designArtifact);
      artifacts.design = designArtifact;

      // Step 3: Strategy
      tracer.log('info', '📋 Step 3/8: Strategy');
      const strategyArtifact = await this.steps.strategy.execute(
        intent,
        artifacts.projectPath
      );
      const strategyValidation = this.steps.strategy.validate(strategyArtifact);
      if (!strategyValidation.passed) {
        throw new Error(`Strategy 未通过: ${strategyValidation.issues.join(', ')}`);
      }
      await this.artifactsManager.saveStrategy(strategyArtifact);
      artifacts.strategy = strategyArtifact;

      // Step 4: Storyboard
      tracer.log('info', '🎬 Step 4/8: Storyboard');
      const storyboardArtifact = await this.steps.storyboard.execute(
        strategyArtifact,
        captureArtifact,
        artifacts.projectPath
      );
      const storyboardValidation = this.steps.storyboard.validate(storyboardArtifact);
      if (!storyboardValidation.passed) {
        throw new Error(`Storyboard 未通过: ${storyboardValidation.issues.join(', ')}`);
      }
      await this.artifactsManager.saveStoryboard(storyboardArtifact);
      artifacts.storyboard = storyboardArtifact;

      // Step 5: Timeline
      tracer.log('info', '⏱️  Step 5/8: Timeline');
      const timelineArtifact = await this.steps.timeline.execute(
        storyboardArtifact,
        strategyArtifact,
        artifacts.projectPath
      );
      const timelineValidation = this.steps.timeline.validate(timelineArtifact);
      if (!timelineValidation.passed) {
        throw new Error(`Timeline 未通过: ${timelineValidation.issues.join(', ')}`);
      }
      await this.artifactsManager.saveTimeline(timelineArtifact);
      artifacts.timeline = timelineArtifact;

      // Step 6: Build
      tracer.log('info', '🔨 Step 6/8: Build');
      const buildArtifact = await this.steps.build.execute(
        storyboardArtifact,
        designArtifact,
        timelineArtifact,
        artifacts.projectPath
      );
      const buildValidation = this.steps.build.validate(buildArtifact);
      if (!buildValidation.passed) {
        throw new Error(`Build 未通过: ${buildValidation.issues.join(', ')}`);
      }
      artifacts.build = buildArtifact;

      // Step 7: Validate
      tracer.log('info', '✅ Step 7/8: Validate');
      const validationArtifact = await this.steps.validate.execute(
        buildArtifact,
        join(artifacts.projectPath, 'artifacts')
      );
      const validateValidation = this.steps.validate.validate(validationArtifact);
      if (!validateValidation.passed) {
        tracer.log('error', 'Validate 未通过，质量不达标', { issues: validateValidation.issues });
        throw new Error(`Validate 未通过: ${validateValidation.issues.join(', ')}`);
      }
      await this.artifactsManager.saveValidation(validationArtifact);
      artifacts.validation = validationArtifact;

      // Step 8: Render
      tracer.log('info', '🎬 Step 8/8: Render');
      const renderArtifact = await this.steps.render.execute(
        buildArtifact,
        timelineArtifact,
        artifacts.projectPath
      );
      tracer.log('info', '✅ 视频渲染完成', { videoPath: renderArtifact.videoPath });

      // 更新项目元数据
      artifacts.updatedAt = new Date();

      const result: Harness2Result = {
        success: true,
        projectPath: artifacts.projectPath,
        artifacts,
        validationPassed: validateValidation.passed,
        renderArtifact,
        videoPath: renderArtifact.videoPath,
        message: this.buildSuccessMessage(artifacts, renderArtifact)
      };

      tracer.log('info', '🎉 Harness 2.0 执行完成');
      trace.end({ success: true });
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '❌ Harness 2.0 执行失败', { error: errorMessage });
      trace.end({ error: errorMessage });

      throw error;
    }
  }

  /**
   * 从指定步骤重建
   *
   * @param options - 重建选项
   */
  async rebuild(options: RebuildOptions): Promise<Harness2Result> {
    tracer.log('info', '🔄 从步骤重建', { from: options.from });

    // 加载现有制品
    const artifacts = await this.artifactsManager.loadMetadata();
    if (!artifacts) {
      throw new Error('找不到项目元数据，无法重建');
    }

    // 根据 from 选项决定从哪一步开始
    // TODO: 实现分层迭代逻辑

    throw new Error('Rebuild 功能待实现');
  }

  /**
   * 构建成功消息
   */
  private buildSuccessMessage(artifacts: ProjectArtifacts, renderArtifact?: RenderArtifact): string {
    let message = '✅ 视频生成成功！\n\n';

    message += `📁 项目路径：${artifacts.projectPath}\n`;
    message += `📦 组件数量：${artifacts.build?.compositions.length || 0}\n`;

    if (artifacts.validation) {
      const quality = artifacts.validation.content.quality;
      message += `\n📊 质量报告：\n`;
      message += `   - 总分：${quality.overall.toFixed(1)}/100\n`;
      message += `   - 流畅度：${quality.smoothness.toFixed(1)}\n`;
      message += `   - 稳定性：${quality.stability.toFixed(1)}\n`;
      message += `   - 性能：${quality.performance.toFixed(1)}\n`;
    }

    message += `\n🎬 制品已保存到 artifacts/ 目录`;

    return message;
  }
}
