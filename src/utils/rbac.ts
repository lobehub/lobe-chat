import { RBACModel } from '@/database/models/rbac';
import { serverDB } from '@/database/server';

/**
 * RBAC Permission Check Utility Class
 */
export class RBACUtils {
  private static rbacModel = new RBACModel(serverDB);

  /**
   * Check if user has specific permission
   * @param userId User ID
   * @param permissionCode Permission code
   * @returns Whether user has permission
   */
  static async checkPermission(userId: string, permissionCode: string): Promise<boolean> {
    try {
      return await this.rbacModel.checkUserPermission(userId, permissionCode);
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Check if user has specific role
   * @param userId User ID
   * @param roleName Role name
   * @returns Whether user has role
   */
  static async checkRole(userId: string, roleName: string): Promise<boolean> {
    try {
      return await this.rbacModel.checkUserRole(userId, roleName);
    } catch (error) {
      console.error('Role check failed:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the permissions
   * @param userId User ID
   * @param permissionCodes Array of permission codes
   * @returns Whether user has any permission
   */
  static async checkAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
    try {
      for (const permissionCode of permissionCodes) {
        const hasPermission = await this.rbacModel.checkUserPermission(userId, permissionCode);
        if (hasPermission) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Check if user has all permissions
   * @param userId User ID
   * @param permissionCodes Array of permission codes
   * @returns Whether user has all permissions
   */
  static async checkAllPermissions(userId: string, permissionCodes: string[]): Promise<boolean> {
    try {
      for (const permissionCode of permissionCodes) {
        const hasPermission = await this.rbacModel.checkUserPermission(userId, permissionCode);
        if (!hasPermission) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Get all permissions of a user
   * @param userId User ID
   * @returns User permission list
   */
  static async getUserPermissions(userId: string) {
    try {
      return await this.rbacModel.getUserPermissions(userId);
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }

  /**
   * Get all roles of a user
   * @param userId User ID
   * @returns User role list
   */
  static async getUserRoles(userId: string) {
    try {
      return await this.rbacModel.getUserRoles(userId);
    } catch (error) {
      console.error('Failed to get user roles:', error);
      return [];
    }
  }

  /**
   * Check if user is administrator
   * @param userId User ID
   * @returns Whether user is administrator
   */
  static async isAdmin(userId: string): Promise<boolean> {
    return await this.checkRole(userId, 'admin');
  }

  /**
   * Check if user is super administrator
   * @param userId User ID
   * @returns Whether user is super administrator
   */
  static async isSuperAdmin(userId: string): Promise<boolean> {
    return await this.checkRole(userId, 'admin');
  }
}

/**
 * Permission check decorator (for class methods)
 * @param permissionCode Permission code
 */
export function RequirePermission(permissionCode: string) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Assume first parameter contains userId
      const userId = args[0]?.userId;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const hasPermission = await RBACUtils.checkPermission(userId, permissionCode);
      if (!hasPermission) {
        throw new Error(`Insufficient permissions, required permission: ${permissionCode}`);
      }

      return method.apply(this, args);
    };
  };
}

/**
 * Role check decorator (for class methods)
 * @param roleName Role name
 */
export function RequireRole(roleName: string) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Assume first parameter contains userId
      const userId = args[0]?.userId;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const hasRole = await RBACUtils.checkRole(userId, roleName);
      if (!hasRole) {
        throw new Error(`Insufficient permissions, required role: ${roleName}`);
      }

      return method.apply(this, args);
    };
  };
}
