import { apiClient } from './client';
import type { Appointment, CreateAppointmentRequest, AppointmentSlot } from '@stratosphere/types';

export const appointmentsApi = {
  getAppointments: async (params?: { status?: string; limit?: number }): Promise<{ 
    appointments: Appointment[]; 
    total: number 
  }> => {
    const response = await apiClient.get('/appointments', { params });
    return response.data;
  },

  createAppointment: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  },

  getAppointment: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  },

  updateAppointment: async (id: string, data: { scheduledAt?: string }): Promise<Appointment> => {
    const response = await apiClient.put(`/appointments/${id}`, data);
    return response.data;
  },

  cancelAppointment: async (id: string): Promise<void> => {
    await apiClient.delete(`/appointments/${id}`);
  },

  getAvailableSlots: async (params: { 
    startDate: string; 
    endDate?: string; 
    appointmentType?: string 
  }): Promise<{ slots: AppointmentSlot[] }> => {
    const response = await apiClient.get('/appointments/available-slots', { params });
    return response.data;
  },
};
