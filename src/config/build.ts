import { Logger } from '../lib/logger.js'
import { PerformanceMonitor } from '../lib/performance.js'

const logger = Logger.getInstance()
const performanceMonitor = PerformanceMonitor.getInstance()

export interface BuildConfig {
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
  port: number
  host: string
  apiUrl: string
  databaseUrl: string
  cacheEnabled: boolean
  analyticsEnabled: boolean
  performanceMonitoring: boolean
  buildOptimizations: {
    minify: boolean
    sourceMaps: boolean
    compression: boolean
    treeShaking: boolean
  }
}

class BuildConfigManager {
  private static instance: BuildConfigManager
  private config: BuildConfig

  private constructor() {
    this.config = this.loadConfig()
    performanceMonitor.setThreshold('build_config', 100)
  }

  static getInstance(): BuildConfigManager {
    if (!BuildConfigManager.instance) {
      BuildConfigManager.instance = new BuildConfigManager()
    }
    return BuildConfigManager.instance
  }

  private loadConfig(): BuildConfig {
    const endMeasurement = performanceMonitor.start('load_build_config')
    try {
      const isDevelopment = process.env.NODE_ENV === 'development'
      const isProduction = process.env.NODE_ENV === 'production'
      const isTest = process.env.NODE_ENV === 'test'

      const config: BuildConfig = {
        isDevelopment,
        isProduction,
        isTest,
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || 'localhost',
        apiUrl: process.env.API_URL || 'http://localhost:3000/api',
        databaseUrl: process.env.DATABASE_URL || 'postgres://localhost:5432/healthcare',
        cacheEnabled: process.env.CACHE_ENABLED !== 'false',
        analyticsEnabled: process.env.ANALYTICS_ENABLED !== 'false',
        performanceMonitoring: process.env.PERFORMANCE_MONITORING !== 'false',
        buildOptimizations: {
          minify: isProduction,
          sourceMaps: !isProduction,
          compression: isProduction,
          treeShaking: true
        }
      }

      endMeasurement()
      logger.info('Build configuration loaded successfully')
      return config
    } catch (error) {
      endMeasurement()
      logger.error('Error loading build configuration:', error as Error)
      throw error
    }
  }

  getConfig(): BuildConfig {
    return this.config
  }

  updateConfig(updates: Partial<BuildConfig>): void {
    this.config = { ...this.config, ...updates }
    logger.info('Build configuration updated')
  }
}

export default BuildConfigManager.getInstance() 