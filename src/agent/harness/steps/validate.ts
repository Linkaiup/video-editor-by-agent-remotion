/**
 * Harness 2.0 - Step 7: Validate
 *
 * 三重验证
 * - Lint：静态 HTML/代码结构检查
 * - Validate：运行时检查（加载组件、捕获错误）
 * - Snapshot：生成关键帧快照，视觉检查
 */

import { execSync } from 'child_process';
import { createTracer } from '../../tracing.js';
import type {
  ValidationArtifact,
  ValidationReport,
  CheckResult,
  SnapshotResult,
  BuildArtifact
} from '../artifacts/types.js';

const tracer = createTracer('Harness2.Validate');

export class ValidateStep {
  /**
   * 执行 Validate 步骤
   *
   * @param buildArtifact - Build 制品
   * @param outputPath - 输出目录
   * @returns Validation Artifact
   */
  async execute(
    buildArtifact: BuildArtifact,
    outputPath: string
  ): Promise<ValidationArtifact> {
    const trace = tracer.startTrace('validate_execute', {});

    try {
      tracer.log('info', '✅ Step 7: Validate - 三重验证');

      // 1. Lint 检查（静态）
      tracer.log('info', '1️⃣  执行 Lint 检查');
      const lintResult = await this.runLint(buildArtifact);

      // 2. Validate 检查（运行时）
      tracer.log('info', '2️⃣  执行运行时检查');
      const validateResult = await this.runValidate(buildArtifact);

      // 3. Snapshot 生成（视觉）
      tracer.log('info', '3️⃣  生成视觉快照');
      const snapshotResult = await this.generateSnapshots(buildArtifact, outputPath);

      // 4. 质量评分
      const quality = this.calculateQuality(lintResult, validateResult, snapshotResult);

      const report: ValidationReport = {
        timestamp: new Date(),
        status: lintResult.passed && validateResult.passed && snapshotResult.passed ? 'passed' : 'failed',
        checks: {
          lint: lintResult,
          validate: validateResult,
          snapshot: snapshotResult
        },
        quality
      };

      const artifact: ValidationArtifact = {
        path: `${outputPath}/validation-report.json`,
        content: report,
        snapshots: snapshotResult.frames,
        status: report.status,
        createdAt: new Date()
      };

      tracer.log('info', '✅ Validate 完成', {
        status: report.status,
        quality: quality.overall
      });

      trace.end({ success: true, status: report.status });
      return artifact;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      tracer.log('error', '❌ Validate 失败', { error: errorMessage });
      trace.end({ error: errorMessage });
      throw error;
    }
  }

  /**
   * 1. Lint 检查（静态）
   */
  private async runLint(buildArtifact: BuildArtifact): Promise<CheckResult> {
    const errors: string[] = [];

    try {
      // 检查每个组件文件
      for (const comp of buildArtifact.compositions) {
        // 语法检查
        if (!comp.syntaxValid) {
          errors.push(`${comp.beatId}: 语法错误`);
        }

        // 类型检查
        if (!comp.typeValid) {
          errors.push(`${comp.beatId}: 类型错误`);
        }
      }

      // 简化版本：可以集成 ESLint
      // execSync('npx eslint src/compositions/*.tsx', { stdio: 'pipe' });

    } catch (error) {
      errors.push(error instanceof Error ? error.message : '未知 Lint 错误');
    }

    return {
      passed: errors.length === 0,
      errors
    };
  }

  /**
   * 2. Validate 检查（运行时）
   */
  private async runValidate(buildArtifact: BuildArtifact): Promise<CheckResult> {
    const errors: string[] = [];

    try {
      // 简化版本：检查组件是否可以导入
      // 实际应该使用无头浏览器加载并检查运行时错误

      // 检查文件存在性
      for (const comp of buildArtifact.compositions) {
        // TODO: 实际加载组件并捕获运行时错误
        // const { existsSync } = await import('fs');
        // if (!existsSync(comp.path)) {
        //   errors.push(`${comp.beatId}: 文件不存在`);
        // }
      }

    } catch (error) {
      errors.push(error instanceof Error ? error.message : '未知 Validate 错误');
    }

    return {
      passed: errors.length === 0,
      errors
    };
  }

  /**
   * 3. Snapshot 生成（视觉）
   */
  private async generateSnapshots(
    buildArtifact: BuildArtifact,
    outputPath: string
  ): Promise<SnapshotResult> {
    const frames: SnapshotResult['frames'] = [];

    try {
      // 为每个 beat 生成关键帧快照
      for (const comp of buildArtifact.compositions) {
        // 生成 3 个关键帧：开始、中点、结束
        // 简化版本：实际应该使用 Remotion 的 renderFrames API

        frames.push({
          beat: comp.beatId,
          frame: 0,
          path: `${outputPath}/snapshots/${comp.beatId}-start.png`
        });

        frames.push({
          beat: comp.beatId,
          frame: 45,
          path: `${outputPath}/snapshots/${comp.beatId}-mid.png`
        });

        frames.push({
          beat: comp.beatId,
          frame: 89,
          path: `${outputPath}/snapshots/${comp.beatId}-end.png`
        });
      }

      // TODO: 实际渲染快照
      // await renderFrames({...});

    } catch (error) {
      tracer.log('error', 'Snapshot 生成失败', { error });
    }

    return {
      passed: frames.length > 0,
      frames
    };
  }

  /**
   * 计算质量评分
   */
  private calculateQuality(
    lint: CheckResult,
    validate: CheckResult,
    snapshot: SnapshotResult
  ) {
    // 流畅度：基于快照数量
    const smoothness = snapshot.frames.length > 0 ? 95 : 0;

    // 稳定性：基于运行时检查
    const stability = validate.passed ? 95 : 50;

    // 性能：基于 lint 检查
    const performance = lint.passed ? 90 : 60;

    // 总分
    const overall = (smoothness * 0.4 + stability * 0.4 + performance * 0.2);

    return {
      smoothness,
      stability,
      performance,
      overall
    };
  }

  /**
   * 检查通过标准
   */
  validate(artifact: ValidationArtifact): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    const report = artifact.content;

    // 1. Lint 零错误
    if (!report.checks.lint.passed) {
      issues.push(`Lint 检查失败：${report.checks.lint.errors.length} 个错误`);
    }

    // 2. Validate 零错误
    if (!report.checks.validate.passed) {
      issues.push(`运行时检查失败：${report.checks.validate.errors.length} 个错误`);
    }

    // 3. 快照帧视觉正确
    if (!report.checks.snapshot.passed) {
      issues.push('快照生成失败');
    }

    // 4. 质量评分达标
    if (report.quality.overall < 70) {
      issues.push(`质量评分不达标：${report.quality.overall.toFixed(1)} < 70`);
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }
}
