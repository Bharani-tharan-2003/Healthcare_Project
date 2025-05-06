interface CacheItem<T> {
  data: T
  timestamp: number
}

export class Cache {
  private static instance: Cache
  private cache: Map<string, CacheItem<any>>
  private defaultTTL: number

  private constructor() {
    this.cache = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now()
    this.cache.set(key, {
      data,
      timestamp,
    })
    
    // Auto-cleanup after TTL
    setTimeout(() => {
      this.delete(key)
    }, ttl || this.defaultTTL)
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > this.defaultTTL) {
      this.delete(key)
      return null
    }

    return item.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
} 