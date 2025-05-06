import { Logger } from './logger'
import { promises as fs } from 'fs'
import path from 'path'

const logger = Logger.getInstance()

export class FileSystem {
  private static instance: FileSystem

  private constructor() {}

  static getInstance(): FileSystem {
    if (!FileSystem.instance) {
      FileSystem.instance = new FileSystem()
    }
    return FileSystem.instance
  }

  async safeDeleteDirectory(dirPath: string): Promise<void> {
    try {
      const exists = await this.directoryExists(dirPath)
      if (!exists) {
        logger.debug(`Directory ${dirPath} does not exist`)
        return
      }

      // On Windows, we need to handle file permissions
      if (process.platform === 'win32') {
        await this.fixWindowsPermissions(dirPath)
      }

      await fs.rm(dirPath, { recursive: true, force: true })
      logger.info(`Successfully deleted directory ${dirPath}`)
    } catch (error) {
      logger.error(`Error deleting directory ${dirPath}:`, error as Error)
      throw error
    }
  }

  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      await fs.access(dirPath)
      return true
    } catch {
      return false
    }
  }

  private async fixWindowsPermissions(dirPath: string): Promise<void> {
    try {
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)

      // Take ownership of the directory
      await execAsync(`takeown /f "${dirPath}" /r /d y`)
      
      // Grant full permissions
      await execAsync(`icacls "${dirPath}" /grant Everyone:F /t`)
      
      logger.debug(`Fixed permissions for ${dirPath}`)
    } catch (error) {
      logger.error(`Error fixing Windows permissions for ${dirPath}:`, error as Error)
      throw error
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true })
      logger.info(`Created directory ${dirPath}`)
    } catch (error) {
      logger.error(`Error creating directory ${dirPath}:`, error as Error)
      throw error
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const dirPath = path.dirname(filePath)
      await this.createDirectory(dirPath)
      await fs.writeFile(filePath, content)
      logger.info(`Wrote file ${filePath}`)
    } catch (error) {
      logger.error(`Error writing file ${filePath}:`, error as Error)
      throw error
    }
  }
} 