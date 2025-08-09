import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { UserController } from '../controllers';
import { requireAuth } from '../middleware/auth';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  UpdateUserRolesRequestSchema,
  UserIdParamSchema,
  UserSearchRequestSchema,
} from '../types/user.type';

const UserRoutes = new Hono();

/**
 * 获取当前登录用户信息
 * GET /api/v1/users/me
 * 需要认证，但不需要特殊权限
 */
UserRoutes.get('/me', requireAuth, async (c) => {
  const userController = new UserController();
  return await userController.getCurrentUser(c);
});

/**
 * 获取系统中所有用户列表
 * GET /api/v1/users
 * 需要用户管理权限
 */
UserRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('USER_READ', ['ALL', 'WORKSPACE']),
    '您没有权限查看用户列表',
  ),
  async (c) => {
    const userController = new UserController();
    return await userController.getAllUsers(c);
  },
);

/**
 * 创建新用户
 * POST /api/v1/users
 * 需要用户创建权限
 */
UserRoutes.post(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('USER_CREATE', ['ALL', 'WORKSPACE']),
    '您没有权限创建用户',
  ),
  zValidator('json', CreateUserRequestSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.createUser(c);
  },
);

/**
 * 搜索用户
 * GET /api/v1/users/search?keyword=xxx
 * 需要用户读取权限
 * 注意：此路由必须在 /:id 路由之前定义，避免路径冲突
 */
UserRoutes.get(
  '/search',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('USER_READ', ['ALL', 'WORKSPACE']),
    '您没有权限搜索用户',
  ),
  zValidator('query', UserSearchRequestSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.searchUsers(c);
  },
);

/**
 * 获取用户角色信息
 * GET /api/v1/users/:id/roles
 * 需要用户角色查看权限
 */
UserRoutes.get(
  '/:id/roles',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('RBAC_USER_PERMISSION_VIEW', ['ALL', 'WORKSPACE']),
    '您没有权限查看用户角色',
  ),
  zValidator('param', UserIdParamSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.getUserRoles(c);
  },
);

/**
 * 更新用户关联的角色
 * PUT /api/v1/users/:id/roles
 * 需要用户角色分配权限
 */
UserRoutes.put(
  '/:id/roles',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('RBAC_USER_ROLE_ASSIGN', ['ALL', 'WORKSPACE']),
    '您没有权限分配用户角色',
  ),
  zValidator('param', UserIdParamSchema),
  zValidator('json', UpdateUserRolesRequestSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.updateUserRoles(c);
  },
);

/**
 * 根据ID获取用户详情
 * GET /api/v1/users/:id
 * 需要用户读取权限
 */
UserRoutes.get(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('USER_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看用户详情',
  ),
  zValidator('param', UserIdParamSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.getUserById(c);
  },
);

/**
 * 更新用户信息
 * PUT /api/v1/users/:id
 * 需要用户更新权限
 */
UserRoutes.put(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('USER_UPDATE', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限更新用户信息',
  ),
  zValidator('param', UserIdParamSchema),
  zValidator('json', UpdateUserRequestSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.updateUser(c);
  },
);

/**
 * 删除用户
 * DELETE /api/v1/users/:id
 * 需要用户删除权限
 */
UserRoutes.delete(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('USER_DELETE', ['ALL', 'WORKSPACE']),
    '您没有权限删除用户',
  ),
  zValidator('param', UserIdParamSchema),
  async (c) => {
    const userController = new UserController();
    return await userController.deleteUser(c);
  },
);

export default UserRoutes;
