import { FileSystem } from '../lib/fileSystem.js'
import { Logger } from '../lib/logger.js'
import path from 'path'

const logger = Logger.getInstance()

async function clean() {
  try {
    const nextDir = path.join(process.cwd(), '.next')
    await FileSystem.getInstance().safeDeleteDirectory(nextDir)
    logger.info('Successfully cleaned .next directory')
  } catch (error) {
    logger.error('Error cleaning .next directory:', error as Error)
    process.exit(1)
  }
}

clean() 