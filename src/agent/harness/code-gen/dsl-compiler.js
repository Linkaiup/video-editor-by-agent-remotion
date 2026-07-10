/**
 * DSL 到代码转换器
 *
 * 将 VideoSpec DSL 映射为实际的 React/TypeScript 代码
 */
import { ANIMATION_TEMPLATES, getRequiredImports, combineStyles } from './animation-templates.js';
import { createTracer } from '../../tracing.js';
const tracer = createTracer('Harness2.DSLCompiler');
/**
 * DSL 编译器
 */
export class DSLCompiler {
    /**
     * 将 VideoSpec 编译为 React 组件代码
     */
    compile(spec, componentName) {
        const trace = tracer.startTrace('dsl_compile', { specId: spec.id });
        try {
            tracer.log('info', `📦 编译 VideoSpec: ${spec.id}`);
            // 1. 收集所有需要的导入
            const imports = this.generateImports(spec);
            // 2. 生成组件代码
            const componentCode = this.generateComponent(spec, componentName);
            const fullCode = `${imports}

${componentCode}`;
            tracer.log('info', `✅ VideoSpec 编译完成`);
            trace.end({ success: true });
            return fullCode;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            tracer.log('error', '❌ VideoSpec 编译失败', { error: errorMessage });
            trace.end({ error: errorMessage });
            throw error;
        }
    }
    /**
     * 生成导入语句
     */
    generateImports(spec) {
        const remotionImports = new Set(['React', 'AbsoluteFill', 'useCurrentFrame']);
        // 收集动画所需的导入
        for (const layer of spec.layers) {
            const animImports = getRequiredImports(layer.animations);
            animImports.forEach(imp => remotionImports.add(imp));
            // 根据图层类型添加导入
            if (layer.type === 'image') {
                remotionImports.add('Img');
            }
            else if (layer.type === 'video') {
                remotionImports.add('Video');
            }
            else if (layer.type === 'audio') {
                remotionImports.add('Audio');
            }
        }
        const remotionList = Array.from(remotionImports).filter(imp => imp !== 'React');
        return `import React from 'react';
import { ${remotionList.join(', ')} } from 'remotion';`;
    }
    /**
     * 生成组件代码
     */
    generateComponent(spec, componentName) {
        const layersCode = spec.layers.map(layer => this.generateLayerCode(layer)).join('\n\n');
        // 生成图层 JSX，使用与 generateLayerCode 相同的命名规则
        const layersJSX = spec.layers.map(layer => {
            const componentName = `Layer_${layer.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
            return `      <${componentName} />`;
        }).join('\n');
        return `/**
 * Generated from VideoSpec DSL
 * ID: ${spec.id}
 * Complexity: ${spec.metadata?.complexity || 'unknown'}
 */

${layersCode}

export const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = ${spec.fps};

  return (
    <AbsoluteFill style={{ backgroundColor: '${spec.backgroundColor || '#FFFFFF'}' }}>
${layersJSX}
    </AbsoluteFill>
  );
};`;
    }
    /**
     * 生成图层代码
     */
    generateLayerCode(layer) {
        // 1. 生成动画变量
        const animationVars = layer.animations.map((anim, idx) => this.generateAnimationVariable(anim, `anim${idx + 1}`)).join('\n');
        // 2. 生成样式
        const styles = this.generateLayerStyles(layer);
        // 3. 生成图层内容
        const content = this.generateLayerContent(layer);
        // 计算图层可见性
        const visibilityCheck = `
  // Layer visibility
  const isVisible = frame >= ${layer.startFrame} && frame < ${layer.startFrame + layer.durationInFrames};
  if (!isVisible) return null;
`;
        // 生成唯一的组件名：使用完整的 layer.id（保留字母数字）
        const componentName = `Layer_${layer.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
        return `const ${componentName}: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = ${30}; // TODO: 从 spec 传入

${visibilityCheck}
${animationVars}

  return (
${content}
  );
};`;
    }
    /**
     * 生成动画变量
     */
    generateAnimationVariable(animation, varName) {
        const template = ANIMATION_TEMPLATES[animation.type];
        if (!template) {
            tracer.log('warn', `未找到动画模板: ${animation.type}`);
            return `  // Animation ${animation.type} not found`;
        }
        return template.generateCode(animation, varName);
    }
    /**
     * 生成图层样式
     */
    generateLayerStyles(layer) {
        const baseStyle = {
            position: 'absolute',
        };
        // 位置和大小
        if (layer.position) {
            if (layer.position.x !== undefined) {
                baseStyle.left = typeof layer.position.x === 'number' ? `${layer.position.x}px` : layer.position.x;
            }
            if (layer.position.y !== undefined) {
                baseStyle.top = typeof layer.position.y === 'number' ? `${layer.position.y}px` : layer.position.y;
            }
            if (layer.position.width !== undefined) {
                baseStyle.width = typeof layer.position.width === 'number' ? `${layer.position.width}px` : layer.position.width;
            }
            if (layer.position.height !== undefined) {
                baseStyle.height = typeof layer.position.height === 'number' ? `${layer.position.height}px` : layer.position.height;
            }
        }
        // 自定义样式
        if (layer.style) {
            Object.assign(baseStyle, layer.style);
        }
        return baseStyle;
    }
    /**
     * 生成图层内容（JSX）
     */
    generateLayerContent(layer) {
        const baseStyles = this.generateLayerStyles(layer);
        // 生成动画样式应用
        const animStyles = layer.animations.map((anim, idx) => {
            const template = ANIMATION_TEMPLATES[anim.type];
            if (!template)
                return '';
            return template.applyStyle(`anim${idx + 1}`);
        });
        // 合并样式
        const combinedAnimStyles = combineStyles(animStyles);
        const styleObject = JSON.stringify(baseStyles, null, 6)
            .replace(/"([^"]+)":/g, '$1:')
            .replace(/"/g, "'");
        const finalStyle = combinedAnimStyles
            ? `{ ...${styleObject}, ${combinedAnimStyles} }`
            : styleObject;
        // 从环境变量读取服务器端口，默认 3001
        const serverPort = process.env.PORT || '3001';
        // 根据图层类型生成内容
        switch (layer.type) {
            case 'image':
                // 使用 HTTP URL（与模板模式一致）
                const imgSrc = layer.src ? `http://localhost:${serverPort}/${layer.src}` : '';
                return `    <Img
      src="${imgSrc}"
      style={${finalStyle}}
    />`;
            case 'video':
                const videoSrc = layer.src ? `http://localhost:${serverPort}/${layer.src}` : '';
                return `    <Video
      src="${videoSrc}"
      style={${finalStyle}}
    />`;
            case 'text':
                return `    <div
      style={${finalStyle}}
    >
      ${layer.content || ''}
    </div>`;
            case 'shape':
                return `    <div
      style={${finalStyle}}
    />`;
            case 'audio':
                const audioSrc = layer.src ? `http://localhost:${serverPort}/${layer.src}` : '';
                return `    <Audio src="${audioSrc}" />`;
            default:
                return `    <div style={${finalStyle}}>Unknown layer type: ${layer.type}</div>`;
        }
    }
    /**
     * 验证生成的代码
     */
    validateGeneratedCode(code) {
        const errors = [];
        // 基础语法检查
        if (!code.includes('import')) {
            errors.push('缺少 import 语句');
        }
        if (!code.includes('export')) {
            errors.push('缺少 export 语句');
        }
        if (!code.includes('React.FC')) {
            errors.push('不是有效的 React 组件');
        }
        // Remotion 特定检查
        if (!code.includes('useCurrentFrame')) {
            errors.push('未使用 useCurrentFrame');
        }
        if (!code.includes('AbsoluteFill')) {
            errors.push('未使用 AbsoluteFill');
        }
        // 语法平衡检查
        const openBraces = (code.match(/\{/g) || []).length;
        const closeBraces = (code.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            errors.push(`大括号不平衡: ${openBraces} 个 { vs ${closeBraces} 个 }`);
        }
        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            errors.push(`圆括号不平衡: ${openParens} 个 ( vs ${closeParens} 个 )`);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
