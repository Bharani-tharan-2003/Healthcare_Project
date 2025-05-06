import { NextResponse } from 'next/server'
import { performanceMiddleware } from '@/middleware/performance.js'
import { PerformanceMonitor } from '@/lib/performance.js'
import { QueryOptimizer } from '@/lib/queryOptimizer.js'
import db from '@/lib/db.js'
import Patient from '@/models/Patient.js'

const performanceMonitor = PerformanceMonitor.getInstance()
const queryOptimizer = QueryOptimizer.getInstance()

// Set performance thresholds
performanceMonitor.setThreshold('GET /api/analytics', 1000) // 1 second threshold

export const GET = performanceMiddleware(async () => {
  try {
    await db.connect()

    // Use query optimizer for patient data
    const patients = await queryOptimizer.optimizeQuery(
      'all_patients',
      async () => {
        return await Patient.find({})
          .select('age vitalSigns riskFactors createdAt')
          .lean()
      },
      { useCache: true, maxAge: 5 * 60 * 1000 } // Cache for 5 minutes
    )

    // Calculate analytics
    const analytics = await queryOptimizer.optimizeQuery(
      'analytics_calculation',
      async () => {
        const totalPatients = patients.length
        const averageAge = patients.reduce((sum, p) => sum + p.age, 0) / totalPatients

        const riskDistribution = { low: 0, medium: 0, high: 0 }
        for (const patient of patients) {
          const risk = patient.riskFactors?.length || 0
          if (risk <= 2) riskDistribution.low++
          else if (risk <= 4) riskDistribution.medium++
          else riskDistribution.high++
        }

        const vitalSignsTrends = {
          labels: patients.map(p => new Date(p.createdAt).toLocaleDateString()),
          bloodPressure: patients.map(p => p.vitalSigns.bloodPressure),
          heartRate: patients.map(p => p.vitalSigns.heartRate),
          temperature: patients.map(p => p.vitalSigns.temperature),
        }

        return {
          totalPatients,
          averageAge,
          riskDistribution,
          vitalSignsTrends,
        }
      }
    )

    const metrics = performanceMonitor.getMetrics('GET /api/analytics')
    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        performanceMetrics: metrics,
        queryCacheStats: queryOptimizer.getCacheStats()
      }
    })
  } catch (error) {
    const metrics = performanceMonitor.getMetrics('GET /api/analytics')
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error calculating analytics',
        performanceMetrics: metrics,
        queryCacheStats: queryOptimizer.getCacheStats()
      },
      { status: 500 }
    )
  }
}) 