/**
 * 动画模板库 - 预制的动画效果
 *
 * 将 DSL AnimationType 映射到实际的 Remotion 代码片段
 */

import type { AnimationConfig } from './dsl-types.js';

export interface AnimationTemplate {
  // 模板名称
  name: string;

  // 需要的导入
  imports: string[];

  // 生成动画变量的代码
  generateCode: (config: AnimationConfig, varName: string) => string;

  // 应用到样式的代码
  applyStyle: (varName: string) => string;
}

/**
 * 动画模板库
 */
export const ANIMATION_TEMPLATES: Record<string, AnimationTemplate> = {
  // ==================== 基础动画 ====================

  fade_in: {
    name: 'Fade In',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const from = config.params?.from ?? 0;
      const to = config.params?.to ?? 1;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [${from}, ${to}],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `opacity: ${varName}`,
  },

  fade_out: {
    name: 'Fade Out',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const from = config.params?.from ?? 1;
      const to = config.params?.to ?? 0;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [${from}, ${to}],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `opacity: ${varName}`,
  },

  zoom_in: {
    name: 'Zoom In',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const [from, to] = config.params?.scale ?? [0.8, 1];
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [${from}, ${to}],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`scale(\${${varName}})\``,
  },

  zoom_out: {
    name: 'Zoom Out',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const [from, to] = config.params?.scale ?? [1, 1.2];
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [${from}, ${to}],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`scale(\${${varName}})\``,
  },

  slide_left: {
    name: 'Slide from Left',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const distance = config.params?.distance ?? -100;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [${distance}, 0],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`translateX(\${${varName}}%)\``,
  },

  slide_right: {
    name: 'Slide from Right',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const distance = config.params?.distance ?? 100;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [${distance}, 0],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`translateX(\${${varName}}%)\``,
  },

  slide_up: {
    name: 'Slide from Top',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const distance = config.params?.distance ?? -100;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [${distance}, 0],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`translateY(\${${varName}}%)\``,
  },

  slide_down: {
    name: 'Slide from Bottom',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const distance = config.params?.distance ?? 100;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [${distance}, 0],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`translateY(\${${varName}}%)\``,
  },

  // ==================== 旋转动画 ====================

  rotate_cw: {
    name: 'Rotate Clockwise',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const degrees = config.params?.degrees ?? 90;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [0, ${degrees}],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`rotate(\${${varName}}deg)\``,
  },

  rotate_ccw: {
    name: 'Rotate Counter-Clockwise',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const degrees = config.params?.degrees ?? -90;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [0, ${degrees}],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`rotate(\${${varName}}deg)\``,
  },

  rotate_360: {
    name: 'Rotate 360',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [0, 360],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`rotate(\${${varName}}deg)\``,
  },

  // ==================== 弹性动画 ====================

  bounce: {
    name: 'Bounce',
    imports: ['spring'],
    generateCode: (config, varName) => {
      const damping = config.params?.config?.damping ?? 10;
      const stiffness = config.params?.config?.stiffness ?? 100;
      const mass = config.params?.config?.mass ?? 1;
      return `  const ${varName} = spring({
    frame: frame - ${config.startFrame},
    fps,
    config: { damping: ${damping}, stiffness: ${stiffness}, mass: ${mass} },
  });`;
    },
    applyStyle: (varName) => `transform: \`scale(\${${varName}})\``,
  },

  spring: {
    name: 'Spring',
    imports: ['spring'],
    generateCode: (config, varName) => {
      const damping = config.params?.config?.damping ?? 15;
      const stiffness = config.params?.config?.stiffness ?? 120;
      return `  const ${varName} = spring({
    frame: frame - ${config.startFrame},
    fps,
    config: { damping: ${damping}, stiffness: ${stiffness} },
  });`;
    },
    applyStyle: (varName) => `transform: \`scale(\${${varName}})\``,
  },

  elastic: {
    name: 'Elastic',
    imports: ['spring'],
    generateCode: (config, varName) => {
      return `  const ${varName} = spring({
    frame: frame - ${config.startFrame},
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.8 },
  });`;
    },
    applyStyle: (varName) => `transform: \`scale(\${${varName}})\``,
  },

  // ==================== 3D 动画 ====================

  flip_horizontal: {
    name: 'Flip Horizontal',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [0, 180],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`rotateY(\${${varName}}deg)\``,
  },

  flip_vertical: {
    name: 'Flip Vertical',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [0, 180],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`rotateX(\${${varName}}deg)\``,
  },

  flip_3d: {
    name: '3D Flip',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [0, 180],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `transform: \`perspective(1000px) rotateY(\${${varName}}deg)\``,
  },

  perspective_rotate: {
    name: 'Perspective Rotate',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const perspective = config.params?.perspective ?? 1000;
      const rotateX = config.params?.rotateX ?? 0;
      const rotateY = config.params?.rotateY ?? 0;
      const rotateZ = config.params?.rotateZ ?? 360;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => {
      const rotateX = 0; // 从 config 获取
      const rotateY = 0;
      const rotateZ = 360;
      return `transform: \`perspective(1000px) rotateX(\${${varName} * ${rotateX}}deg) rotateY(\${${varName} * ${rotateY}}deg) rotateZ(\${${varName} * ${rotateZ}}deg)\``;
    },
  },

  // ==================== 模糊效果 ====================

  blur_in: {
    name: 'Blur In',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const blurAmount = config.params?.blurAmount ?? 10;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [${blurAmount}, 0],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `filter: \`blur(\${${varName}}px)\``,
  },

  blur_out: {
    name: 'Blur Out',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      const blurAmount = config.params?.blurAmount ?? 10;
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [0, ${blurAmount}],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `filter: \`blur(\${${varName}}px)\``,
  },

  // ==================== 颜色效果 ====================

  grayscale_in: {
    name: 'Grayscale In',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `filter: \`grayscale(\${${varName}})\``,
  },

  grayscale_out: {
    name: 'Grayscale Out',
    imports: ['interpolate'],
    generateCode: (config, varName) => {
      return `  const ${varName} = interpolate(
    frame,
    [${config.startFrame}, ${config.endFrame}],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );`;
    },
    applyStyle: (varName) => `filter: \`grayscale(\${${varName}})\``,
  },
};

/**
 * 获取所有需要的导入
 */
export function getRequiredImports(animations: AnimationConfig[]): string[] {
  const importsSet = new Set<string>();

  for (const animation of animations) {
    const template = ANIMATION_TEMPLATES[animation.type];
    if (template) {
      template.imports.forEach(imp => importsSet.add(imp));
    }
  }

  return Array.from(importsSet);
}

/**
 * 组合多个样式（处理冲突）
 */
export function combineStyles(styles: string[]): string {
  // 按类型分组
  const transforms: string[] = [];
  const filters: string[] = [];
  const others: string[] = [];

  for (const style of styles) {
    if (style.startsWith('transform:')) {
      const value = style.replace('transform: ', '').replace(/`/g, '');
      transforms.push(value);
    } else if (style.startsWith('filter:')) {
      const value = style.replace('filter: ', '').replace(/`/g, '');
      filters.push(value);
    } else {
      others.push(style);
    }
  }

  // 组合 transform
  if (transforms.length > 0) {
    const combined = transforms.map(t => t.replace(/\$\{|\}/g, '')).join(' ');
    others.push(`transform: \`${combined}\``);
  }

  // 组合 filter
  if (filters.length > 0) {
    const combined = filters.map(f => f.replace(/\$\{|\}/g, '')).join(' ');
    others.push(`filter: \`${combined}\``);
  }

  return others.join(',\n          ');
}
