import PatientForm from '@/components/PatientForm'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Predictive Healthcare System
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Add New Patient</h2>
          <PatientForm />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-primary-700">Total Patients</h3>
                <p className="text-2xl font-bold text-primary-600">Loading...</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-700">Active Cases</h3>
                <p className="text-2xl font-bold text-green-600">Loading...</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-700">High Risk Patients</h3>
              <p className="text-2xl font-bold text-yellow-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Analytics Dashboard</h2>
        <AnalyticsDashboard />
      </div>
    </div>
  )
} 