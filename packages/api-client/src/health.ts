import { apiClient } from './client';
import type { 
  HealthMeasurement, 
  CreateMeasurementRequest, 
  Symptom, 
  CreateSymptomRequest,
  HealthSummary 
} from '@stratosphere/types';

export const healthApi = {
  getMeasurements: async (params?: {
    measurementType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ measurements: HealthMeasurement[]; total: number }> => {
    const response = await apiClient.get('/health/measurements', { params });
    return response.data;
  },

  createMeasurement: async (data: CreateMeasurementRequest): Promise<HealthMeasurement> => {
    const response = await apiClient.post('/health/measurements', data);
    return response.data;
  },

  deleteMeasurement: async (id: string): Promise<void> => {
    await apiClient.delete(`/health/measurements/${id}`);
  },

  getSummary: async (): Promise<HealthSummary> => {
    const response = await apiClient.get('/health/summary');
    return response.data;
  },

  getTrends: async (measurementType: string, days: number = 30): Promise<{ data: any[] }> => {
    const response = await apiClient.get('/health/trends', { 
      params: { measurement_type: measurementType, days } 
    });
    return response.data;
  },

  getSymptoms: async (limit: number = 20): Promise<{ symptoms: Symptom[]; total: number }> => {
    const response = await apiClient.get('/health/symptoms', { params: { limit } });
    return response.data;
  },

  createSymptom: async (data: CreateSymptomRequest): Promise<Symptom> => {
    const response = await apiClient.post('/health/symptoms', data);
    return response.data;
  },

  deleteSymptom: async (id: string): Promise<void> => {
    await apiClient.delete(`/health/symptoms/${id}`);
  },
};
