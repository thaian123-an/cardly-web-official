import { observer } from "mobx-react-lite";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "../components/PasswordInput";
import { PasswordRules } from "../components/PasswordRules";
import { authStore } from "../stores/AuthStore";
import { isStrongPassword } from "../../../utils/validators";

export const ResetPasswordPage = observer(() => {
  const navigate = useNavigate();

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
      isStrongPassword(password) &&
      password === confirmPassword &&
      !authStore.isLoading
    );
  }, [password, confirmPassword]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    authStore.clearMessages();

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
      password,
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
      description="Use a strong password with uppercase, digit, special character, and no spaces."
      
    >
      <div className="auth-card">
        <button
          type="button"
          className="auth-back-button"
          onClick={() => navigate("/otp", { replace: true })}
        >
          <ArrowLeft size={28} />
        </button>

        <h2>Reset Password</h2>
        <p className="auth-card__subtitle">
          Create a new password for your Cardly account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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