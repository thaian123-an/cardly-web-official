import { api } from "../../../services/httpClient";
import type {
  ApiMessageResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
} from "../types/auth.types";

export function loginApi(payload: LoginPayload) {
  return api.post<LoginResponse>("/auth/login", payload, {
    skipAuth: true,
  });
}

export function registerApi(payload: RegisterPayload) {
  return api.post<ApiMessageResponse>("/auth/register", payload, {
    skipAuth: true,
  });
}

export function verifyOtpApi(payload: VerifyOtpPayload) {
  return api.post<ApiMessageResponse>("/auth/verify-otp", payload, {
    skipAuth: true,
  });
}

export function forgotPasswordApi(payload: ForgotPasswordPayload) {
  return api.post<ApiMessageResponse>("/auth/forgot-password", payload, {
    skipAuth: true,
  });
}

export function resetPasswordApi(payload: ResetPasswordPayload) {
  return api.post<ApiMessageResponse>("/auth/reset-password", payload, {
    skipAuth: true,
  });
}

export function getCurrentUserApi() {
  return api.get<AuthUser>("/auth/me");
}

export function logoutApi() {
  return api.post<ApiMessageResponse>("/auth/logout");
}