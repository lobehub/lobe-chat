import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { getScopePermissions } from '@/utils/rbac';

import { SessionController } from '../controllers/session.controller';
import { SessionGroupController } from '../controllers/sessionGroup.controller';
import { requireAuth } from '../middleware/oidc-auth';
import { requireAnyPermission } from '../middleware/permission-check';

// 参数校验 Schema
const createSessionSchema = z.object({
  avatar: z.string().optional(),
  backgroundColor: z.string().optional(),
  config: z.object({}).passthrough().optional(),
  description: z.string().optional(),
  groupId: z.string().optional(),
  meta: z.object({}).passthrough().optional(),
  pinned: z.boolean().optional(),
  title: z.string().optional(),
  type: z.enum(['agent', 'group']).optional(),
});

const updateSessionSchema = z.object({
  avatar: z.string().optional(),
  backgroundColor: z.string().optional(),
  description: z.string().optional(),
  groupId: z.string().optional(),
  pinned: z.boolean().optional(),
  title: z.string().optional(),
});

const updateSessionConfigSchema = z.object({
  config: z.object({}).passthrough().optional(),
  meta: z.object({}).passthrough().optional(),
});

const cloneSessionSchema = z.object({
  newTitle: z.string().min(1, '新标题不能为空'),
});

const createSessionGroupSchema = z.object({
  name: z.string().min(1, '会话组名称不能为空'),
  sort: z.number().optional(),
});

const updateSessionGroupSchema = z.object({
  name: z.string().min(1, '会话组名称不能为空').optional(),
  sort: z.number().optional(),
});

const updateSessionGroupOrderSchema = z.object({
  sortMap: z.array(
    z.object({
      id: z.string(),
      sort: z.number(),
    }),
  ),
});

// Sessions 相关路由
const SessionRoutes = new Hono();

// ==================== Session 管理接口 ====================

/**
 * 获取会话列表
 * GET /api/v1/sessions/list
 * 需要会话读取权限
 */
SessionRoutes.get(
  '/list',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看会话列表',
  ),
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
  async (c) => {
    const controller = new SessionController();
    return await controller.searchSessions(c);
  },
);

/**
 * 获取会话排行
 * GET /api/v1/sessions/rank
 * 需要会话读取权限
 */
SessionRoutes.get(
  '/rank',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看会话排行',
  ),
  async (c) => {
    const controller = new SessionController();
    return await controller.rankSessions(c);
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
  async (c) => {
    const controller = new SessionController();
    return await controller.countSessions(c);
  },
);

/**
 * 创建会话
 * POST /api/v1/sessions/create
 * 需要会话创建权限
 */
SessionRoutes.post(
  '/create',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_CREATE', ['ALL', 'WORKSPACE']),
    '您没有权限创建会话',
  ),
  zValidator('json', createSessionSchema),
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
  zValidator('json', updateSessionSchema),
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
  zValidator('json', updateSessionConfigSchema),
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
  zValidator('json', cloneSessionSchema),
  async (c) => {
    const controller = new SessionController();
    return await controller.cloneSession(c);
  },
);

/**
 * 删除所有会话
 * DELETE /api/v1/sessions/all
 * 需要会话删除权限
 */
SessionRoutes.delete(
  '/all',
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

// ==================== SessionGroup 管理接口 ====================

/**
 * 获取会话组列表
 * GET /api/v1/sessions/groups
 * 需要会话组读取权限
 */
SessionRoutes.get(
  '/groups',
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
 * POST /api/v1/sessions/groups/create
 * 需要会话组创建权限
 */
SessionRoutes.post(
  '/groups/create',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_CREATE', ['ALL', 'WORKSPACE']),
    '您没有权限创建会话组',
  ),
  zValidator('json', createSessionGroupSchema),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.createSessionGroup(c);
  },
);

/**
 * 更新会话组排序
 * PUT /api/v1/sessions/groups/order
 * 需要会话组更新权限
 */
SessionRoutes.put(
  '/groups/order',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_UPDATE', ['ALL', 'WORKSPACE']),
    '您没有权限更新会话组排序',
  ),
  zValidator('json', updateSessionGroupOrderSchema),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.updateSessionGroupOrder(c);
  },
);

/**
 * 删除所有会话组
 * DELETE /api/v1/sessions/groups/all
 * 需要会话组删除权限
 */
SessionRoutes.delete(
  '/groups/all',
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

/**
 * 根据 ID 获取会话组详情
 * GET /api/v1/sessions/groups/:id
 * 需要会话组读取权限
 */
SessionRoutes.get(
  '/groups/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看会话组详情',
  ),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.getSessionGroupById(c);
  },
);

/**
 * 更新会话组
 * PUT /api/v1/sessions/groups/:id
 * 需要会话组更新权限
 */
SessionRoutes.put(
  '/groups/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_UPDATE', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限更新会话组',
  ),
  zValidator('json', updateSessionGroupSchema),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.updateSessionGroup(c);
  },
);

/**
 * 删除会话组
 * DELETE /api/v1/sessions/groups/:id
 * 需要会话组删除权限
 */
SessionRoutes.delete(
  '/groups/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('SESSION_GROUP_DELETE', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限删除会话组',
  ),
  async (c) => {
    const controller = new SessionGroupController();
    return await controller.deleteSessionGroup(c);
  },
);

export default SessionRoutes;
