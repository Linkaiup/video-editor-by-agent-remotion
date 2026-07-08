/**
 * Render Artifact 类型定义
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
