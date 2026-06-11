// Validation utilities

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (simple US format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(?:0|\+84)(?:\d){2}[-. ]?(?:\d){3}[-. ]?(?:\d){4}$/;
  return phoneRegex.test(phone);
}

export function hasRequiredParams(
  ...params: Array<string | number | null | undefined>
): boolean {
  return params.every((param) => {
    if (param === null || param === undefined) return false;
    if (typeof param === "number") return true;
    return param.trim().length > 0;
  });
}
