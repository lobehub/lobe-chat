import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';

import { LobeChatDatabase } from '@/database/type';

import {
  NewPermission,
  NewRole,
  PermissionItem,
  RoleItem,
  permissions,
  rolePermissions,
  roles,
  userRoles,
} from '../schemas/rbac';

export class RBACNotFoundError extends TRPCError {
  constructor(resource: string) {
    super({ code: 'NOT_FOUND', message: `${resource} not found` });
  }
}

export class RBACModel {
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase) {
    this.db = db;
  }

  // ==================== Role Management ====================

  /**
   * Create role
   */
  createRole = async (data: NewRole): Promise<RoleItem> => {
    const [role] = await this.db.insert(roles).values(data).returning();
    return role;
  };

  /**
   * Get role list
   */
  getRoles = async (activeOnly: boolean = true): Promise<RoleItem[]> => {
    const conditions = activeOnly ? [eq(roles.isActive, true)] : [];
    return this.db.query.roles.findMany({
      orderBy: roles.createdAt,
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });
  };

  /**
   * Get role by ID
   */
  getRoleById = async (id: string): Promise<RoleItem | undefined> => {
    return this.db.query.roles.findFirst({
      where: eq(roles.id, id),
    });
  };

  /**
   * Get role by name
   */
  getRoleByName = async (name: string): Promise<RoleItem | undefined> => {
    return this.db.query.roles.findFirst({
      where: eq(roles.name, name),
    });
  };

  /**
   * Update role
   */
  updateRole = async (id: string, data: Partial<RoleItem>): Promise<void> => {
    await this.db
      .update(roles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(roles.id, id));
  };

  /**
   * Delete role
   */
  deleteRole = async (id: string): Promise<void> => {
    await this.db.delete(roles).where(eq(roles.id, id));
  };

  // ==================== Permission Management ====================

  /**
   * Create permission
   */
  createPermission = async (data: NewPermission): Promise<PermissionItem> => {
    const [permission] = await this.db.insert(permissions).values(data).returning();
    return permission;
  };

  /**
   * Get permission list
   */
  getPermissions = async (activeOnly: boolean = true): Promise<PermissionItem[]> => {
    const conditions = activeOnly ? [eq(permissions.isActive, true)] : [];
    return this.db.query.permissions.findMany({
      orderBy: [permissions.module, permissions.code],
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });
  };

  /**
   * Get permissions by module
   */
  getPermissionsByModule = async (module: string): Promise<PermissionItem[]> => {
    return this.db.query.permissions.findMany({
      orderBy: permissions.code,
      where: and(eq(permissions.module, module), eq(permissions.isActive, true)),
    });
  };

  /**
   * Get permission by code
   */
  getPermissionByCode = async (code: string): Promise<PermissionItem | undefined> => {
    return this.db.query.permissions.findFirst({
      where: eq(permissions.code, code),
    });
  };

  /**
   * Update permission
   */
  updatePermission = async (id: string, data: Partial<PermissionItem>): Promise<void> => {
    await this.db
      .update(permissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permissions.id, id));
  };

  /**
   * Delete permission
   */
  deletePermission = async (id: string): Promise<void> => {
    await this.db.delete(permissions).where(eq(permissions.id, id));
  };

  // ==================== Role Permission Association ====================

  /**
   * Assign permission to role
   */
  assignPermissionToRole = async (roleId: string, permissionId: string): Promise<void> => {
    await this.db.insert(rolePermissions).values({ permissionId, roleId }).onConflictDoNothing();
  };

  /**
   * Batch assign permissions to role
   */
  assignPermissionsToRole = async (roleId: string, permissionIds: string[]): Promise<void> => {
    const values = permissionIds.map((permissionId) => ({ permissionId, roleId }));
    await this.db.insert(rolePermissions).values(values).onConflictDoNothing();
  };

  /**
   * Remove permission from role
   */
  removePermissionFromRole = async (roleId: string, permissionId: string): Promise<void> => {
    await this.db
      .delete(rolePermissions)
      .where(
        and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)),
      );
  };

  /**
   * Get all permissions of a role
   */
  getRolePermissions = async (roleId: string): Promise<PermissionItem[]> => {
    const result = await this.db
      .select({
        accessedAt: permissions.accessedAt,
        code: permissions.code,
        createdAt: permissions.createdAt,
        description: permissions.description,
        id: permissions.id,
        isActive: permissions.isActive,
        module: permissions.module,
        name: permissions.name,
        updatedAt: permissions.updatedAt,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(eq(rolePermissions.roleId, roleId), eq(permissions.isActive, true)));

    return result;
  };

  // ==================== User Role Association ====================

  /**
   * Assign role to user
   */
  assignRoleToUser = async (userId: string, roleId: string, expiresAt?: Date): Promise<void> => {
    await this.db.insert(userRoles).values({ expiresAt, roleId, userId }).onConflictDoNothing();
  };

  /**
   * Batch assign roles to user
   */
  assignRolesToUser = async (userId: string, roleIds: string[]): Promise<void> => {
    const values = roleIds.map((roleId) => ({ roleId, userId }));
    await this.db.insert(userRoles).values(values).onConflictDoNothing();
  };

  /**
   * Remove role from user
   */
  removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
    await this.db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  };

  /**
   * Get all roles of a user
   */
  getUserRoles = async (userId: string): Promise<RoleItem[]> => {
    const result = await this.db
      .select({
        accessedAt: roles.accessedAt,
        createdAt: roles.createdAt,
        description: roles.description,
        displayName: roles.displayName,
        id: roles.id,
        isActive: roles.isActive,
        isSystem: roles.isSystem,
        name: roles.name,
        updatedAt: roles.updatedAt,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(roles.isActive, true),
          // Check if role is expired
          // TODO: Add expiration time check logic
        ),
      );

    return result;
  };

  /**
   * Get all permissions of a user
   */
  getUserPermissions = async (userId: string): Promise<PermissionItem[]> => {
    const userRolesList = await this.getUserRoles(userId);
    const roleIds = userRolesList.map((role) => role.id);

    if (roleIds.length === 0) {
      return [];
    }

    const result = await this.db
      .select({
        accessedAt: permissions.accessedAt,
        code: permissions.code,
        createdAt: permissions.createdAt,
        description: permissions.description,
        id: permissions.id,
        isActive: permissions.isActive,
        module: permissions.module,
        name: permissions.name,
        updatedAt: permissions.updatedAt,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(and(inArray(rolePermissions.roleId, roleIds), eq(permissions.isActive, true)));

    // Deduplicate
    const uniquePermissions = result.reduce((acc, permission) => {
      if (!acc.some((p) => p.id === permission.id)) {
        acc.push(permission);
      }
      return acc;
    }, [] as PermissionItem[]);

    return uniquePermissions;
  };

  /**
   * Check if user has specific permission
   */
  checkUserPermission = async (userId: string, permissionCode: string): Promise<boolean> => {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some((permission) => permission.code === permissionCode);
  };

  /**
   * Check if user has specific role
   */
  checkUserRole = async (userId: string, roleName: string): Promise<boolean> => {
    const userRolesList = await this.getUserRoles(userId);
    return userRolesList.some((role) => role.name === roleName);
  };
}
