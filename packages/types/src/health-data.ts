export type MeasurementType = 
  | 'blood_pressure'
  | 'glucose'
  | 'weight'
  | 'heart_rate'
  | 'temperature'
  | 'oxygen_saturation';

export interface HealthMeasurement {
  id: string;
  userId: string;
  measurementType: MeasurementType;
  valuePrimary: number;
  valueSecondary?: number;
  unit: string;
  measuredAt: string;
  notes?: string;
  source: 'manual' | 'device_sync' | 'imported';
  syncedToClinic: boolean;
  createdAt: string;
}

export interface CreateMeasurementRequest {
  measurementType: MeasurementType;
  valuePrimary: number;
  valueSecondary?: number;
  unit: string;
  measuredAt: string;
  notes?: string;
}

export interface Symptom {
  id: string;
  userId: string;
  symptomType: string;
  severity?: number; // 1-10
  durationMinutes?: number;
  notes?: string;
  reportedAt: string;
  createdAt: string;
}

export interface CreateSymptomRequest {
  symptomType: string;
  severity?: number;
  durationMinutes?: number;
  notes?: string;
  reportedAt: string;
}

export interface HealthSummary {
  latestBloodPressure?: {
    systolic: number;
    diastolic: number;
    measuredAt: string;
  };
  latestGlucose?: {
    value: number;
    unit: string;
    measuredAt: string;
  };
  latestWeight?: {
    value: number;
    unit: string;
    measuredAt: string;
  };
}
