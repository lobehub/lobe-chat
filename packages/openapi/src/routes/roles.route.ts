import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { RoleController } from '../controllers/role.controller';
import { requireAuth } from '../middleware/auth';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  RoleIdParamSchema,
  RolesListQuerySchema,
  UpdateRoleRequestSchema,
} from '../types/role.type';

const RolesRoutes = new Hono();

/**
 * Get all roles in the system
 * GET /api/v1/roles 获取系统中所有角色列表
 * Requires role read permission (specific scopes)
 */
RolesRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('RBAC_ROLE_READ', ['ALL', 'WORKSPACE']),
    'You do not have permission to view roles list',
  ),
  zValidator('query', RolesListQuerySchema),
  async (c) => {
    const roleController = new RoleController();

    return await roleController.getRoles(c);
  },
);

/**
 * Get role by ID
 * GET /api/v1/roles/:id 获取指定角色详情
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
 * GET /api/v1/roles/:id/permissions 获取指定角色权限映射
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
 * PUT /api/v1/roles/:id 更新角色信息
 * Requires role update permission (admin only)
 */
RolesRoutes.patch(
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
