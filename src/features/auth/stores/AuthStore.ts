import { makeAutoObservable, runInAction } from "mobx";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "../../../services/httpClient";
import {
  forgotPasswordApi,
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi,
  resetPasswordApi,
  verifyOtpApi,
} from "../services/authApi";
import type {
  AuthField,
  AuthFieldErrors,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "../types/auth.types";

const RESET_EMAIL_KEY = "cardly_reset_email";
const REFRESH_TOKEN_KEY = "cardly_refresh_token";
const LOGIN_FAILED_COUNT_KEY = "cardly_login_failed_count";
const LOGIN_LOCKED_UNTIL_KEY = "cardly_login_locked_until";

class AuthStore {
  user: AuthUser | null = null;
  token: string | null = null;
  refreshToken: string | null = null;

  resetEmail = "";

  isLoading = false;
  isCheckingSession = false;

  error = "";
  success = "";
  fieldErrors: AuthFieldErrors = {};

  failedLoginCount = 0;
  loginLockedUntil = 0;

  constructor() {
    makeAutoObservable(this);

    this.token = getAccessToken();
    this.refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    this.resetEmail = sessionStorage.getItem(RESET_EMAIL_KEY) || "";

    this.failedLoginCount = Number(
      localStorage.getItem(LOGIN_FAILED_COUNT_KEY) || 0
    );

    this.loginLockedUntil = Number(
      localStorage.getItem(LOGIN_LOCKED_UNTIL_KEY) || 0
    );
  }

  get isAuthenticated() {
    return Boolean(this.token && this.user);
  }

  get loginLockRemainingSeconds() {
    const remaining = Math.ceil((this.loginLockedUntil - Date.now()) / 1000);
    return Math.max(remaining, 0);
  }

  get isLoginLocked() {
    return this.loginLockRemainingSeconds > 0;
  }

  clearMessages() {
    this.error = "";
    this.success = "";
    this.fieldErrors = {};
  }

  setFieldError(field: AuthField, message: string) {
    this.fieldErrors = {
      ...this.fieldErrors,
      [field]: message,
    };

    if (field === "general") {
      this.error = message;
    }
  }

  setFieldErrors(errors: AuthFieldErrors) {
    this.fieldErrors = errors;
    this.error = errors.general || "";
  }

  clearFieldError(field: AuthField) {
    const nextErrors = { ...this.fieldErrors };
    delete nextErrors[field];

    this.fieldErrors = nextErrors;

    if (field === "general") {
      this.error = "";
    }
  }

  setResetEmail(email: string) {
    this.resetEmail = email.trim().toLowerCase();
    sessionStorage.setItem(RESET_EMAIL_KEY, this.resetEmail);
  }

  clearResetEmail() {
    this.resetEmail = "";
    sessionStorage.removeItem(RESET_EMAIL_KEY);
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    this.refreshToken = refreshToken;

    setAccessToken(accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private clearTokens() {
    this.token = null;
    this.refreshToken = null;

    removeAccessToken();
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private resetFailedLoginAttempts() {
    this.failedLoginCount = 0;
    this.loginLockedUntil = 0;

    localStorage.removeItem(LOGIN_FAILED_COUNT_KEY);
    localStorage.removeItem(LOGIN_LOCKED_UNTIL_KEY);
  }

  private increaseFailedLoginAttempts() {
    const nextCount = this.failedLoginCount + 1;

    this.failedLoginCount = nextCount;
    localStorage.setItem(LOGIN_FAILED_COUNT_KEY, String(nextCount));

    if (nextCount >= 5) {
      const lockedUntil = Date.now() + 60 * 1000;
      this.loginLockedUntil = lockedUntil;
      localStorage.setItem(LOGIN_LOCKED_UNTIL_KEY, String(lockedUntil));
    }
  }

  private mapLoginError(message: string) {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("not verified") ||
      lowerMessage.includes("verify") ||
      lowerMessage.includes("verification") ||
      lowerMessage.includes("inactive") ||
      lowerMessage.includes("disabled")
    ) {
      this.setFieldError("general", message);
      return;
    }

    if (
      lowerMessage.includes("not found") ||
      lowerMessage.includes("not registered") ||
      lowerMessage.includes("does not exist") ||
      lowerMessage.includes("no account")
    ) {
      this.setFieldError("email", "This email address has not been registered.");
      return;
    }

    if (
      lowerMessage.includes("password") ||
      lowerMessage.includes("credential") ||
      lowerMessage.includes("invalid") ||
      lowerMessage.includes("unauthorized") ||
      lowerMessage.includes("forbidden")
    ) {
      this.setFieldError("password", "Wrong password.");
      return;
    }

    this.setFieldError("general", message);
  }

  private mapRegisterError(message: string) {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("full_name") ||
      lowerMessage.includes("full name") ||
      lowerMessage.includes("name")
    ) {
      this.setFieldError("full_name", "Full name is required.");
      return;
    }

    if (
      lowerMessage.includes("user_already_exists") ||
      lowerMessage.includes("already exists") ||
      lowerMessage.includes("already registered") ||
      lowerMessage.includes("registered") ||
      lowerMessage.includes("exist")
    ) {
      this.setFieldError(
        "email",
        "This email address has already been registered."
      );
      return;
    }

    if (
      lowerMessage.includes("email") &&
      (lowerMessage.includes("invalid") || lowerMessage.includes("required"))
    ) {
      this.setFieldError("email", message);
      return;
    }

    if (lowerMessage.includes("confirm") || lowerMessage.includes("match")) {
      this.setFieldError(
        "confirmPassword",
        "The verification password does not match."
      );
      return;
    }

    if (lowerMessage.includes("password")) {
      this.setFieldError("password", message);
      return;
    }

    this.setFieldError("general", message);
  }

  async initializeSession() {
    if (!this.token) {
      return false;
    }

    this.isCheckingSession = true;

    try {
      const user = await getCurrentUserApi();

      runInAction(() => {
        this.user = user;
      });

      return true;
    } catch {
      runInAction(() => {
        this.user = null;
        this.clearTokens();
      });

      return false;
    } finally {
      runInAction(() => {
        this.isCheckingSession = false;
      });
    }
  }

  async login(payload: LoginPayload) {
    if (this.isLoginLocked) {
      this.setFieldError(
        "general",
        `Too many failed attempts. Please try again in ${this.loginLockRemainingSeconds}s.`
      );
      return false;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      const loginResponse = await loginApi({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      });

      runInAction(() => {
        this.saveTokens(
          loginResponse.access_token,
          loginResponse.refresh_token
        );
      });

      const user = await getCurrentUserApi();

      runInAction(() => {
        this.user = user;
        this.success = "Login successful.";
        this.resetFailedLoginAttempts();
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.user = null;
        this.clearTokens();

        const message =
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.";

        this.increaseFailedLoginAttempts();
        this.mapLoginError(message);
      });

      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async register(payload: RegisterPayload) {
    this.isLoading = true;
    this.clearMessages();

    try {
      const response = await registerApi({
        full_name: payload.full_name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        confirmPassword: payload.confirmPassword,
      });

      runInAction(() => {
        this.setResetEmail(payload.email);
        this.success =
          response.message ||
          "Account created. Check your email for the verification OTP.";
      });

      return true;
    } catch (error) {
      runInAction(() => {
        const message =
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.";

        this.mapRegisterError(message);
      });

      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async sendOtp(email: string) {
    this.isLoading = true;
    this.clearMessages();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const response = await forgotPasswordApi({
        email: normalizedEmail,
      });

      runInAction(() => {
        this.setResetEmail(normalizedEmail);
        this.success =
          response.message || "The OTP code has been sent, valid for 5 minutes.";
      });

      return true;
    } catch (error) {
      runInAction(() => {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to send OTP. Please try again.";

        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes("email") ||
          lowerMessage.includes("registered") ||
          lowerMessage.includes("not found")
        ) {
          this.setFieldError(
            "email",
            "This email address has not been registered."
          );
          return;
        }

        this.setFieldError("general", message);
      });

      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async verifyOtp(otp: string) {
    this.isLoading = true;
    this.clearMessages();

    try {
      const response = await verifyOtpApi({
        email: this.resetEmail,
        otp,
      });

      runInAction(() => {
        this.success = response.message || "OTP verified successfully.";
      });

      return true;
    } catch (error) {
      runInAction(() => {
        const message =
          error instanceof Error
            ? error.message
            : "OTP verification failed. Please try again.";

        if (message.toLowerCase().includes("expired")) {
          this.setFieldError("otp", "OTP code has expired");
        } else {
          this.setFieldError("otp", "Incorrect OTP code");
        }
      });

      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async resetPassword(payload: ResetPasswordPayload) {
    this.isLoading = true;
    this.clearMessages();

    try {
      const response = await resetPasswordApi({
  email: this.resetEmail,
  otp: payload.otp,
  new_password: payload.new_password,
  confirmPassword: payload.confirmPassword,
});

      runInAction(() => {
        this.success =
          response.message || "Password has been successfully reset.";
        this.clearResetEmail();
      });

      return true;
    } catch (error) {
      runInAction(() => {
        const message =
          error instanceof Error
            ? error.message
            : "Reset password failed. Please try again.";

        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes("same") ||
          lowerMessage.includes("old") ||
          lowerMessage.includes("current")
        ) {
          this.setFieldError(
            "password",
            "The new password must not be the same as the old password."
          );
          return;
        }

        if (lowerMessage.includes("confirm") || lowerMessage.includes("match")) {
          this.setFieldError(
            "confirmPassword",
            "The verification password does not match."
          );
          return;
        }

        if (lowerMessage.includes("password")) {
          this.setFieldError("password", message);
          return;
        }

        this.setFieldError("general", message);
      });

      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async logout() {
    this.user = null;
    this.clearTokens();
    this.clearResetEmail();
    this.clearMessages();

    try {
      await logoutApi();
    } catch {
      // Không chặn logout UI nếu API logout lỗi.
    }
  }
}

export const authStore = new AuthStore();