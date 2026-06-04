export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  reset_token: string;
  new_password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface MessageResponse {
  success?: boolean;
  message?: string;
}

export interface VerifyResetOtpResponse {
  success?: boolean;
  message?: string;
  reset_token: string;
}

export type AuthField =
  | "full_name"
  | "email"
  | "password"
  | "confirmPassword"
  | "otp"
  | "general";

export type AuthFieldErrors = Partial<Record<AuthField, string>>;