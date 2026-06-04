import { api } from "../../../services/httpClient";
import type {
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  MessageResponse,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
  VerifyResetOtpPayload,
  VerifyResetOtpResponse,
} from "../types/auth.types";

export function registerApi(payload: RegisterPayload) {
  return api.post<MessageResponse>("/auth/register", payload, {
    skipAuth: true,
  });
}

export function verifyOtpApi(payload: VerifyOtpPayload) {
  return api.post<MessageResponse>("/auth/verify-otp", payload, {
    skipAuth: true,
  });
}

export function loginApi(payload: LoginPayload) {
  return api.post<LoginResponse>("/auth/login", payload, {
    skipAuth: true,
  });
}

export function refreshTokenApi(refreshToken: string) {
  return api.post<LoginResponse>(
    "/auth/refresh",
    {
      refresh_token: refreshToken,
    },
    {
      skipAuth: true,
    }
  );
}

export function getCurrentUserApi() {
  return api.get<AuthUser>("/auth/me");
}

export function forgotPasswordApi(payload: ForgotPasswordPayload) {
  return api.post<MessageResponse>("/auth/forgot-password", payload, {
    skipAuth: true,
  });
}

export function verifyResetOtpApi(payload: VerifyResetOtpPayload) {
  return api.post<VerifyResetOtpResponse>("/auth/verify-reset-otp", payload, {
    skipAuth: true,
  });
}

export function resetPasswordApi(payload: ResetPasswordPayload) {
  return api.post<MessageResponse>("/auth/reset-password", payload, {
    skipAuth: true,
  });
}

export function logoutApi(refreshToken?: string | null) {
  return api.post<MessageResponse>("/auth/logout", {
    refresh_token: refreshToken,
  });
}