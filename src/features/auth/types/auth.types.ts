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

export interface ResetPasswordPayload {
  email?: string;
  otp: string;
  new_password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApiMessageResponse {
  success?: boolean;
  message: string;
}

export type AuthField =
  | "full_name"
  | "email"
  | "password"
  | "confirmPassword"
  | "otp"
  | "general";

export type AuthFieldErrors = Partial<Record<AuthField, string>>;