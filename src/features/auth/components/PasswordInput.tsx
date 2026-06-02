import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function PasswordInput({ error, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="auth-field">
      <div className={`auth-input ${error ? "auth-input--error" : ""}`}>
        <span className="auth-input__icon">
          <Lock size={22} />
        </span>

        <input type={isVisible ? "text" : "password"} {...props} />

        <button
          type="button"
          className="auth-input__action"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>

      {error ? <p className="auth-field__error">{error}</p> : null}
    </div>
  );
}