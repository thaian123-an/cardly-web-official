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
      navigate("/register", { replace: true });
      return;
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

  const canSubmit = useMemo(() => {
    return isValidOtp(otp) && seconds > 0 && !authStore.isLoading;
  }, [otp, seconds]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    authStore.clearMessages();

    if (seconds <= 0) {
      authStore.setFieldError("otp", "OTP code has expired.");
      return;
    }

    if (!isValidOtp(otp)) {
      authStore.setFieldError("otp", "Please enter a valid 6-digit OTP code.");
      return;
    }

    const success = await authStore.verifyOtp(otp);

    if (success) {
      window.setTimeout(() => {
        authStore.clearMessages();
        authStore.clearResetEmail();
        navigate("/login", { replace: true });
      }, 1400);
    } else {
      setOtp("");
    }
  };

  const handleChangeEmail = () => {
    authStore.clearMessages();
    authStore.clearResetEmail();
    navigate("/register", { replace: true });
  };

  return (
    <AuthLayout
      title="Verify your account"
      description="Enter the 6-digit OTP code sent to your email to activate your Cardly account."
      note={`OTP expires in ${timeText}`}
    >
      <div className="auth-card">
        <button
          type="button"
          className="auth-back-button"
          onClick={handleChangeEmail}
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
            placeholder="Enter OTP code"
            value={otp}
            error={authStore.fieldErrors.otp}
            className="auth-otp-input"
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(value);
              authStore.clearFieldError("otp");
              authStore.clearFieldError("general");
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
            disabled={!canSubmit}
          >
            {authStore.isLoading ? "Verifying..." : "Verify Account"}
          </button>

          <button
            type="button"
            className="auth-secondary-button"
            onClick={handleChangeEmail}
          >
            Change email
          </button>
        </form>

        <div className="auth-links-row">
          <Link to="/login" onClick={() => authStore.clearMessages()}>
            Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
});