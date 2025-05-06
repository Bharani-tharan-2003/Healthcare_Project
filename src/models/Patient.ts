import mongoose from 'mongoose'

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  age: {
    type: Number,
    required: [true, 'Please provide an age'],
    min: [0, 'Age cannot be negative'],
  },
  gender: {
    type: String,
    required: [true, 'Please provide a gender'],
    enum: ['male', 'female', 'other'],
  },
  medicalHistory: [{
    condition: String,
    diagnosisDate: Date,
    treatment: String,
  }],
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    lastUpdated: Date,
  },
  riskFactors: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema) 