/**
 * Handle legacy bug where full URLs were stored instead of keys
 * Some historical data stored complete URLs in database instead of just keys
 * Related issue: https://github.com/lobehub/lobe-chat/issues/8994
 */
export function extractKeyFromUrlOrReturnOriginal(
  url: string,
  getKeyFromFullUrl: (url: string) => string,
): string {
  // Only process URLs that start with http:// or https://
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Extract key from full URL for legacy data compatibility
    return getKeyFromFullUrl(url);
  }
  // Return original input if it's already a key
  return url;
}