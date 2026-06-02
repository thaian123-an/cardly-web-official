import type { InputHTMLAttributes, ReactNode } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
  error?: string;
};

export function AuthInput({ icon, error, className = "", ...props }: AuthInputProps) {
  return (
    <div className="auth-field">
      <div className={`auth-input ${error ? "auth-input--error" : ""}`}>
        <span className="auth-input__icon">{icon}</span>
        <input className={className} {...props} />
      </div>

      {error ? <p className="auth-field__error">{error}</p> : null}
    </div>
  );
}