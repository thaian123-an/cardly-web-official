import { observer } from "mobx-react-lite";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "../components/PasswordInput";
import { PasswordRules } from "../components/PasswordRules";
import { authStore } from "../stores/AuthStore";
import { isStrongPassword } from "../../../utils/validators";

export const ResetPasswordPage = observer(() => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    authStore.clearMessages();

    if (!authStore.resetEmail) {
      navigate("/forgot-password", { replace: true });
    }

    return () => authStore.clearMessages();
  }, [navigate]);

  const canSubmit = useMemo(() => {
    return (
      otp.length === 6 &&
      isStrongPassword(password) &&
      password === confirmPassword &&
      !authStore.isLoading
    );
  }, [otp, password, confirmPassword]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    authStore.clearMessages();

    if (otp.length !== 6) {
      authStore.setFieldError("otp", "Please enter a valid 6-digit OTP code.");
      return;
    }

    if (!isStrongPassword(password)) {
      authStore.setFieldError(
        "password",
        "Password must meet all strength requirements."
      );
      return;
    }

    if (password !== confirmPassword) {
      authStore.setFieldError(
        "confirmPassword",
        "The verification password does not match."
      );
      return;
    }

    const success = await authStore.resetPassword({
      email: authStore.resetEmail,
      otp,
      new_password: password,
      confirmPassword,
    });

    if (success) {
      window.setTimeout(() => {
        authStore.clearMessages();
        navigate("/login", { replace: true });
      }, 1600);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      description="Use the OTP from your email and create a strong new password."
    >
      <div className="auth-card">
        <button
          type="button"
          className="auth-back-button"
          onClick={() => navigate("/forgot-password", { replace: true })}
        >
          <ArrowLeft size={28} />
        </button>

        <h2>Reset Password</h2>
        <p className="auth-card__subtitle">
          Enter the OTP sent to <strong>{authStore.resetEmail}</strong> and set
          your new password.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthInput
            icon={<KeyRound size={22} />}
            placeholder="OTP Code"
            value={otp}
            error={authStore.fieldErrors.otp}
            maxLength={6}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, ""));
              authStore.clearFieldError("otp");
            }}
          />

          <PasswordInput
            placeholder="New Password"
            value={password}
            error={authStore.fieldErrors.password}
            onChange={(event) => {
              setPassword(event.target.value);
              authStore.clearFieldError("password");
            }}
            autoComplete="new-password"
          />

          <PasswordRules password={password} />

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
            disabled={!canSubmit}
          >
            {authStore.isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </AuthLayout>
  );
});