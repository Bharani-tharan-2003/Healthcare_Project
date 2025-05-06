import { Logger } from './logger.js'
import { PerformanceMonitor } from './performance.js'
import buildConfig from '../config/build.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const logger = Logger.getInstance()
const performanceMonitor = PerformanceMonitor.getInstance()
const execAsync = promisify(exec)

export class BuildOptimizer {
  private static instance: BuildOptimizer
  private buildCache: Map<string, any>

  private constructor() {
    this.buildCache = new Map()
    performanceMonitor.setThreshold('build_optimization', 500)
  }

  static getInstance(): BuildOptimizer {
    if (!BuildOptimizer.instance) {
      BuildOptimizer.instance = new BuildOptimizer()
    }
    return BuildOptimizer.instance
  }

  async optimizeBuild(): Promise<void> {
    const endMeasurement = performanceMonitor.start('build_optimization')
    try {
      const config = buildConfig.getConfig()
      const { buildOptimizations } = config

      if (buildOptimizations.minify) {
        await this.minifyAssets()
      }

      if (buildOptimizations.compression) {
        await this.compressAssets()
      }

      if (buildOptimizations.treeShaking) {
        await this.analyzeBundle()
      }

      endMeasurement()
      logger.info('Build optimization completed successfully')
    } catch (error) {
      endMeasurement()
      logger.error('Build optimization failed:', error as Error)
      throw error
    }
  }

  private async minifyAssets(): Promise<void> {
    const endMeasurement = performanceMonitor.start('minify_assets')
    try {
      // Minify JavaScript and CSS
      await execAsync('npx terser src/**/*.js -o dist/ --compress --mangle')
      await execAsync('npx css-minify -d src/styles -o dist/styles')
      endMeasurement()
      logger.info('Assets minified successfully')
    } catch (error) {
      endMeasurement()
      logger.error('Asset minification failed:', error as Error)
      throw error
    }
  }

  private async compressAssets(): Promise<void> {
    const endMeasurement = performanceMonitor.start('compress_assets')
    try {
      // Compress assets using gzip and brotli
      await execAsync('npx gzip-cli dist/**/*.{js,css,html}')
      await execAsync('npx brotli-cli dist/**/*.{js,css,html}')
      endMeasurement()
      logger.info('Assets compressed successfully')
    } catch (error) {
      endMeasurement()
      logger.error('Asset compression failed:', error as Error)
      throw error
    }
  }

  private async analyzeBundle(): Promise<void> {
    const endMeasurement = performanceMonitor.start('analyze_bundle')
    try {
      // Analyze bundle size and dependencies
      await execAsync('npx webpack-bundle-analyzer dist/stats.json')
      endMeasurement()
      logger.info('Bundle analysis completed successfully')
    } catch (error) {
      endMeasurement()
      logger.error('Bundle analysis failed:', error as Error)
      throw error
    }
  }

  async clearBuildCache(): Promise<void> {
    this.buildCache.clear()
    logger.info('Build cache cleared')
  }

  getBuildStats(): { cacheSize: number; cacheKeys: string[] } {
    return {
      cacheSize: this.buildCache.size,
      cacheKeys: Array.from(this.buildCache.keys())
    }
  }
} 