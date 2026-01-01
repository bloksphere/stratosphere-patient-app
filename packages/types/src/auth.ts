export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptGdpr: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: import('./patient').Patient | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
