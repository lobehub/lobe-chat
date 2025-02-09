export const isDev = process.env.NODE_ENV === 'development';

export const isOnServerSide = typeof window === 'undefined';
/**
 * Get environment variable value
 * @param key - Environment variable key
 * @returns Environment variable value or empty string if not found
 */
export const getEnvironment = (key: string): string => {
  if (typeof process === 'undefined') return '';
  return process.env[key] || '';
};
