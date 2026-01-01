import { z } from 'zod';

export const bloodPressureSchema = z.object({
  systolic: z.number().min(60).max(250),
  diastolic: z.number().min(40).max(150),
  measuredAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const glucoseSchema = z.object({
  value: z.number().min(20).max(600),
  unit: z.enum(['mg/dL', 'mmol/L']),
  measuredAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const weightSchema = z.object({
  value: z.number().min(20).max(500),
  unit: z.enum(['kg', 'lb']),
  measuredAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const symptomSchema = z.object({
  symptomType: z.string().min(1).max(100),
  severity: z.number().min(1).max(10).optional(),
  durationMinutes: z.number().min(1).optional(),
  notes: z.string().max(1000).optional(),
  reportedAt: z.string().datetime(),
});

export type BloodPressureInput = z.infer<typeof bloodPressureSchema>;
export type GlucoseInput = z.infer<typeof glucoseSchema>;
export type WeightInput = z.infer<typeof weightSchema>;
export type SymptomInput = z.infer<typeof symptomSchema>;
