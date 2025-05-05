export interface User {
  id?: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerificationRequest {
  email: string;
  otpCode: string;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OtpSetupRequest {
  email: string;
  otpCode: string;
  token: string;
}

export interface RecoveryPasswordRequest {
  name: string;
  additionalInfo: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
  requiresMfa: boolean;
  qrCodeUrl?: string;
  message?: string;
}
