import { CheckCircle2, Circle } from "lucide-react";
import { getPasswordRules } from "../../../utils/validators";

type PasswordRulesProps = {
  password: string;
};

export function PasswordRules({ password }: PasswordRulesProps) {
  const rules = getPasswordRules(password);

  const items = [
    {
      label: "Minimum 8 characters",
      passed: rules.hasMinLength,
    },
    {
      label: "At least 1 uppercase letter",
      passed: rules.hasUppercase,
    },
    {
      label: "At least 1 digit",
      passed: rules.hasDigit,
    },
    {
      label: "At least 1 special character",
      passed: rules.hasSpecialCharacter,
    },
    {
      label: "No spaces",
      passed: rules.hasNoSpaces,
    },
  ];

  return (
    <div className="password-rules">
      {items.map((item) => (
        <div
          key={item.label}
          className={`password-rule ${
            item.passed ? "password-rule--passed" : ""
          }`}
        >
          {item.passed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}