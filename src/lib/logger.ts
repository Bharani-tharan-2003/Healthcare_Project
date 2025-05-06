export class Logger {
  private static instance: Logger
  private isDevelopment: boolean

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data || '')
  }

  error(message: string, error?: Error) {
    console.error(`[ERROR] ${message}`, error || '')
    if (this.isDevelopment && error) {
      console.error(error.stack)
    }
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '')
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '')
    }
  }
} 