/**
 * Helper function to generate a Gravatar URL from an email address.
 * Falls back to 404 if the user does not have a Gravatar registered,
 * allowing the UI to gracefully fallback to initials.
 */
export function getGravatarUrl(emailOrLoginName?: string, size: number = 96): string | null {
  if (!emailOrLoginName || !emailOrLoginName.includes("@")) {
    return null;
  }

  const cleanEmail = emailOrLoginName.trim().toLowerCase();
  return `https://unavatar.io/gravatar/${encodeURIComponent(cleanEmail)}?fallback=false&w=${size}&h=${size}`;
}
