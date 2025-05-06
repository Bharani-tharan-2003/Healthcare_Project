import { NextResponse } from 'next/server'
import { PerformanceMonitor } from '../lib/performance'

const performanceMonitor = PerformanceMonitor.getInstance()

export function performanceMiddleware(handler: Function) {
  return async function (request: Request, ...args: any[]) {
    const operation = `${request.method} ${new URL(request.url).pathname}`
    const endMeasurement = performanceMonitor.start(operation)

    try {
      const response = await handler(request, ...args)
      endMeasurement()
      return response
    } catch (error) {
      endMeasurement()
      throw error
    }
  }
}

// Example usage in API routes:
// export const GET = performanceMiddleware(async (request: Request) => {
//   // Your API logic here
//   return NextResponse.json({ message: 'Success' })
// }) 