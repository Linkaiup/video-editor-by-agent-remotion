/**
 * Harness 2.0 - Artifacts 类型定义
 *
 * 参考 HyperFrames 的命名制品（Named Artifacts）设计
 * 每个步骤产出明确的文件，可随时重入
 */

/**
 * 项目 Artifacts 集合
 */
export interface ProjectArtifacts {
  projectId: string;
  projectPath: string;
  createdAt: Date;
  updatedAt: Date;

  // Step 1: Capture
  capture?: CaptureArtifact;

  // Step 2: Design
  design?: DesignArtifact;

  // Step 3: Strategy
  strategy?: StrategyArtifact;

  // Step 4: Storyboard
  storyboard?: StoryboardArtifact;

  // Step 5: Timeline
  timeline?: TimelineArtifact;

  // Step 6: Build
  build?: BuildArtifact;

  // Step 7: Validate
  validation?: ValidationArtifact;
}

/**
 * Step 1: Capture Artifact
 */
export interface CaptureArtifact {
  path: string; // artifacts/capture/
  metadata: AssetMetadata[];
  tokens: DesignTokens;
  thumbnails: Record<string, string>;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface AssetMetadata {
  id: string;
  originalName: string;
  type: 'image' | 'video' | 'audio';
  path: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  format: string;
}

export interface DesignTokens {
  colors: string[];
  fonts: string[];
  spacing?: number[];
}

/**
 * Step 2: Design Artifact
 */
export interface DesignArtifact {
  path: string; // artifacts/DESIGN.md
  content: DesignReference;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface DesignReference {
  visualTheme: {
    style: string;
    mood: string;
  };
  colorPalette: ColorDefinition[];
  typography: {
    heading: FontSpec;
    body: FontSpec;
  };
  layout: {
    margins: string;
    padding: string;
    grid: string;
  };
  components: ComponentStyle[];
}

export interface ColorDefinition {
  name: string;
  hex: string;
  wcagContrast?: number;
  usage: string;
}

export interface FontSpec {
  family: string;
  size: string;
  weight: string;
}

export interface ComponentStyle {
  name: string;
  cssSpecs: string;
}

/**
 * Step 3: Strategy Artifact
 */
export interface StrategyArtifact {
  path: string; // artifacts/STRATEGY.md
  content: VideoStrategy;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface VideoStrategy {
  videoType: string;
  format: {
    duration: number;
    aspectRatio: string;
    fps: number;
  };
  coreMessage: string;
  narrativeArc: {
    opening: string;
    middle: string;
    closing: string;
  };
  targetAudience?: string;
  effects?: string[];  // 用户期望的特效列表
  transitions?: string[];  // 用户期望的转场效果
}

/**
 * Step 4: Storyboard Artifact
 */
export interface StoryboardArtifact {
  path: string; // artifacts/STORYBOARD.md
  content: Storyboard;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Storyboard {
  beats: Beat[];
  totalDuration: number;
}

export interface Beat {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  mood: string;
  camera: string;
  assets: string[];
  techniques: string[];
  transitions: string[];
  sfx?: string[];
  narration?: string;
}

/**
 * Step 5: Timeline Artifact
 */
export interface TimelineArtifact {
  path: string; // artifacts/timeline.json
  content: Timeline;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface Timeline {
  duration: number;
  fps: number;
  beats: BeatTiming[];
}

export interface BeatTiming {
  id: string;
  start: number;
  end: number;
  frames: [number, number];
  narration?: NarrationTiming;
}

export interface NarrationTiming {
  text: string;
  words: WordTiming[];
}

export interface WordTiming {
  text: string;
  start: number;
  end: number;
}

/**
 * Step 6: Build Artifact
 */
export interface BuildArtifact {
  path: string; // src/compositions/
  compositions: CompositionFile[];
  entryPoint: string; // 入口文件路径（index.tsx）
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface CompositionFile {
  beatId: string;
  path: string;
  syntaxValid: boolean;
  typeValid: boolean;
  metadata?: {
    strategy: 'template' | 'llm';
    complexity: 'simple' | 'medium' | 'complex';
    fallback: boolean;
  };
}

/**
 * Step 7: Validation Artifact
 */
export interface ValidationArtifact {
  path: string; // artifacts/validation-report.json
  content: ValidationReport;
  snapshots: SnapshotFrame[];
  status: 'passed' | 'failed';
  createdAt: Date;
}

export interface ValidationReport {
  timestamp: Date;
  status: 'passed' | 'failed';
  checks: {
    lint: CheckResult;
    validate: CheckResult;
    snapshot: SnapshotResult;
  };
  quality: QualityMetrics;
}

export interface CheckResult {
  passed: boolean;
  errors: string[];
}

export interface SnapshotResult {
  passed: boolean;
  frames: SnapshotFrame[];
}

export interface SnapshotFrame {
  beat: string;
  frame: number;
  path: string;
}

export interface QualityMetrics {
  smoothness: number;
  stability: number;
  performance: number;
  overall: number;
}

/**
 * Step 8: Render Artifact
 */
export interface RenderArtifact {
  path: string;
  videoPath: string;
  duration: number;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
  fileSize: number;
  status: 'completed' | 'failed';
  createdAt: Date;
}

/**
 * Artifacts 操作结果
 */
export interface ArtifactResult<T> {
  success: boolean;
  artifact?: T;
  error?: string;
}

/**
 * 重建选项
 */
export interface RebuildOptions {
  from: 'capture' | 'design' | 'strategy' | 'storyboard' | 'timeline' | 'build' | 'validate';
  beats?: string[];
  force?: boolean;
}
