import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { RoleController } from '../controllers/role.controller';
import { requireAuth } from '../middleware/auth';
import { requireAnyPermission } from '../middleware/permission-check';
import { RoleIdParamSchema, UpdateRoleRequestSchema } from '../types/role.type';

const RolesRoutes = new Hono();

/**
 * Get all roles in the system
 * GET /api/v1/roles
 * Requires role read permission (specific scopes)
 */
RolesRoutes.get(
  '/',
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
 * GET /api/v1/roles?status=active
 * Requires role read permission (only admin level)
 */
RolesRoutes.get(
  '/active',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('RBAC_ROLE_READ', ['ALL', 'WORKSPACE']),
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
  zValidator('param', RoleIdParamSchema),
  async (c) => {
    const roleController = new RoleController();

    return await roleController.getRoleById(c);
  },
);

/**
 * Get role permissions mapping
 * GET /api/v1/roles/:id/permissions
 */
RolesRoutes.get(
  '/:id/permissions',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('RBAC_ROLE_READ', ['ALL', 'WORKSPACE']),
    'You do not have permission to view role permissions',
  ),
  zValidator('param', RoleIdParamSchema),
  async (c) => {
    const roleController = new RoleController();

    return roleController.getRolePermissions(c);
  },
);

/**
 * Update role information
 * PUT /api/v1/roles/:id
 * Requires role update permission (admin only)
 */
RolesRoutes.put(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('RBAC_ROLE_UPDATE', ['ALL', 'WORKSPACE']),
    '您没有权限更新角色信息',
  ),
  zValidator('param', RoleIdParamSchema),
  zValidator('json', UpdateRoleRequestSchema),
  async (c) => {
    const roleController = new RoleController();

    return await roleController.updateRole(c);
  },
);

export default RolesRoutes;
