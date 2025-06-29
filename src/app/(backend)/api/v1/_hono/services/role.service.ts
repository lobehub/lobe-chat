import { eq } from 'drizzle-orm';

import {
  PermissionItem,
  RoleItem,
  permissions,
  rolePermissions,
  roles,
} from '@/database/schemas/rbac';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import { UpdateRoleRequest } from '../types/role.type';

export class RoleService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * Get all roles in the system
   * @returns Promise<RoleItem[]> - Array of all roles
   */
  async getAllRoles(): Promise<RoleItem[]> {
    return await this.db.query.roles.findMany({
      orderBy: [roles.isSystem, roles.createdAt],
    });
  }

  /**
   * Get all active roles in the system
   * @returns Promise<RoleItem[]> - Array of active roles
   */
  async getActiveRoles(): Promise<RoleItem[]> {
    return await this.db.query.roles.findMany({
      orderBy: [roles.isSystem, roles.createdAt],
      where: eq(roles.isActive, true),
    });
  }

  /**
   * Get role by ID
   * @param id - Role ID
   * @returns Promise<RoleItem | undefined> - Role item or undefined if not found
   */
  async getRoleById(id: number): Promise<RoleItem | undefined> {
    return await this.db.query.roles.findFirst({
      where: eq(roles.id, id),
    });
  }

  /**
   * Get role by name
   * @param name - Role name
   * @returns Promise<RoleItem | undefined> - Role item or undefined if not found
   */
  async getRoleByName(name: string): Promise<RoleItem | undefined> {
    return await this.db.query.roles.findFirst({
      where: eq(roles.name, name),
    });
  }

  /**
   * Get role permissions by role ID
   * @param id - Role ID
   * @returns Promise<PermissionItem[]> - Array of permissions
   */
  async getRolePermissions(id: number): Promise<Partial<PermissionItem>[]> {
    const result = await this.db
      .select({
        category: permissions.category,
        code: permissions.code,
        description: permissions.description,
        id: permissions.id,
        isActive: permissions.isActive,
        name: permissions.name,
      })
      .from(permissions)
      .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, id));

    return result;
  }

  /**
   * Update role information by ID
   * @param id - Role ID to update
   * @param updateData - Role update data
   * @returns Promise<RoleItem> - Updated role item
   */
  async updateRole(id: number, updateData: UpdateRoleRequest): ServiceResult<RoleItem> {
    this.log('info', '更新角色信息', { roleId: id, updateData });

    try {
      return await this.db.transaction(async (tx) => {
        // 检查角色是否存在
        const existingRole = await tx.query.roles.findFirst({
          where: eq(roles.id, id),
        });

        if (!existingRole) {
          throw this.createNotFoundError(`角色 ID "${id}" 不存在`);
        }

        // 检查是否为系统角色，系统角色不允许修改某些字段
        if (existingRole.isSystem && (updateData.name || updateData.isSystem === false)) {
          throw this.createBusinessError('系统角色不允许修改名称或系统属性');
        }

        // 如果要修改角色名称，检查新名称是否已存在
        if (updateData.name && updateData.name !== existingRole.name) {
          const duplicateRole = await tx.query.roles.findFirst({
            where: eq(roles.name, updateData.name),
          });

          if (duplicateRole) {
            throw this.createBusinessError(`角色名称 "${updateData.name}" 已存在`);
          }
        }

        // 准备更新数据
        const updateFields = {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.displayName && { displayName: updateData.displayName }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
          ...(updateData.isSystem !== undefined && { isSystem: updateData.isSystem }),
          updatedAt: new Date(),
        };

        // 执行更新
        const [updatedRole] = await tx
          .update(roles)
          .set(updateFields)
          .where(eq(roles.id, id))
          .returning();

        this.log('info', '角色更新成功', { roleId: id, roleName: updatedRole.name });
        return updatedRole;
      });
    } catch (error) {
      this.handleServiceError(error, '更新角色');
    }
  }
}
