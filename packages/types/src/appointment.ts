export type AppointmentType = 'routine' | 'follow_up' | 'urgent' | 'phone' | 'video';
export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment {
  id: string;
  userId: string;
  clinicAppointmentId?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  scheduledAt?: string;
  durationMinutes: number;
  reason?: string;
  notes?: string;
  videoLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  appointmentType: AppointmentType;
  reason?: string;
  preferredDate?: string;
  preferredTime?: 'morning' | 'afternoon' | 'evening';
}

export interface AppointmentSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  appointmentType: AppointmentType;
}
