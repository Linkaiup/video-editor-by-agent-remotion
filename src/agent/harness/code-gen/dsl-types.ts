/**
 * VideoSpec DSL - 视频规格领域特定语言
 *
 * 用于描述视频动画效果的结构化数据格式
 * LLM 生成 DSL，系统映射到预制组件
 */

/**
 * 动画类型
 */
export type AnimationType =
  // 基础动画
  | 'fade_in'
  | 'fade_out'
  | 'zoom_in'
  | 'zoom_out'
  | 'slide_left'
  | 'slide_right'
  | 'slide_up'
  | 'slide_down'
  // 旋转动画
  | 'rotate_cw'      // 顺时针
  | 'rotate_ccw'     // 逆时针
  | 'rotate_360'
  // 弹性动画
  | 'bounce'
  | 'spring'
  | 'elastic'
  // 复杂动画
  | 'flip_horizontal'
  | 'flip_vertical'
  | 'flip_3d'
  | 'perspective_rotate'
  // 粒子效果
  | 'particles'
  | 'confetti'
  // 模糊效果
  | 'blur_in'
  | 'blur_out'
  // 颜色效果
  | 'color_shift'
  | 'grayscale_in'
  | 'grayscale_out'
  // 组合效果
  | 'custom';

/**
 * 缓动函数
 */
export type EasingFunction =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-out-cubic'
  | 'ease-in-back'
  | 'ease-out-back'
  | 'ease-in-out-back';

/**
 * 动画配置
 */
export interface AnimationConfig {
  type: AnimationType;
  startFrame: number;
  endFrame: number;
  easing?: EasingFunction;

  // 参数（根据 type 不同而不同）
  params?: {
    // fade
    from?: number;
    to?: number;

    // zoom
    scale?: [number, number];

    // slide
    distance?: number;

    // rotate
    degrees?: number;

    // spring
    config?: {
      damping?: number;
      stiffness?: number;
      mass?: number;
    };

    // blur
    blurAmount?: number;

    // color
    colorFrom?: string;
    colorTo?: string;

    // particles
    particleCount?: number;
    particleColor?: string;

    // 3d
    perspective?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
  };
}

/**
 * 图层类型
 */
export type LayerType =
  | 'image'
  | 'video'
  | 'text'
  | 'shape'
  | 'audio';

/**
 * 图层配置
 */
export interface LayerConfig {
  id: string;
  type: LayerType;

  // 资源
  src?: string;
  content?: string;

  // 时间轴
  startFrame: number;
  durationInFrames: number;

  // 位置和大小
  position?: {
    x: number | string;  // 100 或 '50%'
    y: number | string;
    width?: number | string;
    height?: number | string;
  };

  // 样式
  style?: {
    opacity?: number;
    zIndex?: number;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none';
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    textAlign?: 'left' | 'center' | 'right';
  };

  // 动画列表
  animations: AnimationConfig[];
}

/**
 * VideoSpec DSL - 完整的视频规格
 */
export interface VideoSpec {
  // 基础信息
  id: string;
  name: string;

  // 视频格式
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;

  // 图层列表
  layers: LayerConfig[];

  // 全局样式
  backgroundColor?: string;

  // 元数据
  metadata?: {
    generatedBy: 'llm' | 'template';
    complexity: 'simple' | 'medium' | 'complex';
    features: string[];
  };
}

/**
 * LLM 生成的原始响应
 */
export interface LLMCodeGenResponse {
  spec: VideoSpec;
  reasoning?: string;
  confidence: number;
}
