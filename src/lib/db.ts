import mongoose from 'mongoose'
import { Logger } from './logger.js'
import { PerformanceMonitor } from './performance.js'

const logger = Logger.getInstance()
const performanceMonitor = PerformanceMonitor.getInstance()

class Database {
  private static instance: Database
  private connection: mongoose.Connection | null = null
  private isConnecting: boolean = false
  private connectionPromise: Promise<void> | null = null

  private constructor() {
    // Set performance threshold for database operations
    performanceMonitor.setThreshold('database_operation', 1000) // 1 second threshold
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  async connect(): Promise<void> {
    if (this.connection) return
    if (this.isConnecting) {
      await this.connectionPromise
      return
    }

    this.isConnecting = true
    const endMeasurement = performanceMonitor.start('database_connection')

    try {
      this.connectionPromise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare', {
        maxPoolSize: 10,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })

      await this.connectionPromise
      this.connection = mongoose.connection
      
      this.connection.on('error', (error) => {
        logger.error('Database connection error:', error)
      })

      this.connection.on('disconnected', () => {
        logger.warn('Database disconnected')
      })

      this.connection.on('reconnected', () => {
        logger.info('Database reconnected')
      })

      endMeasurement()
      logger.info('Database connected successfully')
    } catch (error) {
      endMeasurement()
      this.isConnecting = false
      this.connectionPromise = null
      logger.error('Failed to connect to database:', error as Error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return
    
    const endMeasurement = performanceMonitor.start('database_disconnection')
    try {
      await mongoose.disconnect()
      this.connection = null
      this.isConnecting = false
      this.connectionPromise = null
      endMeasurement()
      logger.info('Database disconnected successfully')
    } catch (error) {
      endMeasurement()
      logger.error('Error disconnecting from database:', error as Error)
      throw error
    }
  }

  getConnection(): mongoose.Connection {
    if (!this.connection) {
      throw new Error('Database not connected')
    }
    return this.connection
  }
}

export default Database.getInstance() 