import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getAllScopePermissions } from '@/utils/rbac';

import { SessionController } from '../controllers/session.controller';
import { requireAuth } from '../middleware/auth';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  CreateSessionRequestSchema,
  GetSessionsRequestSchema,
  NewBatchUpdateSessionsRequestSchema,
  SessionIdParamSchema,
  SessionsGroupsRequestSchema,
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
  requireAnyPermission(getAllScopePermissions('SESSION_READ'), '您没有权限查看会话列表'),
  zValidator('query', GetSessionsRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.getSessions(c);
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
  requireAnyPermission(getAllScopePermissions('SESSION_CREATE'), '您没有权限创建会话'),
  zValidator('json', CreateSessionRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.createSession(c);
  },
);

/**
 * 获取分组会话列表 (按Agent分组)
 * GET /api/v1/sessions/groups?groupBy=agent
 * 需要会话读取权限
 */
SessionRoutes.get(
  '/groups',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('SESSION_READ'), '您没有权限查看分组会话'),
  zValidator('query', SessionsGroupsRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.getSessionsGroups(c);
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
  requireAnyPermission(getAllScopePermissions('SESSION_READ'), '您没有权限查看会话详情'),
  zValidator('param', SessionIdParamSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.getSessionById(c);
  },
);

/**
 * 批量更新会话 (RESTful)
 * PATCH /api/v1/sessions
 * 需要会话更新权限
 */
SessionRoutes.patch(
  '/',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('SESSION_UPDATE'), '您没有权限批量更新会话'),
  zValidator('json', NewBatchUpdateSessionsRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.batchUpdateSessions(c);
  },
);

/**
 * 更新会话 (RESTful)
 * PATCH /api/v1/sessions/:id
 * 需要会话更新权限
 */
SessionRoutes.patch(
  '/:id',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('SESSION_UPDATE'), '您没有权限更新会话'),
  zValidator('param', SessionIdParamSchema),
  zValidator('json', UpdateSessionRequestSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.updateSession(c);
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
  requireAnyPermission(getAllScopePermissions('SESSION_DELETE'), '您没有权限删除会话'),
  zValidator('param', SessionIdParamSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.deleteSession(c);
  },
);

export default SessionRoutes;
