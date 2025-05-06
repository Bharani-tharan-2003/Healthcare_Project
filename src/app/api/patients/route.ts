import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Patient from '@/models/Patient'

export async function GET() {
  try {
    await dbConnect()
    const patients = await Patient.find({}).sort({ createdAt: -1 })
    return NextResponse.json(patients)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching patients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const body = await request.json()
    const patient = await Patient.create(body)
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating patient' }, { status: 500 })
  }
} 