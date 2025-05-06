import { Logger } from './logger'
import config from '../config'

const logger = Logger.getInstance()

export class ProcessManager {
  private static instance: ProcessManager
  private port: number
  private maxRetries: number
  private currentRetry: number

  private constructor() {
    this.port = config.server.port
    this.maxRetries = 5
    this.currentRetry = 0
  }

  static getInstance(): ProcessManager {
    if (!ProcessManager.instance) {
      ProcessManager.instance = new ProcessManager()
    }
    return ProcessManager.instance
  }

  async findAvailablePort(): Promise<number> {
    const net = await import('net')
    return new Promise((resolve, reject) => {
      const server = net.createServer()
      
      server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          this.currentRetry++
          if (this.currentRetry >= this.maxRetries) {
            reject(new Error('Max retries reached for finding available port'))
            return
          }
          this.port++
          server.close()
          this.findAvailablePort().then(resolve).catch(reject)
        } else {
          reject(err)
        }
      })

      server.listen(this.port, () => {
        const address = server.address()
        const port = typeof address === 'string' ? this.port : address?.port || this.port
        server.close(() => {
          resolve(port)
        })
      })
    })
  }

  async cleanup() {
    try {
      // Kill any processes using the port
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)

      const command = process.platform === 'win32'
        ? `netstat -ano | findstr :${this.port}`
        : `lsof -i :${this.port}`

      const { stdout } = await execAsync(command)
      if (stdout) {
        const pid = process.platform === 'win32'
          ? stdout.split('\n')[0].split(' ').pop()
          : stdout.split('\n')[1].split(' ')[1]

        if (pid) {
          const killCommand = process.platform === 'win32'
            ? `taskkill /F /PID ${pid}`
            : `kill -9 ${pid}`

          await execAsync(killCommand)
          logger.info(`Killed process ${pid} using port ${this.port}`)
        }
      }
    } catch (error) {
      logger.error('Error during cleanup:', error as Error)
    }
  }

  async initialize() {
    try {
      await this.cleanup()
      const availablePort = await this.findAvailablePort()
      process.env.PORT = availablePort.toString()
      logger.info(`Server will start on port ${availablePort}`)
    } catch (error) {
      logger.error('Error initializing process manager:', error as Error)
      throw error
    }
  }
} 