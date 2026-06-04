import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "../components/PasswordInput";
import { PasswordRules } from "../components/PasswordRules";
import { authStore } from "../stores/AuthStore";

const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasDigit = (value: string) => /\d/.test(value);
const hasSpecial = (value: string) => /[^A-Za-z0-9]/.test(value);
const hasNoSpace = (value: string) => !/\s/.test(value);

export const ResetPasswordPage = observer(() => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    authStore.clearMessages();

    if (!authStore.resetToken) {
      navigate("/forgot-password", { replace: true });
    }

    return () => {
      authStore.clearMessages();
    };
  }, [navigate]);

  const isPasswordValid = useMemo(() => {
    return (
      newPassword.length >= 8 &&
      hasUppercase(newPassword) &&
      hasDigit(newPassword) &&
      hasSpecial(newPassword) &&
      hasNoSpace(newPassword)
    );
  }, [newPassword]);

  const isSubmitDisabled = useMemo(() => {
    return (
      authStore.isLoading ||
      !newPassword ||
      !confirmPassword ||
      !isPasswordValid ||
      newPassword !== confirmPassword
    );
  }, [newPassword, confirmPassword, isPasswordValid]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    authStore.clearMessages();

    if (!newPassword) {
      authStore.setFieldError("password", "Password is required.");
      return;
    }

    if (!isPasswordValid) {
      authStore.setFieldError(
        "password",
        "Password does not meet security requirements."
      );
      return;
    }

    if (!confirmPassword) {
      authStore.setFieldError(
        "confirmPassword",
        "Please confirm your password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      authStore.setFieldError(
        "confirmPassword",
        "The verification password does not match."
      );
      return;
    }

    const success = await authStore.resetPassword({
      reset_token: authStore.resetToken,
      new_password: newPassword,
      confirmPassword,
    });

    if (success) {
      window.setTimeout(() => {
        authStore.clearMessages();
        navigate("/login", { replace: true });
      }, 1200);
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      description="Set a strong new password after verifying your reset OTP."
      bullets={[
        "Minimum 8 characters",
        "Uppercase, number, and special character",
        "No spaces allowed",
      ]}
    >
      <div className="auth-card">
        <Link to="/forgot-password" className="auth-back-link">
          ←
        </Link>

        <h2>Reset Password</h2>
        <p className="auth-card__subtitle">
          Enter your new password to complete account recovery.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <PasswordInput
            placeholder="New Password"
            value={newPassword}
            error={authStore.fieldErrors.password}
            onChange={(event) => {
              setNewPassword(event.target.value);
              authStore.clearFieldError("password");
            }}
            autoComplete="new-password"
          />

          <PasswordRules password={newPassword} />

          <PasswordInput
            placeholder="Confirm Password"
            value={confirmPassword}
            error={authStore.fieldErrors.confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              authStore.clearFieldError("confirmPassword");
            }}
            autoComplete="new-password"
          />

          {authStore.fieldErrors.general ? (
            <p className="auth-message auth-message--error">
              {authStore.fieldErrors.general}
            </p>
          ) : null}

          {authStore.success ? (
            <p className="auth-message auth-message--success">
              {authStore.success}
            </p>
          ) : null}

          <button
            type="submit"
            className="auth-primary-button"
            disabled={isSubmitDisabled}
          >
            {authStore.isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="auth-switch">
          Remember password? <Link to="/login">Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
});