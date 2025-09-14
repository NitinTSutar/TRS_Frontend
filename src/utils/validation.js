/**
 * Validates an email address format.
 * @param {string} email The email to validate.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Checks password strength and returns an error message if it's weak.
 * @param {string} password The password to check.
 * @returns {string|null} An error message string or null if the password is strong.
 */
export const getPasswordStrengthError = (password) => {
  if (!password) return "Password is required.";

  const errors = [];
  if (password.length < 8) errors.push("at least 8 characters");
  if (!/[a-z]/.test(password)) errors.push("a lowercase letter");
  if (!/[A-Z]/.test(password)) errors.push("an uppercase letter");
  if (!/\d/.test(password)) errors.push("a number");

  if (errors.length > 0) {
    return `Password must contain ${errors.join(", ")}.`;
  }

  return null; // Password is strong enough
};
