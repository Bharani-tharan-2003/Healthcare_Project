import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Patient table
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(),
  vitalSigns: jsonb('vital_signs').notNull(),
  riskFactors: jsonb('risk_factors').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Analytics cache table
export const analyticsCache = pgTable('analytics_cache', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Zod schemas for type safety
export const insertPatientSchema = createInsertSchema(patients, {
  vitalSigns: z.object({
    bloodPressure: z.string(),
    heartRate: z.number(),
    temperature: z.number()
  }),
  riskFactors: z.array(z.string())
})

export const selectPatientSchema = createSelectSchema(patients)

// Types
export type Patient = typeof patients.$inferSelect
export type NewPatient = typeof patients.$inferInsert
export type AnalyticsCache = typeof analyticsCache.$inferSelect
export type NewAnalyticsCache = typeof analyticsCache.$inferInsert 