import { PERMISSION_ACTIONS } from '@/const/rbac';
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

export const getResourceType = (permissionKey: keyof typeof PERMISSION_ACTIONS) => {
  return PERMISSION_ACTIONS[permissionKey].split(':')[0];
};

export const getActionType = (permissionKey: keyof typeof PERMISSION_ACTIONS) => {
  return PERMISSION_ACTIONS[permissionKey].split(':')[1];
};