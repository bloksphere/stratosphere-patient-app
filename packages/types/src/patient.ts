export interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  nhsNumber?: string;
  mfaEnabled: boolean;
  status: 'pending_verification' | 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface PatientProfile extends Omit<Patient, 'status' | 'createdAt' | 'updatedAt' | 'lastLoginAt'> {
  dateOfBirth?: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
}
