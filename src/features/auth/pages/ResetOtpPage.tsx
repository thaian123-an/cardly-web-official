import { observer } from "mobx-react-lite";
import { KeyRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { authStore } from "../stores/AuthStore";

export const ResetOtpPage = observer(() => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  useEffect(() => {
    authStore.clearMessages();

    if (!authStore.resetEmail) {
      navigate("/forgot-password", { replace: true });
    }

    return () => {
      authStore.clearMessages();
    };
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    authStore.clearMessages();

    const normalizedOtp = otp.trim();

    if (!normalizedOtp) {
      authStore.setFieldError("otp", "OTP code is required.");
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      authStore.setFieldError("otp", "OTP code must be 6 digits.");
      return;
    }

    const success = await authStore.verifyResetOtp(normalizedOtp);

    if (success) {
      window.setTimeout(() => {
        authStore.clearMessages();
        navigate("/reset-password", { replace: true });
      }, 700);
    }
  };

  return (
    <AuthLayout
      title="Verify reset OTP"
      description="Enter the OTP code sent to your email to continue resetting your password."
      bullets={[
        "Secure OTP verification",
        "Password reset protection",
        "Quick account recovery",
      ]}
    >
      <div className="auth-card">
        <h2>Verify OTP</h2>
        <p className="auth-card__subtitle">
          Enter the 6-digit OTP sent to {authStore.resetEmail || "your email"}.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthInput
            icon={<KeyRound size={22} />}
            type="text"
            placeholder="Enter OTP Code"
            value={otp}
            error={authStore.fieldErrors.otp}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(value);
              authStore.clearFieldError("otp");
            }}
            inputMode="numeric"
            maxLength={6}
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
            disabled={authStore.isLoading || otp.trim().length !== 6}
          >
            {authStore.isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="auth-switch">
          Wrong email? <Link to="/forgot-password">Send OTP again</Link>
        </p>
      </div>
    </AuthLayout>
  );
});