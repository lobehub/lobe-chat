import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { SessionController } from '../controllers/session.controller';
import { requireAuth } from '../middleware/oidc-auth';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  CloneSessionRequestSchema,
  CountSessionsRequestSchema,
  CreateSessionRequestSchema,
  GetSessionsRequestSchema,
  SearchSessionsRequestSchema,
  SessionIdParamSchema,
  UpdateSessionConfigRequestSchema,
  UpdateSessionRequestSchema,
} from '../types/session.type';

// Sessions 相关路由
const SessionRoutes = new Hono();

// ==================== Session 管理接口 ====================

/**
 * 获取会话列表
 * GET /api/v1/sessions
 * 需要会话读取权限
 */
SessionRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看会话列表',
  ),
  zValidator('query', GetSessionsRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.getSessions(c);
  },
);

/**
 * 获取分组的会话列表
 * GET /api/v1/sessions/grouped
 * 需要会话读取权限
 */
SessionRoutes.get(
  '/grouped',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看分组会话列表',
  ),
  async (c) => {
    const controller = new SessionController();
    return await controller.getGroupedSessions(c);
  },
);

/**
 * 搜索会话
 * GET /api/v1/sessions/search
 * 需要会话读取权限
 */
SessionRoutes.get(
  '/search',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限搜索会话',
  ),
  zValidator('query', SearchSessionsRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.searchSessions(c);
  },
);

/**
 * 统计会话数量
 * GET /api/v1/sessions/count
 * 需要会话读取权限
 */
SessionRoutes.get(
  '/count',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看会话统计',
  ),
  zValidator('query', CountSessionsRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.countSessions(c);
  },
);

/**
 * 创建会话
 * POST /api/v1/sessions
 * 需要会话创建权限
 */
SessionRoutes.post(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_CREATE', ['ALL', 'WORKSPACE']),
    '您没有权限创建会话',
  ),
  zValidator('json', CreateSessionRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.createSession(c);
  },
);

/**
 * 根据 ID 获取会话详情
 * GET /api/v1/sessions/:id
 * 需要会话读取权限
 */
SessionRoutes.get(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看会话详情',
  ),
  zValidator('param', SessionIdParamSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.getSessionById(c);
  },
);

/**
 * 获取会话配置
 * GET /api/v1/sessions/:id/config
 * 需要会话读取权限
 */
SessionRoutes.get(
  '/:id/config',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看会话配置',
  ),
  zValidator('param', SessionIdParamSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.getSessionConfig(c);
  },
);

/**
 * 更新会话
 * PUT /api/v1/sessions/:id
 * 需要会话更新权限
 */
SessionRoutes.put(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_UPDATE', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限更新会话',
  ),
  zValidator('param', SessionIdParamSchema),
  zValidator('json', UpdateSessionRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.updateSession(c);
  },
);

/**
 * 更新会话配置
 * PUT /api/v1/sessions/:id/config
 * 需要会话更新权限
 */
SessionRoutes.put(
  '/:id/config',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_UPDATE', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限更新会话配置',
  ),
  zValidator('param', SessionIdParamSchema),
  zValidator('json', UpdateSessionConfigRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.updateSessionConfig(c);
  },
);

/**
 * 删除会话
 * DELETE /api/v1/sessions/:id
 * 需要会话删除权限
 */
SessionRoutes.delete(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_DELETE', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限删除会话',
  ),
  zValidator('param', SessionIdParamSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.deleteSession(c);
  },
);

/**
 * 克隆会话
 * POST /api/v1/sessions/:id/clone
 * 需要会话创建权限
 */
SessionRoutes.post(
  '/:id/clone',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_CREATE', ['ALL', 'WORKSPACE']),
    '您没有权限克隆会话',
  ),
  zValidator('param', SessionIdParamSchema),
  zValidator('json', CloneSessionRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.cloneSession(c);
  },
);

/**
 * 删除所有会话
 * DELETE /api/v1/sessions
 * 需要会话删除权限
 */
SessionRoutes.delete(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_DELETE', ['ALL', 'WORKSPACE']),
    '您没有权限删除所有会话',
  ),
  async (c) => {
    const controller = new SessionController();
    return await controller.deleteAllSessions(c);
  },
);

export default SessionRoutes;
