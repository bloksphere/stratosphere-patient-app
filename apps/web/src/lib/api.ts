import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          // Store new tokens
          Cookies.set('access_token', access_token, { sameSite: 'lax' });
          Cookies.set('refresh_token', refresh_token, { sameSite: 'lax' });

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// API response types
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  mfa_code?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  requires_mfa: boolean;
  email_verified: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

// User types
export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  phone?: string;
  phone_verified: boolean;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nhs_number?: string;
  status: string;
  mfa_enabled: boolean;
  gdpr_consent_date?: string;
  data_processing_consent: boolean;
  marketing_consent: boolean;
  created_at: string;
  last_login_at?: string;
}

// Health types
export interface HealthMeasurement {
  id: string;
  measurement_type: string;
  value_primary: number;
  value_secondary?: number;
  unit: string;
  measured_at: string;
  notes?: string;
  source: string;
  synced_to_clinic: boolean;
  created_at: string;
}

export interface HealthSummary {
  latest_blood_pressure?: {
    value: number;
    value_secondary?: number;
    unit: string;
    measured_at: string;
  };
  latest_glucose?: {
    value: number;
    unit: string;
    measured_at: string;
  };
  latest_weight?: {
    value: number;
    unit: string;
    measured_at: string;
  };
  latest_heart_rate?: {
    value: number;
    unit: string;
    measured_at: string;
  };
  recent_symptoms: Symptom[];
  alerts: string[];
  next_recommended_measurements: string[];
}

export interface Symptom {
  id: string;
  symptom_type: string;
  severity?: number;
  duration_minutes?: number;
  notes?: string;
  reported_at: string;
  synced_to_clinic: boolean;
  created_at: string;
}

// Appointment types
export interface Appointment {
  id: string;
  appointment_type: string;
  status: string;
  scheduled_at?: string;
  duration_minutes: number;
  reason?: string;
  notes?: string;
  video_link?: string;
  created_at: string;
  updated_at: string;
}

// Message types
export interface Message {
  id: string;
  direction: string;
  subject: string;
  body: string;
  status: string;
  read_at?: string;
  has_attachments: boolean;
  attachments: MessageAttachment[];
  created_at: string;
}

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface MessageThread {
  thread_id: string;
  subject: string;
  last_message_at: string;
  unread_count: number;
  messages: Message[];
}

// Medication types
export interface Medication {
  id: string;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
  started_at?: string;
  ended_at?: string;
  is_active: boolean;
  reminder_enabled: boolean;
  reminder_times?: string[];
  synced_from_clinic: boolean;
  created_at: string;
  updated_at: string;
}

// API functions
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<{ success: boolean; message: string }>('/auth/register', data),

  logout: () =>
    api.post<{ success: boolean; message: string }>('/auth/logout'),

  refresh: (refreshToken: string) =>
    api.post<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    }),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ success: boolean; message: string }>('/auth/reset-password', {
      token,
      new_password: newPassword,
    }),
};

export const userApi = {
  getProfile: () =>
    api.get<User>('/users/me'),

  updateProfile: (data: Partial<User>) =>
    api.put<User>('/users/me', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ success: boolean; message: string }>('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  linkNhs: (nhsNumber: string, dateOfBirth: string) =>
    api.post<{ success: boolean; message: string }>('/users/me/link-nhs', {
      nhs_number: nhsNumber,
      date_of_birth: dateOfBirth,
    }),

  deleteAccount: () =>
    api.delete<{ success: boolean; message: string }>('/users/me'),
};

export const healthApi = {
  getMeasurements: (params?: {
    measurement_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    size?: number;
  }) =>
    api.get<PaginatedResponse<HealthMeasurement>>('/health/measurements', { params }),

  createMeasurement: (data: {
    measurement_type: string;
    value_primary: number;
    value_secondary?: number;
    unit: string;
    measured_at: string;
    notes?: string;
    source?: string;
  }) =>
    api.post<HealthMeasurement>('/health/measurements', data),

  getSummary: () =>
    api.get<HealthSummary>('/health/summary'),

  getTrends: (measurementType: string, days?: number) =>
    api.get(`/health/trends/${measurementType}`, { params: { days } }),

  getSymptoms: (params?: { page?: number; size?: number }) =>
    api.get<PaginatedResponse<Symptom>>('/health/symptoms', { params }),

  createSymptom: (data: {
    symptom_type: string;
    severity?: number;
    duration_minutes?: number;
    notes?: string;
    reported_at: string;
  }) =>
    api.post<Symptom>('/health/symptoms', data),
};

export const appointmentApi = {
  getAppointments: (params?: {
    status_filter?: string;
    upcoming_only?: boolean;
    page?: number;
    size?: number;
  }) =>
    api.get<PaginatedResponse<Appointment>>('/appointments', { params }),

  createAppointment: (data: {
    appointment_type: string;
    preferred_date?: string;
    reason: string;
    notes?: string;
  }) =>
    api.post<Appointment>('/appointments', data),

  getAvailableSlots: (startDate: string, appointmentType?: string) =>
    api.get('/appointments/available-slots', {
      params: { start_date: startDate, appointment_type: appointmentType },
    }),

  cancelAppointment: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/appointments/${id}`),
};

export const messageApi = {
  getThreads: (params?: { page?: number; size?: number }) =>
    api.get<PaginatedResponse<MessageThread>>('/messages', { params }),

  getThread: (id: string) =>
    api.get<MessageThread>(`/messages/${id}`),

  sendMessage: (data: { subject: string; body: string; parent_message_id?: string }) =>
    api.post<Message>('/messages', data),

  replyToMessage: (id: string, data: { subject: string; body: string }) =>
    api.post<Message>(`/messages/${id}/reply`, data),

  markAsRead: (id: string) =>
    api.put<{ success: boolean; message: string }>(`/messages/${id}/read`),
};

export const medicationApi = {
  getMedications: (activeOnly?: boolean) =>
    api.get<Medication[]>('/medications', { params: { active_only: activeOnly } }),

  createMedication: (data: {
    medication_name: string;
    dosage?: string;
    frequency?: string;
    instructions?: string;
    started_at?: string;
    reminder_enabled?: boolean;
    reminder_times?: string[];
  }) =>
    api.post<Medication>('/medications', data),

  updateMedication: (id: string, data: Partial<Medication>) =>
    api.put<Medication>(`/medications/${id}`, data),

  deleteMedication: (id: string) =>
    api.delete(`/medications/${id}`),

  logTaken: (id: string, takenAt?: string) =>
    api.post(`/medications/${id}/taken`, { taken_at: takenAt }),

  logSkipped: (id: string, reason?: string) =>
    api.post(`/medications/${id}/skipped`, { skipped: true, skip_reason: reason }),
};

export const gdprApi = {
  getConsents: () =>
    api.get('/gdpr/consents'),

  updateConsents: (data: { data_processing_consent?: boolean; marketing_consent?: boolean }) =>
    api.post<{ success: boolean; message: string }>('/gdpr/consents', data),

  requestDataExport: () =>
    api.post('/gdpr/data-export', {
      include_health_data: true,
      include_messages: true,
      include_appointments: true,
      include_documents: true,
      format: 'json',
    }),

  getAuditLog: (params?: { page?: number; size?: number }) =>
    api.get('/gdpr/audit-log', { params }),

  requestDeletion: (email: string, reason?: string) =>
    api.post<{ success: boolean; message: string }>('/gdpr/data-delete', {
      confirm_email: email,
      reason,
      confirm_deletion: true,
    }),
};

export default api;
