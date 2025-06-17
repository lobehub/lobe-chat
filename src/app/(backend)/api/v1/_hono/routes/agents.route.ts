import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { RBAC_PERMISSIONS } from '@/const/rbac';
import { getScopePermissions } from '@/utils/rbac';

import { AgentController } from '../controllers/agent.controller';
import { requireAuth } from '../middleware/oidc-auth';
import { requireAnyPermission } from '../middleware/permission-check';

// 参数校验 Schema
const createAgentSchema = z.object({
  avatar: z.string().optional(),
  chatConfig: z
    .object({
      autoCreateTopicThreshold: z.number(),
      disableContextCaching: z.boolean().optional(),
      displayMode: z.enum(['chat', 'docs']).optional(),
      enableAutoCreateTopic: z.boolean().optional(),
      enableCompressHistory: z.boolean().optional(),
      enableHistoryCount: z.boolean().optional(),
      enableMaxTokens: z.boolean().optional(),
      enableReasoning: z.boolean().optional(),
      enableReasoningEffort: z.boolean().optional(),
      historyCount: z.number().optional(),
      reasoningBudgetToken: z.number().optional(),
      reasoningEffort: z.enum(['low', 'medium', 'high']).optional(),
      searchFCModel: z.string().optional(),
      searchMode: z.enum(['disabled', 'enabled']).optional(),
      useModelBuiltinSearch: z.boolean().optional(),
    })
    .optional(),
  description: z.string().optional(),
  model: z.string().optional(),
  params: z.record(z.unknown()).optional(),
  provider: z.string().optional(),
  slug: z.string().min(1, 'slug 不能为空'),
  systemRole: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
});

const updateAgentSchema = createAgentSchema.extend({
  id: z.string().min(1, 'Agent ID 不能为空'),
});

const deleteAgentSchema = z.object({
  agentId: z.string().min(1, 'Agent ID 不能为空'),
  migrateTo: z.string().optional(),
});

// Agent 相关路由
const AgentRoutes = new Hono();

/**
 * 获取系统中所有的 Agent 列表
 * GET /api/v1/agents/list
 * 需要 Agent 读取权限
 */
AgentRoutes.get(
  '/list',
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
 * POST /api/v1/agents/create
 * 需要 Agent 创建权限（仅管理员）
 */
AgentRoutes.post(
  '/create',
  requireAuth,
  requireAnyPermission([RBAC_PERMISSIONS.AGENT_CREATE_ALL], '您没有权限创建 Agent'),
  zValidator('json', createAgentSchema),
  async (c) => {
    const controller = new AgentController();
    return await controller.createAgent(c);
  },
);

/**
 * 更新智能体
 * PUT /api/v1/agents/update
 * 需要 Agent 更新权限（仅管理员）
 */
AgentRoutes.put(
  '/update',
  requireAuth,
  requireAnyPermission([RBAC_PERMISSIONS.AGENT_UPDATE_ALL], '您没有权限更新 Agent'),
  zValidator('json', updateAgentSchema),
  async (c) => {
    const controller = new AgentController();
    return await controller.updateAgent(c);
  },
);

/**
 * 删除智能体
 * DELETE /api/v1/agents/delete
 * 需要 Agent 删除权限（仅管理员）
 */
AgentRoutes.delete(
  '/delete',
  requireAuth,
  requireAnyPermission([RBAC_PERMISSIONS.AGENT_DELETE_ALL], '您没有权限删除 Agent'),
  zValidator('json', deleteAgentSchema),
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
  async (c) => {
    const controller = new AgentController();
    return await controller.getAgentById(c);
  },
);

export default AgentRoutes;
