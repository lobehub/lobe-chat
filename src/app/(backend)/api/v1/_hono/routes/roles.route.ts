import { Hono } from 'hono';

import { RBAC_PERMISSIONS } from '@/const/rbac';
import { getAllScopePermissions, getScopePermissions } from '@/utils/rbac';

import { RoleController } from '../controllers/role.controller';
import { requireAuth } from '../middleware/oidc-auth';
import { requireAnyPermission } from '../middleware/permission-check';

const RolesRoutes = new Hono();

/**
 * Get all roles in the system
 * GET /api/v1/roles/list
 * Requires role read permission (specific scopes)
 */
RolesRoutes.get(
  '/list',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('RBAC_ROLE_READ', ['ALL', 'WORKSPACE']),
    'You do not have permission to view roles list',
  ),
  async (c) => {
    const roleController = new RoleController();
    return await roleController.getAllRoles(c);
  },
);

/**
 * Get all active roles in the system
 * GET /api/v1/roles/active
 * Requires role read permission (only admin level)
 */
RolesRoutes.get(
  '/active',
  requireAuth,
  requireAnyPermission(
    [RBAC_PERMISSIONS.RBAC_ROLE_READ_ALL],
    'You do not have permission to view active roles',
  ),
  async (c) => {
    const roleController = new RoleController();
    return await roleController.getActiveRoles(c);
  },
);

/**
 * Get role by ID
 * GET /api/v1/roles/:id
 * Requires role read permission (specific scopes)
 */
RolesRoutes.get(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('RBAC_ROLE_READ', ['ALL', 'WORKSPACE']),
    'You do not have permission to view role details',
  ),
  async (c) => {
    const roleController = new RoleController();
    return await roleController.getRoleById(c);
  },
);

/**
 * Get role permissions mapping
 * GET /api/v1/roles/:id/permissions
 * Requires role read permission (all scopes) - 这里演示全量权限的场景
 */
RolesRoutes.get(
  '/:id/permissions',
  requireAuth,
  requireAnyPermission(
    getAllScopePermissions('RBAC_ROLE_READ'),
    'You do not have permission to view role permissions',
  ),
  async (c) => {
    const roleController = new RoleController();
    // 这里可以添加获取角色权限的逻辑
    return roleController.getRoleById(c);
  },
);

export default RolesRoutes;
