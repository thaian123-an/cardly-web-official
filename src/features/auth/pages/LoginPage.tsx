import { observer } from "mobx-react-lite";
import { Mail } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordInput } from "../components/PasswordInput";
import { authStore } from "../stores/AuthStore";
import { isValidEmail } from "../../../utils/validators";

export const LoginPage = observer(() => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [lockSeconds, setLockSeconds] = useState(
    authStore.loginLockRemainingSeconds
  );

  useEffect(() => {
    authStore.clearMessages();

    if (authStore.isAuthenticated) {
      navigate("/home", { replace: true });
    }

    const timer = window.setInterval(() => {
      setLockSeconds(authStore.loginLockRemainingSeconds);
    }, 1000);

    return () => {
      window.clearInterval(timer);
      authStore.clearMessages();
    };
  }, [navigate]);

  const isLoginDisabled = useMemo(() => {
    return authStore.isLoading || lockSeconds > 0 || !email.trim() || !password;
  }, [email, password, lockSeconds]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    authStore.clearMessages();

    const errors: Record<string, string> = {};

    if (!email.trim() && !password) {
      errors.email = "Please fill in email and password";
      errors.password = "Please fill in email and password";
    } else {
      if (!email.trim()) {
        errors.email = "Email is required.";
      } else if (!isValidEmail(email)) {
        errors.email = "Please enter a valid email address.";
      }

      if (!password) {
        errors.password = "Password is required.";
      }
    }

    if (Object.keys(errors).length > 0) {
      authStore.setFieldErrors(errors);
      return;
    }

    const success = await authStore.login({
      email,
      password,
    });

    if (success) {
      window.setTimeout(() => {
        authStore.clearMessages();
        navigate("/home", { replace: true });
      }, 700);
    } else if (authStore.fieldErrors.password) {
      setPassword("");
    }
  };

  return (
    <AuthLayout
      title="Welcome to Cardly"
      description="Scan, review, and manage business card contacts from mobile and web in one connected workspace."
      bullets={[
        "Mobile card scan sync",
        "Business contact management",
        "Web review dashboard",
      ]}
    
    >
      <div className="auth-card">
        <h2>Sign In</h2>
        <p className="auth-card__subtitle">Enter your information below</p>

        <div className="auth-divider">
          <span />
          <p>Or login with</p>
          <span />
        </div>

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

          <PasswordInput
            placeholder="Password"
            value={password}
            error={authStore.fieldErrors.password}
            onChange={(event) => {
              setPassword(event.target.value);
              authStore.clearFieldError("password");
            }}
            autoComplete="current-password"
          />

          <div className="auth-form__right">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

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
            disabled={isLoginDisabled}
          >
            {authStore.isLoading
              ? "Logging in..."
              : lockSeconds > 0
                ? `Try again in ${lockSeconds}s`
                : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Register Now</Link>
        </p>
      </div>
    </AuthLayout>
  );
});