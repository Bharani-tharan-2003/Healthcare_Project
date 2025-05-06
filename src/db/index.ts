import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { Logger } from '../lib/logger.js'
import { PerformanceMonitor } from '../lib/performance.js'

const logger = Logger.getInstance()
const performanceMonitor = PerformanceMonitor.getInstance()

class Database {
  private static instance: Database
  private pool: Pool | null = null
  private db: ReturnType<typeof drizzle> | null = null

  private constructor() {
    performanceMonitor.setThreshold('database_operation', 1000)
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  async connect(): Promise<void> {
    if (this.pool) return

    const endMeasurement = performanceMonitor.start('database_connection')
    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/healthcare',
        max: 10,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      })

      this.db = drizzle(this.pool)

      this.pool.on('error', (err) => {
        logger.error('Database pool error:', err)
      })

      this.pool.on('connect', () => {
        logger.info('New database connection established')
      })

      endMeasurement()
      logger.info('Database connected successfully')
    } catch (error) {
      endMeasurement()
      logger.error('Failed to connect to database:', error as Error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (!this.pool) return

    const endMeasurement = performanceMonitor.start('database_disconnection')
    try {
      await this.pool.end()
      this.pool = null
      this.db = null
      endMeasurement()
      logger.info('Database disconnected successfully')
    } catch (error) {
      endMeasurement()
      logger.error('Error disconnecting from database:', error as Error)
      throw error
    }
  }

  getDb(): ReturnType<typeof drizzle> {
    if (!this.db) {
      throw new Error('Database not connected')
    }
    return this.db
  }
}

export default Database.getInstance() 