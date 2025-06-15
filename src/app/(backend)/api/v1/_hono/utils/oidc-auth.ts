import { Context } from 'hono';

/**
 * Helper function to get user ID from Hono context
 * @param c - Hono context
 * @returns User ID or null if not authenticated
 */
export const getUserId = (c: Context): string | null => {
  return c.get('userId') || null;
};

/**
 * Helper function to get authentication type from Hono context
 * @param c - Hono context
 * @returns Authentication type or null
 */
export const getAuthType = (c: Context): string | null => {
  return c.get('authType') || null;
};

/**
 * Helper function to get authentication data from Hono context
 * @param c - Hono context
 * @returns Authentication data or null
 */
export const getAuthData = (c: Context): any | null => {
  return c.get('authData') || null;
};
