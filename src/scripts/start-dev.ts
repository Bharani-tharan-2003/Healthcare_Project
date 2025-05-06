import { ProcessManager } from '../lib/processManager'
import { Logger } from '../lib/logger'

const logger = Logger.getInstance()
const processManager = ProcessManager.getInstance()

async function startDevServer() {
  try {
    await processManager.initialize()
    
    // Import next after port is set
    const { spawn } = await import('child_process')
    const next = spawn('next', ['dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: '1'
      }
    })

    next.on('close', (code) => {
      if (code !== 0) {
        logger.error(`Next.js process exited with code ${code}`)
        process.exit(code || 1)
      }
    })

    process.on('SIGINT', () => {
      next.kill('SIGINT')
      process.exit(0)
    })
  } catch (error) {
    logger.error('Error starting development server:', error as Error)
    process.exit(1)
  }
}

startDevServer() 