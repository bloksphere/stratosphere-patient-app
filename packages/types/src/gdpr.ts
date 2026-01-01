export type ConsentType = 
  | 'terms_of_service'
  | 'privacy_policy'
  | 'data_processing'
  | 'marketing'
  | 'research';

export interface ConsentRecord {
  type: ConsentType;
  version: string;
  granted: boolean;
  grantedAt?: string;
  withdrawnAt?: string;
}

export interface UpdateConsentRequest {
  consentType: ConsentType;
  granted: boolean;
}

export type DataRequestType = 'export' | 'delete' | 'rectify';
export type DataRequestStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface DataRequest {
  id: string;
  requestType: DataRequestType;
  status: DataRequestStatus;
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  downloadExpiresAt?: string;
}
