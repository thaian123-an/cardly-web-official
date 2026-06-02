export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  mobileNumber?: string;
  initials?: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
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
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
  message?: string;
}

export interface ApiMessageResponse {
  message: string;
}

export type AuthField =
  | "email"
  | "password"
  | "confirmPassword"
  | "otp"
  | "general";

export type AuthFieldErrors = Partial<Record<AuthField, string>>;