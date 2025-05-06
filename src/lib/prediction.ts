import * as tf from '@tensorflow/tfjs'

interface PatientData {
  age: number
  bloodPressure: string
  heartRate: number
  temperature: number
  riskFactors: string[]
}

export class DiseasePredictor {
  private model: tf.LayersModel | null = null

  async loadModel() {
    if (!this.model) {
      // In a real application, you would load a pre-trained model
      // For now, we'll create a simple model for demonstration
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [4], units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      })
      
      this.model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      })
    }
  }

  preprocessData(data: PatientData) {
    // Convert blood pressure string to systolic and diastolic
    const [systolic, diastolic] = data.bloodPressure.split('/').map(Number)
    
    // Count risk factors
    const riskFactorCount = data.riskFactors.length
    
    // Normalize values
    return tf.tensor2d([[
      data.age / 100, // Normalize age
      systolic / 200, // Normalize systolic
      diastolic / 120, // Normalize diastolic
      data.heartRate / 200, // Normalize heart rate
      data.temperature / 42, // Normalize temperature
      riskFactorCount / 10 // Normalize risk factors
    ]])
  }

  async predictRisk(data: PatientData): Promise<number> {
    await this.loadModel()
    const input = this.preprocessData(data)
    const prediction = this.model!.predict(input) as tf.Tensor
    const risk = await prediction.data()
    return risk[0]
  }

  interpretRisk(risk: number): string {
    if (risk < 0.3) return 'Low Risk'
    if (risk < 0.6) return 'Medium Risk'
    return 'High Risk'
  }
} 