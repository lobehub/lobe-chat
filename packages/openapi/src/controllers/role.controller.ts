import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { RoleService } from '../services/role.service';
import { RolesListQuery, UpdateRoleRequest } from '../types/role.type';

/**
 * Role controller class
 * Handle role-related HTTP requests and responses
 */
export class RoleController extends BaseController {
  /**
   * Get all roles in the system
   * @param c Hono Context
   * @returns Role list response
   */
  async getRoles(c: Context): Promise<Response> {
    try {
      // Get database connection and create service instance
      const queryParams = this.getParams<RolesListQuery>(c);

      const db = await this.getDatabase();
      const roleService = new RoleService(db, this.getUserId(c));
      const roles = await roleService.getRoles(queryParams);

      return this.success(c, roles, 'Get roles list successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * Get role by ID
   * @param c Hono Context
   * @returns Role detail response
   */
  async getRoleById(c: Context): Promise<Response> {
    try {
      const { id } = this.getParams<{ id: number }>(c);
      const roleId = id;
      const db = await this.getDatabase();
      const roleService = new RoleService(db, this.getUserId(c));
      const role = await roleService.getRoleById(roleId);

      if (!role) {
        return this.error(c, 'Role not found', 404);
      }

      return this.success(c, role, 'Get role details successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * Get role permissions by role ID
   * @param c Hono Context
   * @returns Role permissions response
   */
  async getRolePermissions(c: Context): Promise<Response> {
    try {
      const { id } = this.getParams<{ id: number }>(c);
      const roleId = id;
      const db = await this.getDatabase();
      const roleService = new RoleService(db, this.getUserId(c));
      const permissions = await roleService.getRolePermissions(roleId);

      return this.success(c, permissions, 'Get role permissions successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * Update role information by ID
   * PUT /api/v1/roles/:id
   * @param c Hono Context
   * @returns Updated role response
   */
  async updateRole(c: Context): Promise<Response> {
    try {
      const { id } = this.getParams<{ id: number }>(c);
      const body = await this.getBody<UpdateRoleRequest>(c);

      if (!body) {
        return this.error(c, '请求体不能为空', 400);
      }

      const db = await this.getDatabase();
      const roleService = new RoleService(db, this.getUserId(c));
      const updatedRole = await roleService.updateRole(id, body);

      return this.success(c, updatedRole, '角色更新成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
