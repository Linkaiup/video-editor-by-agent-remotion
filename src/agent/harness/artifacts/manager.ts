/**
 * Harness 2.0 - Artifacts Manager
 *
 * 管理所有项目制品（Named Artifacts）的读写、版本控制
 * 实现从任意步骤重入的能力
 */

import { mkdir, writeFile, readFile, access } from 'fs/promises';
import { join } from 'path';
import type {
  ProjectArtifacts,
  CaptureArtifact,
  DesignArtifact,
  StrategyArtifact,
  StoryboardArtifact,
  TimelineArtifact,
  BuildArtifact,
  ValidationArtifact,
  ArtifactResult
} from './types.js';

export class ArtifactsManager {
  private projectPath: string;
  private artifactsPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.artifactsPath = join(projectPath, 'artifacts');
  }

  /**
   * 初始化项目结构
   */
  async initialize(projectId: string): Promise<ProjectArtifacts> {
    // 创建标准目录结构
    await mkdir(this.artifactsPath, { recursive: true });
    await mkdir(join(this.artifactsPath, 'capture', 'assets'), { recursive: true });
    await mkdir(join(this.artifactsPath, 'snapshots'), { recursive: true });
    await mkdir(join(this.projectPath, 'src', 'compositions'), { recursive: true });
    await mkdir(join(this.projectPath, 'output'), { recursive: true });

    const artifacts: ProjectArtifacts = {
      projectId,
      projectPath: this.projectPath,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveMetadata(artifacts);
    return artifacts;
  }

  /**
   * 保存项目元数据
   */
  private async saveMetadata(artifacts: ProjectArtifacts): Promise<void> {
    const metadataPath = join(this.artifactsPath, 'project.json');
    await writeFile(metadataPath, JSON.stringify(artifacts, null, 2), 'utf-8');
  }

  /**
   * 加载项目元数据
   */
  async loadMetadata(): Promise<ProjectArtifacts | null> {
    try {
      const metadataPath = join(this.artifactsPath, 'project.json');
      const content = await readFile(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * 检查制品是否存在
   */
  async exists(artifactType: keyof ProjectArtifacts): Promise<boolean> {
    const paths: Record<string, string> = {
      capture: join(this.artifactsPath, 'capture', 'metadata.json'),
      design: join(this.artifactsPath, 'DESIGN.md'),
      strategy: join(this.artifactsPath, 'STRATEGY.md'),
      storyboard: join(this.artifactsPath, 'STORYBOARD.md'),
      timeline: join(this.artifactsPath, 'timeline.json'),
      build: join(this.projectPath, 'src', 'compositions', 'index.ts'),
      validation: join(this.artifactsPath, 'validation-report.json')
    };

    const path = paths[artifactType];
    if (!path) return false;

    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  // ============= Capture Artifact =============

  async saveCapture(artifact: CaptureArtifact): Promise<ArtifactResult<CaptureArtifact>> {
    try {
      const capturePath = join(this.artifactsPath, 'capture');

      // 保存 metadata.json
      await writeFile(
        join(capturePath, 'metadata.json'),
        JSON.stringify(artifact.metadata, null, 2),
        'utf-8'
      );

      // 保存 tokens.json
      await writeFile(
        join(capturePath, 'tokens.json'),
        JSON.stringify(artifact.tokens, null, 2),
        'utf-8'
      );

      // 更新项目元数据
      const metadata = await this.loadMetadata();
      if (metadata) {
        metadata.capture = artifact;
        metadata.updatedAt = new Date();
        await this.saveMetadata(metadata);
      }

      return { success: true, artifact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存 Capture 失败'
      };
    }
  }

  async loadCapture(): Promise<ArtifactResult<CaptureArtifact>> {
    try {
      const capturePath = join(this.artifactsPath, 'capture');

      const metadata = JSON.parse(
        await readFile(join(capturePath, 'metadata.json'), 'utf-8')
      );

      const tokens = JSON.parse(
        await readFile(join(capturePath, 'tokens.json'), 'utf-8')
      );

      const artifact: CaptureArtifact = {
        path: capturePath,
        metadata,
        tokens,
        thumbnails: {},
        status: 'completed',
        createdAt: new Date()
      };

      return { success: true, artifact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '加载 Capture 失败'
      };
    }
  }

  // ============= Design Artifact =============

  async saveDesign(artifact: DesignArtifact): Promise<ArtifactResult<DesignArtifact>> {
    try {
      const designPath = join(this.artifactsPath, 'DESIGN.md');
      const content = this.serializeDesign(artifact.content);

      await writeFile(designPath, content, 'utf-8');

      // 更新项目元数据
      const metadata = await this.loadMetadata();
      if (metadata) {
        metadata.design = artifact;
        metadata.updatedAt = new Date();
        await this.saveMetadata(metadata);
      }

      return { success: true, artifact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存 Design 失败'
      };
    }
  }

  async loadDesign(): Promise<ArtifactResult<DesignArtifact>> {
    try {
      const designPath = join(this.artifactsPath, 'DESIGN.md');
      const content = await readFile(designPath, 'utf-8');

      // 简化版本：直接返回原始内容
      // 实际应该解析 Markdown 为结构化数据
      const artifact: DesignArtifact = {
        path: designPath,
        content: this.parseDesign(content),
        status: 'completed',
        createdAt: new Date()
      };

      return { success: true, artifact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '加载 Design 失败'
      };
    }
  }

  // ============= Strategy Artifact =============

  async saveStrategy(artifact: StrategyArtifact): Promise<ArtifactResult<StrategyArtifact>> {
    try {
      const strategyPath = join(this.artifactsPath, 'STRATEGY.md');
      const content = this.serializeStrategy(artifact.content);

      await writeFile(strategyPath, content, 'utf-8');

      // 更新项目元数据
      const metadata = await this.loadMetadata();
      if (metadata) {
        metadata.strategy = artifact;
        metadata.updatedAt = new Date();
        await this.saveMetadata(metadata);
      }

      return { success: true, artifact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存 Strategy 失败'
      };
    }
  }

  // ============= Storyboard Artifact =============

  async saveStoryboard(artifact: StoryboardArtifact): Promise<ArtifactResult<StoryboardArtifact>> {
    try {
      const storyboardPath = join(this.artifactsPath, 'STORYBOARD.md');
      const content = this.serializeStoryboard(artifact.content);

      await writeFile(storyboardPath, content, 'utf-8');

      // 更新项目元数据
      const metadata = await this.loadMetadata();
      if (metadata) {
        metadata.storyboard = artifact;
        metadata.updatedAt = new Date();
        await this.saveMetadata(metadata);
      }

      return { success: true, artifact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存 Storyboard 失败'
      };
    }
  }

  // ============= Timeline Artifact =============

  async saveTimeline(artifact: TimelineArtifact): Promise<ArtifactResult<TimelineArtifact>> {
    try {
      const timelinePath = join(this.artifactsPath, 'timeline.json');

      await writeFile(
        timelinePath,
        JSON.stringify(artifact.content, null, 2),
        'utf-8'
      );

      // 更新项目元数据
      const metadata = await this.loadMetadata();
      if (metadata) {
        metadata.timeline = artifact;
        metadata.updatedAt = new Date();
        await this.saveMetadata(metadata);
      }

      return { success: true, artifact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存 Timeline 失败'
      };
    }
  }

  async loadTimeline(): Promise<ArtifactResult<TimelineArtifact>> {
    try {
      const timelinePath = join(this.artifactsPath, 'timeline.json');
      const content = JSON.parse(await readFile(timelinePath, 'utf-8'));

      const artifact: TimelineArtifact = {
        path: timelinePath,
        content,
        status: 'completed',
        createdAt: new Date()
      };

      return { success: true, artifact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '加载 Timeline 失败'
      };
    }
  }

  // ============= Validation Artifact =============

  async saveValidation(artifact: ValidationArtifact): Promise<ArtifactResult<ValidationArtifact>> {
    try {
      const validationPath = join(this.artifactsPath, 'validation-report.json');

      await writeFile(
        validationPath,
        JSON.stringify(artifact.content, null, 2),
        'utf-8'
      );

      // 更新项目元数据
      const metadata = await this.loadMetadata();
      if (metadata) {
        metadata.validation = artifact;
        metadata.updatedAt = new Date();
        await this.saveMetadata(metadata);
      }

      return { success: true, artifact };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存 Validation 失败'
      };
    }
  }

  // ============= Helper Methods =============

  private serializeDesign(content: any): string {
    return `# Design Reference

## 1. Visual Theme
- Style: ${content.visualTheme?.style || 'modern'}
- Mood: ${content.visualTheme?.mood || 'professional'}

## 2. Color Palette
${content.colorPalette?.map((c: any) =>
  `- ${c.name}: ${c.hex} (${c.usage})`
).join('\n') || '- Primary: #000000'}

## 3. Typography
- Heading: ${content.typography?.heading?.family || 'Sans-serif'}
- Body: ${content.typography?.body?.family || 'Sans-serif'}

## 4. Layout & Spacing
- Margins: ${content.layout?.margins || '20px'}
- Padding: ${content.layout?.padding || '10px'}

## 5. Component Styles
${content.components?.map((c: any) =>
  `### ${c.name}\n${c.cssSpecs}`
).join('\n\n') || 'TBD'}
`;
  }

  private parseDesign(content: string): any {
    // 简化版本：返回默认结构
    return {
      visualTheme: { style: 'modern', mood: 'professional' },
      colorPalette: [],
      typography: { heading: {}, body: {} },
      layout: {},
      components: []
    };
  }

  private serializeStrategy(content: any): string {
    return `# Video Strategy

## Video Type
${content.videoType}

## Format
- Duration: ${content.format.duration}s
- Aspect Ratio: ${content.format.aspectRatio}
- FPS: ${content.format.fps}

## Core Message
${content.coreMessage}

## Narrative Arc
- Opening: ${content.narrativeArc.opening}
- Middle: ${content.narrativeArc.middle}
- Closing: ${content.narrativeArc.closing}
`;
  }

  private serializeStoryboard(content: any): string {
    return `# Storyboard

${content.beats?.map((beat: any) => `
## Beat ${beat.id}: ${beat.name} (${beat.startTime}s - ${beat.endTime}s)

**Mood**: ${beat.mood}
**Camera**: ${beat.camera}

**Assets**:
${beat.assets.map((a: string) => `- ${a}`).join('\n')}

**Techniques**:
${beat.techniques.map((t: string) => `- ${t}`).join('\n')}

${beat.narration ? `**Narration**: "${beat.narration}"` : ''}
`).join('\n---\n') || 'No beats defined'}
`;
  }
}
