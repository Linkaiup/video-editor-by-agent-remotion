/**
 * Tracing and logging infrastructure for agent operations
 */
class Tracer {
    constructor(moduleName) {
        this.traces = [];
        this.metrics = {
            requestCount: 0,
            successCount: 0,
            failureCount: 0,
            avgResponseTime: 0,
            intentAccuracy: 0,
        };
        this.moduleName = moduleName;
    }
    startTrace(event, data) {
        const trace = {
            traceId: this.generateTraceId(),
            timestamp: Date.now(),
            event: `${this.moduleName}.${event}`,
            data,
        };
        this.traces.push(trace);
        this.metrics.requestCount++;
        return new TraceContext(trace, this);
    }
    endTrace(traceId, result) {
        const trace = this.traces.find(t => t.traceId === traceId);
        if (trace) {
            trace.duration = Date.now() - trace.timestamp;
            trace.data = { ...trace.data, ...result };
            if (result.error) {
                this.metrics.failureCount++;
            }
            else {
                this.metrics.successCount++;
            }
            // Update average response time
            const totalResponses = this.metrics.successCount + this.metrics.failureCount;
            this.metrics.avgResponseTime =
                (this.metrics.avgResponseTime * (totalResponses - 1) + (trace.duration || 0)) / totalResponses;
        }
    }
    getTraces(filter) {
        let filtered = this.traces;
        if (filter?.event) {
            filtered = filtered.filter(t => t.event.includes(filter.event));
        }
        if (filter?.since !== undefined) {
            filtered = filtered.filter(t => t.timestamp >= filter.since);
        }
        return filtered;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    clearTraces() {
        this.traces = [];
    }
    generateTraceId() {
        return `${this.moduleName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logData = data ? ` ${JSON.stringify(data)}` : '';
        console.log(`[${timestamp}] [${level.toUpperCase()}] [${this.moduleName}] ${message}${logData}`);
    }
}
class TraceContext {
    constructor(trace, tracer) {
        this.trace = trace;
        this.tracer = tracer;
    }
    end(result) {
        this.tracer.endTrace(this.trace.traceId, result);
    }
    log(message, data) {
        console.log(`[${this.trace.traceId}] ${message}`, data || '');
    }
}
const tracers = new Map();
export function createTracer(moduleName) {
    if (!tracers.has(moduleName)) {
        tracers.set(moduleName, new Tracer(moduleName));
    }
    return tracers.get(moduleName);
}
export function getAllMetrics() {
    const metrics = {};
    for (const [name, tracer] of tracers.entries()) {
        metrics[name] = tracer.getMetrics();
    }
    return metrics;
}
export function getAllTraces(filter) {
    let allTraces = [];
    for (const [name, tracer] of tracers.entries()) {
        if (!filter?.module || name === filter.module) {
            const traces = tracer.getTraces(filter);
            allTraces = allTraces.concat(traces);
        }
    }
    return allTraces.sort((a, b) => a.timestamp - b.timestamp);
}
