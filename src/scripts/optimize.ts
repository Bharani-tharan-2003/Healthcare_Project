import { BuildOptimizer } from '../lib/buildOptimizer.js'
import { Logger } from '../lib/logger.js'

const logger = Logger.getInstance()
const buildOptimizer = BuildOptimizer.getInstance()

async function optimize() {
  try {
    logger.info('Starting build optimization...')
    await buildOptimizer.optimizeBuild()
    const stats = buildOptimizer.getBuildStats()
    logger.info('Build optimization completed', { stats })
  } catch (error) {
    logger.error('Build optimization failed:', error as Error)
    process.exit(1)
  }
}

optimize() 