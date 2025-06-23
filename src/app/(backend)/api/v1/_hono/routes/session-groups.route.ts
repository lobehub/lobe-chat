import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { SessionGroupController } from '../controllers/sessionGroup.controller';
import { requireAuth } from '../middleware/oidc-auth';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  CreateSessionGroupRequestSchema,
  SessionGroupIdParamSchema,
  UpdateSessionGroupOrderRequestSchema,
  UpdateSessionGroupRequestSchema,
} from '../types/session.type';

// SessionGroup 相关路由
const SessionGroupRoutes = new Hono();

/**
 * 获取会话组列表
 * GET /api/v1/session-groups
 * 需要会话组读取权限
 */
SessionGroupRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看会话组列表',
  ),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.getSessionGroups(c);
  },
);

/**
 * 创建会话组
 * POST /api/v1/session-groups
 * 需要会话组创建权限
 */
SessionGroupRoutes.post(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_CREATE', ['ALL', 'WORKSPACE']),
    '您没有权限创建会话组',
  ),
  zValidator('json', CreateSessionGroupRequestSchema),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.createSessionGroup(c);
  },
);

/**
 * 更新会话组排序
 * PUT /api/v1/session-groups/order
 * 需要会话组更新权限
 */
SessionGroupRoutes.put(
  '/order',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_UPDATE', ['ALL', 'WORKSPACE']),
    '您没有权限更新会话组排序',
  ),
  zValidator('json', UpdateSessionGroupOrderRequestSchema),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.updateSessionGroupOrder(c);
  },
);

/**
 * 根据 ID 获取会话组详情
 * GET /api/v1/session-groups/:id
 * 需要会话组读取权限
 */
SessionGroupRoutes.get(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看会话组详情',
  ),
  zValidator('param', SessionGroupIdParamSchema),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.getSessionGroupById(c);
  },
);

/**
 * 更新会话组
 * PUT /api/v1/session-groups/:id
 * 需要会话组更新权限
 */
SessionGroupRoutes.put(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_UPDATE', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限更新会话组',
  ),
  zValidator('param', SessionGroupIdParamSchema),
  zValidator('json', UpdateSessionGroupRequestSchema),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.updateSessionGroup(c);
  },
);

/**
 * 删除会话组
 * DELETE /api/v1/session-groups/:id
 * 需要会话组删除权限
 *
 * 行为说明:
 * - 删除指定的会话组
 * - 组内会话不会被删除，会自动变为未分组状态（groupId 设为 null）
 */
SessionGroupRoutes.delete(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_DELETE', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限删除会话组',
  ),
  zValidator('param', SessionGroupIdParamSchema),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.deleteSessionGroup(c);
  },
);

/**
 * 删除所有会话组
 * DELETE /api/v1/session-groups
 * 需要会话组删除权限
 */
SessionGroupRoutes.delete(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_DELETE', ['ALL', 'WORKSPACE']),
    '您没有权限删除所有会话组',
  ),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.deleteAllSessionGroups(c);
  },
);

export default SessionGroupRoutes;
