import { Logger } from './logger.js'
import { PerformanceMonitor } from './performance.js'

const logger = Logger.getInstance()
const performanceMonitor = PerformanceMonitor.getInstance()

export class QueryOptimizer {
  private static instance: QueryOptimizer
  private queryCache: Map<string, any>
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.queryCache = new Map()
    performanceMonitor.setThreshold('query_optimization', 500) // 500ms threshold
  }

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer()
    }
    return QueryOptimizer.instance
  }

  async optimizeQuery<T>(
    key: string,
    query: () => Promise<T>,
    options: {
      useCache?: boolean
      cacheKey?: string
      maxAge?: number
    } = {}
  ): Promise<T> {
    const {
      useCache = true,
      cacheKey = key,
      maxAge = this.CACHE_TTL
    } = options

    const endMeasurement = performanceMonitor.start(`query_${key}`)

    try {
      // Check cache first
      if (useCache) {
        const cachedResult = this.getFromCache(cacheKey)
        if (cachedResult) {
          endMeasurement()
          return cachedResult as T
        }
      }

      // Execute query
      const result = await query()

      // Cache the result
      if (useCache) {
        this.setInCache(cacheKey, result, maxAge)
      }

      endMeasurement()
      return result
    } catch (error) {
      endMeasurement()
      logger.error(`Query optimization error for ${key}:`, error as Error)
      throw error
    }
  }

  private getFromCache(key: string): any | null {
    const cached = this.queryCache.get(key)
    if (!cached) return null

    const { data, timestamp } = cached
    if (Date.now() - timestamp > this.CACHE_TTL) {
      this.queryCache.delete(key)
      return null
    }

    return data
  }

  private setInCache(key: string, data: any, maxAge: number): void {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      maxAge
    })
  }

  clearCache(): void {
    this.queryCache.clear()
    logger.info('Query cache cleared')
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys())
    }
  }
} 