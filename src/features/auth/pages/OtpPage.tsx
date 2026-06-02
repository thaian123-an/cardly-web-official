import { observer } from "mobx-react-lite";
import { ArrowLeft, Hash } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { authStore } from "../stores/AuthStore";
import { isValidOtp } from "../../../utils/validators";

const OTP_DURATION_SECONDS = 5 * 60;

export const OtpPage = observer(() => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(OTP_DURATION_SECONDS);

  useEffect(() => {
    authStore.clearMessages();

    if (!authStore.resetEmail) {
      navigate("/forgot-password", { replace: true });
    }

    const timer = window.setInterval(() => {
      setSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
      authStore.clearMessages();
    };
  }, [navigate]);

  const timeText = useMemo(() => {
    const minutesText = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secondsText = String(seconds % 60).padStart(2, "0");

    return `${minutesText}:${secondsText}`;
  }, [seconds]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    authStore.clearMessages();

    if (seconds <= 0) {
      authStore.setFieldError("otp", "OTP code has expired");
      return;
    }

    if (!isValidOtp(otp)) {
      authStore.setFieldError("otp", "Incorrect OTP code");
      setOtp("");
      return;
    }

    const success = await authStore.verifyOtp(otp);

    if (success) {
      window.setTimeout(() => {
        authStore.clearMessages();
        navigate("/reset-password", { replace: true });
      }, 700);
    } else {
      setOtp("");
    }
  };

  const handleResendOtp = async () => {
    if (!authStore.resetEmail) return;

    const success = await authStore.sendOtp(authStore.resetEmail);

    if (success) {
      setOtp("");
      setSeconds(OTP_DURATION_SECONDS);

      window.setTimeout(() => {
        authStore.clearMessages();
      }, 1800);
    }
  };

  return (
    <AuthLayout
      title="Verify OTP code"
      description="Enter the 6-digit code sent to your email before the timer expires."
      note={`OTP expires in ${timeText}`}
    >
      <div className="auth-card">
        <button
          type="button"
          className="auth-back-button"
          onClick={() => navigate("/forgot-password", { replace: true })}
        >
          <ArrowLeft size={28} />
        </button>

        <h2>OTP Verification</h2>
        <p className="auth-card__subtitle">
          Code sent to{" "}
          <strong>{authStore.resetEmail || "your registered email"}</strong>
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthInput
            icon={<Hash size={22} />}
            inputMode="numeric"
            maxLength={6}
            placeholder="1 2 3 4 5 6"
            value={otp}
            error={authStore.fieldErrors.otp}
            className="auth-otp-input"
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "");
              setOtp(value);
              authStore.clearFieldError("otp");
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
            disabled={authStore.isLoading || otp.length !== 6}
          >
            {authStore.isLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            className="auth-secondary-button"
            onClick={handleResendOtp}
            disabled={authStore.isLoading || seconds > 0}
          >
            {seconds > 0 ? `Resend OTP in ${timeText}` : "Resend OTP"}
          </button>
        </form>

        <div className="auth-links-row">
          <Link to="/forgot-password">Change email</Link>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </AuthLayout>
  );
});