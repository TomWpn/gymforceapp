/**
 * Utility functions for sanitizing user PII (Personally Identifiable Information)
 * for display in the UI while maintaining privacy.
 */

/**
 * Sanitizes an email address by showing only the username part (before @)
 * @param email - The full email address
 * @returns The username portion of the email or a masked version
 *
 * Examples:
 *   john.doe@example.com -> john.doe
 *   jane@company.org -> jane
 */
export const sanitizeEmail = (email: string | undefined | null): string => {
  if (!email) return "Email not provided";

  const atIndex = email.indexOf("@");
  if (atIndex === -1) return email; // Not a valid email, return as-is

  return email.substring(0, atIndex);
};

/**
 * Sanitizes a display name by showing only the first name if full name is provided,
 * or the username from email if no display name exists
 * @param displayName - The user's display name
 * @param email - The user's email (fallback if no display name)
 * @returns A privacy-friendly display name
 *
 * Examples:
 *   "John Doe", "john@example.com" -> "John D."
 *   "Jane", "jane@example.com" -> "Jane"
 *   "", "john.smith@example.com" -> "john.smith"
 */
export const sanitizeDisplayName = (
  displayName: string | undefined | null,
  email?: string | undefined | null
): string => {
  // If no display name, use sanitized email
  if (!displayName || displayName.trim() === "") {
    return sanitizeEmail(email);
  }

  // If display name has spaces, it's likely a full name - show first name + last initial
  const nameParts = displayName.trim().split(/\s+/);
  if (nameParts.length > 1) {
    const firstName = nameParts[0];
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  }

  // Single word display name, return as-is
  return displayName;
};

/**
 * Gets the initials from a display name for avatar placeholders
 * @param displayName - The user's display name
 * @param email - The user's email (fallback if no display name)
 * @returns 1-2 character initials
 *
 * Examples:
 *   "John Doe" -> "JD"
 *   "Jane" -> "J"
 *   "", "john@example.com" -> "J"
 */
export const getInitials = (
  displayName: string | undefined | null,
  email?: string | undefined | null
): string => {
  // Try display name first
  if (displayName && displayName.trim() !== "") {
    const nameParts = displayName.trim().split(/\s+/);
    if (nameParts.length > 1) {
      return (
        nameParts[0].charAt(0).toUpperCase() +
        nameParts[nameParts.length - 1].charAt(0).toUpperCase()
      );
    }
    return displayName.charAt(0).toUpperCase();
  }

  // Fallback to email
  if (email) {
    const username = sanitizeEmail(email);
    return username.charAt(0).toUpperCase();
  }

  return "?";
};
