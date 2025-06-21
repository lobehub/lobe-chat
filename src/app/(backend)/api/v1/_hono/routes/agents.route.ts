import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { RBAC_PERMISSIONS } from '@/const/rbac';
import { getScopePermissions } from '@/utils/rbac';

import { AgentController } from '../controllers/agent.controller';
import { requireAuth } from '../middleware/oidc-auth';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  AgentIdParamSchema,
  CreateAgentRequestSchema,
  UpdateAgentRequestSchema,
} from '../types/agent.type';

// Agent 相关路由
const AgentRoutes = new Hono();

/**
 * 获取系统中所有的 Agent 列表
 * GET /api/v1/agents
 * 需要 Agent 读取权限
 */
AgentRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('AGENT_READ', ['ALL', 'WORKSPACE']),
    '您没有权限查看 Agent 列表',
  ),
  async (c) => {
    const controller = new AgentController();
    return await controller.getAllAgents(c);
  },
);

/**
 * 创建智能体
 * POST /api/v1/agents
 * 需要 Agent 创建权限（仅管理员）
 */
AgentRoutes.post(
  '/',
  requireAuth,
  requireAnyPermission([RBAC_PERMISSIONS.AGENT_CREATE_ALL], '您没有权限创建 Agent'),
  zValidator('json', CreateAgentRequestSchema),
  async (c) => {
    const controller = new AgentController();
    return await controller.createAgent(c);
  },
);

/**
 * 更新智能体
 * PUT /api/v1/agents/:id
 * 需要 Agent 更新权限（仅管理员）
 */
AgentRoutes.put(
  '/:id',
  requireAuth,
  requireAnyPermission([RBAC_PERMISSIONS.AGENT_UPDATE_ALL], '您没有权限更新 Agent'),
  zValidator('param', AgentIdParamSchema),
  zValidator('json', UpdateAgentRequestSchema),
  async (c) => {
    const controller = new AgentController();
    return await controller.updateAgent(c);
  },
);

/**
 * 删除智能体
 * DELETE /api/v1/agents/:id
 * 需要 Agent 删除权限（仅管理员）
 */
AgentRoutes.delete(
  '/:id',
  requireAuth,
  requireAnyPermission([RBAC_PERMISSIONS.AGENT_DELETE_ALL], '您没有权限删除 Agent'),
  zValidator('param', AgentIdParamSchema),
  async (c) => {
    const controller = new AgentController();
    return await controller.deleteAgent(c);
  },
);

/**
 * 根据 ID 获取 Agent 详情
 * GET /api/v1/agents/:id
 * 需要 Agent 读取权限
 */
AgentRoutes.get(
  '/:id',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('AGENT_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看 Agent 详情',
  ),
  zValidator('param', AgentIdParamSchema),
  async (c) => {
    const controller = new AgentController();
    return await controller.getAgentById(c);
  },
);

export default AgentRoutes;
