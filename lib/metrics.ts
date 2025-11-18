/**
 * Metrics tracking utility
 * Provides observability into application performance and usage
 */

import { logger } from './logger';

interface MetricLabels {
  [key: string]: string | number;
}

class MetricsCollector {
  private counters: Map<string, number>;
  private gauges: Map<string, number>;
  private histograms: Map<string, number[]>;

  constructor() {
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();
  }

  // Counter: monotonically increasing value
  incrementCounter(name: string, labels?: MetricLabels, value: number = 1) {
    const key = this.makeKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    logger.debug('Counter incremented', { metric: key, value });
  }

  // Gauge: arbitrary value that can go up or down
  setGauge(name: string, value: number, labels?: MetricLabels) {
    const key = this.makeKey(name, labels);
    this.gauges.set(key, value);
    logger.debug('Gauge set', { metric: key, value });
  }

  // Histogram: track distribution of values
  recordHistogram(name: string, value: number, labels?: MetricLabels) {
    const key = this.makeKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
    logger.debug('Histogram recorded', { metric: key, value });
  }

  // Timing helper
  recordTiming(name: string, durationMs: number, labels?: MetricLabels) {
    this.recordHistogram(`${name}_duration_ms`, durationMs, labels);
  }

  // Get all metrics
  getMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([key, values]) => [
          key,
          {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
          },
        ])
      ),
    };
  }

  // Reset all metrics
  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  private makeKey(name: string, labels?: MetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}

export const metrics = new MetricsCollector();

// Common metrics helpers
export function trackApiRequest(method: string, path: string, statusCode: number, duration: number) {
  metrics.incrementCounter('api_requests_total', { method, path, status: statusCode });
  metrics.recordTiming('api_request', duration, { method, path });
}

export function trackDatabaseQuery(operation: string, table: string, duration: number) {
  metrics.incrementCounter('db_queries_total', { operation, table });
  metrics.recordTiming('db_query', duration, { operation, table });
}

export function trackEntityOperation(entityType: string, operation: string) {
  metrics.incrementCounter('entity_operations_total', { entityType, operation });
}
