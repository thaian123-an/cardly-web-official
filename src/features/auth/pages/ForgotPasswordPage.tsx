import { observer } from "mobx-react-lite";
import { Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { authStore } from "../stores/AuthStore";
import { isValidEmail } from "../../../utils/validators";

export const ForgotPasswordPage = observer(() => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    authStore.clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      authStore.setFieldError("email", "Email is required.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      authStore.setFieldError("email", "Please enter a valid email address.");
      return;
    }

    const success = await authStore.sendOtp(normalizedEmail);

if (success) {
  window.setTimeout(() => {
    authStore.clearMessages();
    navigate("/reset-otp", { replace: true });
  }, 700);
}
  };

  return (
    <AuthLayout
      title="Reset access safely"
      description="Enter your registered email address and continue with OTP verification in the next step."
      bullets={[
        "Email OTP verification",
        "Secure password reset",
        "Fast account recovery",
      ]}
    >
      <div className="auth-card">
        <Link to="/login" className="auth-back-link">
          ←
        </Link>

        <h2>Forgot Password?</h2>
        <p className="auth-card__subtitle">
          Enter your email address. We will send OTP code for verification in
          the next step.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthInput
            icon={<Mail size={22} />}
            type="email"
            placeholder="Email Address"
            value={email}
            error={authStore.fieldErrors.email}
            onChange={(event) => {
              setEmail(event.target.value);
              authStore.clearFieldError("email");
            }}
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
            disabled={authStore.isLoading || !email.trim()}
          >
            {authStore.isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="auth-switch">
          Remember password? <Link to="/login">Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
});