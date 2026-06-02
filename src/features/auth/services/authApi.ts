import { api } from "../../../services/httpClient";
import type {
  ApiMessageResponse,
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from "../types/auth.types";

export function loginApi(payload: LoginPayload) {
  return api.post<AuthResponse>("/auth/login", payload);
}

export function registerApi(payload: RegisterPayload) {
  return api.post<ApiMessageResponse>("/auth/register", payload);
}

export function forgotPasswordApi(payload: ForgotPasswordPayload) {
  return api.post<ApiMessageResponse>("/auth/forgot-password", payload);
}

export function verifyOtpApi(payload: VerifyOtpPayload) {
  return api.post<ApiMessageResponse>("/auth/verify-otp", payload);
}

export function resetPasswordApi(payload: ResetPasswordPayload) {
  return api.post<ApiMessageResponse>("/auth/reset-password", payload);
}

export function getCurrentUserApi() {
  return api.get<AuthResponse>("/auth/me");
}

export function logoutApi() {
  return api.post<ApiMessageResponse>("/auth/logout");
}