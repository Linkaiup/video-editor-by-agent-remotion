/**
 * Tracing and logging infrastructure for agent operations
 */

import { AgentTrace, AgentMetrics } from './types.js';

class Tracer {
  private traces: AgentTrace[] = [];
  private metrics: AgentMetrics = {
    requestCount: 0,
    successCount: 0,
    failureCount: 0,
    avgResponseTime: 0,
    intentAccuracy: 0,
  };
  private moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  startTrace(event: string, data: any): TraceContext {
    const trace: AgentTrace = {
      traceId: this.generateTraceId(),
      timestamp: Date.now(),
      event: `${this.moduleName}.${event}`,
      data,
    };

    this.traces.push(trace);
    this.metrics.requestCount++;

    return new TraceContext(trace, this);
  }

  endTrace(traceId: string, result: { error?: string; [key: string]: any }) {
    const trace = this.traces.find(t => t.traceId === traceId);
    if (trace) {
      trace.duration = Date.now() - trace.timestamp;
      trace.data = { ...trace.data, ...result };

      if (result.error) {
        this.metrics.failureCount++;
      } else {
        this.metrics.successCount++;
      }

      // Update average response time
      const totalResponses = this.metrics.successCount + this.metrics.failureCount;
      this.metrics.avgResponseTime =
        (this.metrics.avgResponseTime * (totalResponses - 1) + (trace.duration || 0)) / totalResponses;
    }
  }

  getTraces(filter?: { event?: string; since?: number }): AgentTrace[] {
    let filtered = this.traces;

    if (filter?.event) {
      filtered = filtered.filter(t => t.event.includes(filter.event!));
    }

    if (filter?.since !== undefined) {
      filtered = filtered.filter(t => t.timestamp >= filter.since!);
    }

    return filtered;
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  clearTraces() {
    this.traces = [];
  }

  private generateTraceId(): string {
    return `${this.moduleName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${this.moduleName}] ${message}${logData}`);
  }
}

class TraceContext {
  constructor(
    private trace: AgentTrace,
    private tracer: Tracer
  ) {}

  end(result: { error?: string; [key: string]: any }) {
    this.tracer.endTrace(this.trace.traceId, result);
  }

  log(message: string, data?: any) {
    console.log(`[${this.trace.traceId}] ${message}`, data || '');
  }
}

const tracers = new Map<string, Tracer>();

export function createTracer(moduleName: string): Tracer {
  if (!tracers.has(moduleName)) {
    tracers.set(moduleName, new Tracer(moduleName));
  }
  return tracers.get(moduleName)!;
}

export function getAllMetrics(): Record<string, AgentMetrics> {
  const metrics: Record<string, AgentMetrics> = {};
  for (const [name, tracer] of tracers.entries()) {
    metrics[name] = tracer.getMetrics();
  }
  return metrics;
}

export function getAllTraces(filter?: { module?: string; event?: string; since?: number }): AgentTrace[] {
  let allTraces: AgentTrace[] = [];

  for (const [name, tracer] of tracers.entries()) {
    if (!filter?.module || name === filter.module) {
      const traces = tracer.getTraces(filter);
      allTraces = allTraces.concat(traces);
    }
  }

  return allTraces.sort((a, b) => a.timestamp - b.timestamp);
}
