import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { UserController } from '../controllers';
import { requireAuth } from '../middleware/oidc-auth';
import { requireAnyPermission } from '../middleware/permission-check';

const UserRoutes = new Hono();

/**
 * 获取当前登录用户信息
 * GET /api/v1/users/current
 * 需要认证，但不需要特殊权限
 */
UserRoutes.get('/current', requireAuth, async (c) => {
  const userController = new UserController();
  return await userController.getCurrentUser(c);
});

/**
 * 获取系统中所有用户列表
 * GET /api/v1/users/list
 * 需要用户管理权限
 */
UserRoutes.get(
  '/list',
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

export default UserRoutes;
