import { useEffect, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface PatientStats {
  totalPatients: number
  averageAge: number
  riskDistribution: {
    low: number
    medium: number
    high: number
  }
  vitalSignsTrends: {
    labels: string[]
    bloodPressure: number[]
    heartRate: number[]
    temperature: number[]
  }
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<PatientStats>({
    totalPatients: 0,
    averageAge: 0,
    riskDistribution: { low: 0, medium: 0, high: 0 },
    vitalSignsTrends: {
      labels: [],
      bloodPressure: [],
      heartRate: [],
      temperature: [],
    },
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      }
    }

    fetchStats()
  }, [])

  const riskDistributionData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        label: 'Risk Distribution',
        data: [
          stats.riskDistribution.low,
          stats.riskDistribution.medium,
          stats.riskDistribution.high,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  }

  const vitalSignsData = {
    labels: stats.vitalSignsTrends.labels,
    datasets: [
      {
        label: 'Blood Pressure',
        data: stats.vitalSignsTrends.bloodPressure,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Heart Rate',
        data: stats.vitalSignsTrends.heartRate,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Temperature',
        data: stats.vitalSignsTrends.temperature,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Patients</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Average Age</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.averageAge.toFixed(1)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">High Risk Patients</h3>
          <p className="text-3xl font-bold text-red-600">{stats.riskDistribution.high}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Risk Distribution</h3>
          <Bar data={riskDistributionData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Vital Signs Trends</h3>
          <Line data={vitalSignsData} />
        </div>
      </div>
    </div>
  )
} 