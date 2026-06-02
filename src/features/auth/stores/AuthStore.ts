import { makeAutoObservable, runInAction } from "mobx";
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
const LOGIN_FAILED_COUNT_KEY = "cardly_login_failed_count";
const LOGIN_LOCKED_UNTIL_KEY = "cardly_login_locked_until";

class AuthStore {
  user: AuthUser | null = null;
  token: string | null = null;

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

    this.resetEmail = sessionStorage.getItem(RESET_EMAIL_KEY) || "";
    this.failedLoginCount = Number(
      localStorage.getItem(LOGIN_FAILED_COUNT_KEY) || 0
    );
    this.loginLockedUntil = Number(
      localStorage.getItem(LOGIN_LOCKED_UNTIL_KEY) || 0
    );
  }

  get isAuthenticated() {
    return Boolean(this.user);
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

  async initializeSession() {
    this.isCheckingSession = true;

    try {
      const response = await getCurrentUserApi();

      runInAction(() => {
        this.user = response.user;
        this.token = response.token || null;
      });

      return true;
    } catch {
      runInAction(() => {
        this.user = null;
        this.token = null;
      });

      return false;
    } finally {
      runInAction(() => {
        this.isCheckingSession = false;
      });
    }
  }

  private mapLoginError(message: string) {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("email") ||
      lowerMessage.includes("account") ||
      lowerMessage.includes("not found") ||
      lowerMessage.includes("not registered")
    ) {
      this.setFieldError("email", "Wrong email");
      return;
    }

    if (
      lowerMessage.includes("password") ||
      lowerMessage.includes("credential")
    ) {
      this.setFieldError("password", "Wrong password");
      return;
    }

    this.setFieldError("general", message);
  }

  private mapRegisterError(message: string) {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("email") ||
      lowerMessage.includes("registered") ||
      lowerMessage.includes("exist")
    ) {
      this.setFieldError(
        "email",
        "This email address has already been registered."
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
      const response = await loginApi({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      });

      runInAction(() => {
        this.user = response.user;
        this.token = response.token || null;
        this.success = response.message || "Login successful.";
        this.resetFailedLoginAttempts();
      });

      return true;
    } catch (error) {
      runInAction(() => {
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
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      confirmPassword: payload.confirmPassword,
    });

    runInAction(() => {
      this.success =
        response.message || "Check your email to confirm your account.";
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
        password: payload.password,
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
    this.token = null;
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