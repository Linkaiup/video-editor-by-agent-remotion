/**
 * Skills module - predefined animation and effect skills
 */

import { Effect, Transition } from './types.js';
import { generateId } from './tools.js';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'animation' | 'effect' | 'transition' | 'text' | 'composite';
  parameters: SkillParameter[];
  execute: (params: Record<string, any>) => Effect | Transition | string;
}

export interface SkillParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'color' | 'select';
  required: boolean;
  default?: any;
  options?: string[];
  min?: number;
  max?: number;
  description: string;
}

/**
 * Built-in animation skills
 */
export const animationSkills: Skill[] = [
  {
    id: 'fade-in',
    name: 'Fade In',
    description: 'Gradually fade element from transparent to opaque',
    category: 'animation',
    parameters: [
      { name: 'duration', type: 'number', required: false, default: 30, min: 1, description: 'Duration in frames' },
      { name: 'delay', type: 'number', required: false, default: 0, min: 0, description: 'Delay before starting' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'fade',
      params: { direction: 'in', ...params },
      startFrame: params.delay || 0,
      durationInFrames: params.duration || 30,
    }),
  },
  {
    id: 'fade-out',
    name: 'Fade Out',
    description: 'Gradually fade element from opaque to transparent',
    category: 'animation',
    parameters: [
      { name: 'duration', type: 'number', required: false, default: 30, min: 1, description: 'Duration in frames' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'fade',
      params: { direction: 'out', ...params },
      startFrame: 0,
      durationInFrames: params.duration || 30,
    }),
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Scale element from small to normal size',
    category: 'animation',
    parameters: [
      { name: 'from', type: 'number', required: false, default: 0.5, min: 0, max: 2, description: 'Starting scale' },
      { name: 'to', type: 'number', required: false, default: 1, min: 0, max: 2, description: 'Ending scale' },
      { name: 'duration', type: 'number', required: false, default: 30, min: 1, description: 'Duration in frames' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'zoom',
      params,
      startFrame: 0,
      durationInFrames: params.duration || 30,
    }),
  },
  {
    id: 'slide-in-left',
    name: 'Slide In from Left',
    description: 'Slide element in from the left edge',
    category: 'animation',
    parameters: [
      { name: 'duration', type: 'number', required: false, default: 30, min: 1, description: 'Duration in frames' },
      { name: 'distance', type: 'number', required: false, default: 1920, min: 0, description: 'Distance in pixels' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'slide',
      params: { fromX: -(params.distance || 1920), toX: 0 },
      startFrame: 0,
      durationInFrames: params.duration || 30,
    }),
  },
  {
    id: 'slide-in-right',
    name: 'Slide In from Right',
    description: 'Slide element in from the right edge',
    category: 'animation',
    parameters: [
      { name: 'duration', type: 'number', required: false, default: 30, min: 1, description: 'Duration in frames' },
      { name: 'distance', type: 'number', required: false, default: 1920, min: 0, description: 'Distance in pixels' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'slide',
      params: { fromX: params.distance || 1920, toX: 0 },
      startFrame: 0,
      durationInFrames: params.duration || 30,
    }),
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    description: 'Rotate element into view',
    category: 'animation',
    parameters: [
      { name: 'degrees', type: 'number', required: false, default: 360, description: 'Rotation degrees' },
      { name: 'duration', type: 'number', required: false, default: 30, min: 1, description: 'Duration in frames' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'rotate',
      params,
      startFrame: 0,
      durationInFrames: params.duration || 30,
    }),
  },
];

/**
 * Built-in effect skills
 */
