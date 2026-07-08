/**
 * Core type definitions for the Remotion Harness Agent
 */

export interface UserIntent {
  type: 'create' | 'edit' | 'add_effect' | 'add_transition' | 'preview' | 'export' | 'query' | 'unknown';
  description: string;
  confidence: number;
  entities: {
    assets?: string[];
    effects?: string[];
    transitions?: string[];
    duration?: number;
    position?: number;
    text?: string;
  };
}

export interface IntentConfirmation {
  intent: UserIntent;
  clarifications: string[];
  needsConfirmation: boolean;
}

export interface TaskPlan {
  id: string;
  steps: TaskStep[];
  estimatedDuration: number;
  dependencies: string[];
}

export interface TaskStep {
  id: string;
  action: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface CompositionSpec {
  id: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  layers: Layer[];
}

export interface Layer {
  id: string;
  type: 'video' | 'image' | 'text' | 'audio' | 'shape';
  source?: string;
  startFrame: number;
  durationInFrames: number;
  effects: Effect[];
  transitions: Transition[];
  props: Record<string, any>;
}

export interface Effect {
  id: string;
  type: string;
  params: Record<string, any>;
  startFrame: number;
  durationInFrames: number;
}

export interface Transition {
  id: string;
  type: 'fade' | 'slide' | 'zoom' | 'dissolve' | 'wipe';
  durationInFrames: number;
  direction?: 'in' | 'out';
}

export interface AgentTrace {
  traceId: string;
  timestamp: number;
  event: string;
  data: any;
  duration?: number;
}

export interface AgentMetrics {
  requestCount: number;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  intentAccuracy: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview?: string;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
}
