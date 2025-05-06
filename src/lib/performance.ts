import { Logger } from './logger'

const logger = Logger.getInstance()

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]>
  private thresholds: Map<string, number>

  private constructor() {
    this.metrics = new Map()
    this.thresholds = new Map()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  start(operation: string): () => void {
    const startTime = performance.now()
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      this.recordMetric(operation, duration)
      this.checkThreshold(operation, duration)
    }
  }

  private recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }
    this.metrics.get(operation)?.push(duration)
  }

  setThreshold(operation: string, threshold: number) {
    this.thresholds.set(operation, threshold)
  }

  private checkThreshold(operation: string, duration: number) {
    const threshold = this.thresholds.get(operation)
    if (threshold && duration > threshold) {
      logger.warn(`Performance warning: ${operation} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`)
    }
  }

  getMetrics(operation: string) {
    const durations = this.metrics.get(operation) || []
    if (durations.length === 0) return null

    const sum = durations.reduce((a, b) => a + b, 0)
    const avg = sum / durations.length
    const max = Math.max(...durations)
    const min = Math.min(...durations)

    return {
      count: durations.length,
      average: avg,
      max,
      min,
      p95: this.calculatePercentile(durations, 95),
      p99: this.calculatePercentile(durations, 99)
    }
  }

  private calculatePercentile(durations: number[], percentile: number): number {
    const sorted = [...durations].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index]
  }

  reset() {
    this.metrics.clear()
  }
} 