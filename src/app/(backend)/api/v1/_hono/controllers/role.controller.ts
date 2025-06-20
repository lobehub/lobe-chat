import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { RoleService } from '../services/role.service';

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
  async getAllRoles(c: Context): Promise<Response> {
    try {
      // Get database connection and create service instance
      const db = await this.getDatabase();
      const roleService = new RoleService(db, this.getUserId(c));
      const roles = await roleService.getAllRoles();

      return this.success(c, roles, 'Get roles list successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * Get all active roles in the system
   * @param c Hono Context
   * @returns Active role list response
   */
  async getActiveRoles(c: Context): Promise<Response> {
    try {
      // Get database connection and create service instance
      const db = await this.getDatabase();
      const roleService = new RoleService(db, this.getUserId(c));
      const roles = await roleService.getActiveRoles();

      return this.success(c, roles, 'Get active roles list successfully');
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
      const roleId = parseInt(c.req.param('id'));
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
      const roleId = parseInt(c.req.param('id'));
      const db = await this.getDatabase();
      const roleService = new RoleService(db, this.getUserId(c));
      const permissions = await roleService.getRolePermissions(roleId);

      return this.success(c, permissions, 'Get role permissions successfully');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
