import { observer } from "mobx-react-lite";
import { Mail, User } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "../components/PasswordInput";
import { PasswordRules } from "../components/PasswordRules";
import { authStore } from "../stores/AuthStore";
import {
  isRequired,
  isStrongPassword,
  isValidEmail,
} from "../../../utils/validators";

export const RegisterPage = observer(() => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    authStore.clearMessages();

    return () => authStore.clearMessages();
  }, []);

  const areAllFieldsNonEmpty = useMemo(() => {
    return Boolean(
      fullName.trim() && email.trim() && password && confirmPassword
    );
  }, [fullName, email, password, confirmPassword]);

  const canSubmit = useMemo(() => {
    return (
      areAllFieldsNonEmpty &&
      isValidEmail(email) &&
      isStrongPassword(password) &&
      confirmPassword === password &&
      !authStore.isLoading
    );
  }, [areAllFieldsNonEmpty, email, password, confirmPassword]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    authStore.clearMessages();

    const errors: Record<string, string> = {};

    if (!isRequired(fullName)) {
      errors.full_name = "Full name is required.";
    }

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (!isStrongPassword(password)) {
      errors.password =
        "Password must meet all strength requirements before registering.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "The verification password does not match.";
    }

    if (Object.keys(errors).length > 0) {
      authStore.setFieldErrors(errors);
      return;
    }

    const success = await authStore.register({
      full_name: fullName,
      email,
      password,
      confirmPassword,
    });

    if (success) {
  window.setTimeout(() => {
    authStore.clearMessages();
    navigate("/otp", { replace: true });
  }, 1200);
}
  };

  return (
    <AuthLayout
      title="Create your workspace"
      description="Register a Cardly account to access scanned business card contacts and review extracted data later."
      bullets={[
        "Save scanned card contacts",
        "Verify extracted information",
        "Sync data from mobile",
      ]}
    >
      <div className="auth-card auth-card--register">
        <h2>Register</h2>
        <p className="auth-card__subtitle">Enter your information below</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthInput
            icon={<User size={22} />}
            placeholder="Full Name"
            value={fullName}
            error={authStore.fieldErrors.full_name}
            onChange={(event) => {
              setFullName(event.target.value);
              authStore.clearFieldError("full_name");
            }}
          />

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

          <PasswordInput
            placeholder="Password"
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
            {authStore.isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already a member? <Link to="/login">Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
});