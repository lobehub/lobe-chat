/**
 * CometAPI Performance Monitoring and Observability Module
 * This module provides production-ready monitoring capabilities for CometAPI integration
 */

interface RequestMetrics {
  duration: number;
  model: string;
  requestId: string;
  status: 'success' | 'error';
  timestamp: string;
  tokenCount?: number;
}

interface ErrorMetrics {
  count: number;
  errorType: string;
  lastOccurred: string;
  message: string;
}

class CometAPIMonitor {
  private static instance: CometAPIMonitor;
  private metrics: RequestMetrics[] = [];
  private errors: Map<string, ErrorMetrics> = new Map();
  private readonly maxMetricsHistory = 1000; // Keep last 1000 requests

  private constructor() {}

  static getInstance(): CometAPIMonitor {
    if (!CometAPIMonitor.instance) {
      CometAPIMonitor.instance = new CometAPIMonitor();
    }
    return CometAPIMonitor.instance;
  }

  /**
   * Record a successful API request
   */
  recordRequest(metrics: Omit<RequestMetrics, 'status'>) {
    const requestMetrics: RequestMetrics = {
      ...metrics,
      status: 'success',
    };

    this.metrics.push(requestMetrics);

    // Keep only recent metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
      console.debug('[CometAPI Monitor] Request recorded:', {
        duration: metrics.duration,
        model: metrics.model,
        requestId: metrics.requestId,
        tokenCount: metrics.tokenCount,
      });
    }
  }

  /**
   * Record an API error
   */
  recordError(errorType: string, message: string, requestId?: string) {
    const errorKey = `${errorType}:${message}`;
    const existing = this.errors.get(errorKey);

    const errorMetrics: ErrorMetrics = {
      count: existing ? existing.count + 1 : 1,
      errorType,
      lastOccurred: new Date().toISOString(),
      message,
    };

    this.errors.set(errorKey, errorMetrics);

    // Record as failed request if we have a requestId
    if (requestId) {
      this.metrics.push({
        duration: 0,
        model: 'unknown',
        requestId,
        status: 'error',
        timestamp: new Date().toISOString(),
      });
    }

    if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
      console.debug('[CometAPI Monitor] Error recorded:', {
        count: errorMetrics.count,
        errorType,
        message,
        requestId,
      });
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const recentMetrics = this.metrics.filter((m) => {
      const age = Date.now() - new Date(m.timestamp).getTime();
      return age < 3_600_000; // Last hour
    });

    const successfulRequests = recentMetrics.filter((m) => m.status === 'success');
    const failedRequests = recentMetrics.filter((m) => m.status === 'error');

    const durations = successfulRequests.map((m) => m.duration);
    const avgDuration =
      durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const p95Duration = durations.length > 0 ? this.percentile(durations, 0.95) : 0;

    return {
      avgResponseTime: Math.round(avgDuration),
      errorRate:
        recentMetrics.length > 0 ? (failedRequests.length / recentMetrics.length) * 100 : 0,
      p95ResponseTime: Math.round(p95Duration),
      requestCount: recentMetrics.length,
      successCount: successfulRequests.length,
      totalErrors: failedRequests.length,
    };
  }

  /**
   * Get error summary
   */
  getErrorSummary() {
    const recentErrors = Array.from(this.errors.values()).filter((error) => {
      const age = Date.now() - new Date(error.lastOccurred).getTime();
      return age < 3_600_000; // Last hour
    });

    return recentErrors
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 errors
      .map((error) => ({
        count: error.count,
        errorType: error.errorType,
        lastOccurred: error.lastOccurred,
        message: error.message.slice(0, 100), // Truncate long messages
      }));
  }

  /**
   * Get model usage statistics
   */
  getModelStats() {
    const recentMetrics = this.metrics.filter((m) => {
      const age = Date.now() - new Date(m.timestamp).getTime();
      return age < 3_600_000; // Last hour
    });

    const modelUsage = new Map<string, { count: number; duration: number; errors: number }>();

    for (const metric of recentMetrics) {
      const existing = modelUsage.get(metric.model) || { count: 0, duration: 0, errors: 0 };
      modelUsage.set(metric.model, {
        count: existing.count + 1,
        duration: existing.duration + metric.duration,
        errors: existing.errors + (metric.status === 'error' ? 1 : 0),
      });
    }

    return Array.from(modelUsage.entries()).map(([model, stats]) => ({
      avgDuration: stats.count > 0 ? Math.round(stats.duration / stats.count) : 0,
      errorRate: stats.count > 0 ? (stats.errors / stats.count) * 100 : 0,
      model,
      requestCount: stats.count,
    }));
  }

  /**
   * Generate monitoring report
   */
  generateReport() {
    const performanceStats = this.getPerformanceStats();
    const errorSummary = this.getErrorSummary();
    const modelStats = this.getModelStats();

    return {
      errors: errorSummary,
      models: modelStats,
      performance: performanceStats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Log monitoring report to console (for debugging)
   */
  logReport() {
    if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
      const report = this.generateReport();
      console.debug('[CometAPI Monitor] Performance Report:', JSON.stringify(report, null, 2));
    }
  }

  /**
   * Clear old metrics and errors (housekeeping)
   */
  cleanup() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    this.metrics = this.metrics.filter((m) => new Date(m.timestamp).getTime() > cutoff);

    for (const [key, error] of this.errors.entries()) {
      if (new Date(error.lastOccurred).getTime() < cutoff) {
        this.errors.delete(key);
      }
    }
  }

  private percentile(values: number[], p: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }
}

export const cometAPIMonitor = CometAPIMonitor.getInstance();

/**
 * Performance timer utility
 */
export class PerformanceTimer {
  private startTime: number;
  private requestId: string;

  constructor(requestId: string) {
    this.startTime = Date.now();
    this.requestId = requestId;
  }

  end(model: string, tokenCount?: number) {
    const duration = Date.now() - this.startTime;
    cometAPIMonitor.recordRequest({
      duration,
      model,
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
      tokenCount,
    });
    return duration;
  }

  endWithError(errorType: string, message: string) {
    cometAPIMonitor.recordError(errorType, message, this.requestId);
  }
}

/**
 * Health check for CometAPI
 */
export const performHealthCheck = async (
  client: any,
): Promise<{
  error?: string;
  healthy: boolean;
  latency?: number;
}> => {
  const startTime = Date.now();

  try {
    await client.models.list();
    const latency = Date.now() - startTime;

    return {
      healthy: true,
      latency,
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;

    return {
      error: error.message || 'Unknown error',
      healthy: false,
      latency,
    };
  }
};
