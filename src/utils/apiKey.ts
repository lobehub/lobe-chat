/**
 * Check if API Key is expired
 * @param expiresAt - Expiration time
 * @returns Whether the key has expired
 */
export function isApiKeyExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

/**
 * Validate API Key format
 * @param key - API Key to validate
 * @returns Whether the key has a valid format
 */
export function validateApiKeyFormat(key: string): boolean {
  // Check format: lb-{random}
  const pattern = /^lb-[\da-f]{16}$/;
  return pattern.test(key);
}
