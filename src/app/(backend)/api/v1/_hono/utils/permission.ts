import { Context } from 'hono';

/**
 * Helper function to get user permissions from context
 * Useful for handlers that need to know what permissions were checked
 * @param c - Hono context
 * @returns Permission check result or null if no check was performed
 */
export const getCheckedPermissions = (c: Context) => {
  return c.get('checkedPermissions') || null;
};
