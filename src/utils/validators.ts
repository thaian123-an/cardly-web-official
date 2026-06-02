export type PasswordRuleResult = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasDigit: boolean;
  hasSpecialCharacter: boolean;
  hasNoSpaces: boolean;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isRequired(value: string) {
  return value.trim().length > 0;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getPasswordRules(password: string): PasswordRuleResult {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecialCharacter: /[!@#$%^&*]/.test(password),
    hasNoSpaces: !/\s/.test(password),
  };
}

export function isStrongPassword(password: string) {
  const rules = getPasswordRules(password);

  return Object.values(rules).every(Boolean);
}

export function isValidOtp(otp: string) {
  return /^\d{6}$/.test(otp);
}

export function isValidMobileNumber(phone: string) {
  const cleanedPhone = phone.replace(/\s/g, "");

  return /^[0-9+]{9,15}$/.test(cleanedPhone);
}

export function getPasswordErrorMessage(password: string) {
  if (!password) {
    return "Password is required.";
  }

  if (!isStrongPassword(password)) {
    return "Password must contain minimum 8 characters, at least 1 uppercase letter, 1 digit, 1 special character, and no spaces.";
  }

  return "";
}