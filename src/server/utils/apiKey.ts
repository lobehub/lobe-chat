import { createHash, randomBytes } from 'node:crypto';

/**
 * Generate API Key
 * Format: lb-{random}
 * @param prefix - API Key prefix, used to identify different purposes
 * @returns Generated API Key
 */
export function generateApiKey(): string {
  // Generate 32 bytes of random data
  const random = randomBytes(32).toString('hex');
  // Generate hash using SHA-256
  const hash = createHash('sha256').update(random).digest('hex');
  // Take the first 16 characters as the random part
  const randomPart = hash.slice(0, 16);
  // Combine to form the final API Key
  return `lb-${randomPart}`;
}