export const effectSkills: Skill[] = [
  {
    id: 'blur',
    name: 'Blur',
    description: 'Apply Gaussian blur effect',
    category: 'effect',
    parameters: [
      { name: 'amount', type: 'number', required: false, default: 10, min: 0, max: 50, description: 'Blur intensity' },
      { name: 'animated', type: 'boolean', required: false, default: false, description: 'Animate blur over time' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'blur',
      params,
      startFrame: 0,
      durationInFrames: params.animated ? 30 : 1,
    }),
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Convert to black and white',
    category: 'effect',
    parameters: [
      { name: 'intensity', type: 'number', required: false, default: 1, min: 0, max: 1, description: 'Effect intensity' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'grayscale',
      params,
      startFrame: 0,
      durationInFrames: 1,
    }),
  },
  {
    id: 'brightness',
    name: 'Brightness',
    description: 'Adjust brightness level',
    category: 'effect',
    parameters: [
      { name: 'amount', type: 'number', required: false, default: 1.2, min: 0, max: 3, description: 'Brightness multiplier' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'brightness',
      params,
      startFrame: 0,
      durationInFrames: 1,
    }),
  },
  {
    id: 'contrast',
    name: 'Contrast',
    description: 'Adjust contrast level',
    category: 'effect',
    parameters: [
      { name: 'amount', type: 'number', required: false, default: 1.2, min: 0, max: 3, description: 'Contrast multiplier' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'contrast',
      params,
      startFrame: 0,
      durationInFrames: 1,
    }),
  },
  {
    id: 'saturation',
    name: 'Saturation',
    description: 'Adjust color saturation',
    category: 'effect',
    parameters: [
      { name: 'amount', type: 'number', required: false, default: 1.5, min: 0, max: 3, description: 'Saturation multiplier' },
    ],
    execute: (params) => ({
      id: generateId('effect'),
      type: 'saturate',
      params,
      startFrame: 0,
      durationInFrames: 1,
    }),
  },
];

/**
 * Built-in transition skills
 */
export const transitionSkills: Skill[] = [
  {
    id: 'crossfade',
    name: 'Crossfade',
    description: 'Smooth fade between two clips',
    category: 'transition',
    parameters: [
      { name: 'duration', type: 'number', required: false, default: 15, min: 1, description: 'Transition duration in frames' },
    ],
    execute: (params) => ({
      id: generateId('transition'),
      type: 'fade' as const,
      durationInFrames: params.duration || 15,
    }),
  },
  {
    id: 'dissolve',
    name: 'Dissolve',
    description: 'Dissolve transition effect',
    category: 'transition',
    parameters: [
      { name: 'duration', type: 'number', required: false, default: 20, min: 1, description: 'Transition duration in frames' },
    ],
    execute: (params) => ({
      id: generateId('transition'),
      type: 'dissolve' as const,
      durationInFrames: params.duration || 20,
    }),
  },
  {
    id: 'slide-transition',
    name: 'Slide',
    description: 'Slide transition between clips',
    category: 'transition',
    parameters: [
      { name: 'duration', type: 'number', required: false, default: 20, min: 1, description: 'Transition duration in frames' },
      { name: 'direction', type: 'select', required: false, default: 'left', options: ['left', 'right', 'up', 'down'], description: 'Slide direction' },
    ],
    execute: (params) => ({
      id: generateId('transition'),
      type: 'slide' as const,
      durationInFrames: params.duration || 20,
    }),
  },
  {
    id: 'zoom-transition',
    name: 'Zoom',
    description: 'Zoom transition between clips',
    category: 'transition',
    parameters: [
      { name: 'duration', type: 'number', required: false, default: 25, min: 1, description: 'Transition duration in frames' },
    ],
    execute: (params) => ({
      id: generateId('transition'),
      type: 'zoom' as const,
      durationInFrames: params.duration || 25,
    }),
  },
];

/**
 * Get all available skills
 */
export function getAllSkills(): Skill[] {
  return [...animationSkills, ...effectSkills, ...transitionSkills];
}

/**
 * Find skill by ID
 */
export function findSkill(skillId: string): Skill | undefined {
  return getAllSkills().find(skill => skill.id === skillId);
}

/**
 * Find skills by category
 */
export function findSkillsByCategory(category: Skill['category']): Skill[] {
  return getAllSkills().filter(skill => skill.category === category);
}

/**
 * Search skills by keyword
 */
export function searchSkills(query: string): Skill[] {
  const lowerQuery = query.toLowerCase();
  return getAllSkills().filter(
    skill =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery)
  );
}
