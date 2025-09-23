import { and, count, desc, eq, ilike } from 'drizzle-orm';

import { AgentModel } from '@/database/models/agent';
import { NewAgent, agents, agentsToSessions } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { idGenerator, randomSlug } from '@/database/utils/idGenerator';

import { BaseService } from '../common/base.service';
import { processPaginationConditions } from '../helpers/pagination';
import { ServiceResult } from '../types';
import {
  AgentDeleteRequest,
  AgentDetailResponse,
  AgentListResponse,
  CreateAgentRequest,
  GetAgentsRequest,
  UpdateAgentRequest,
} from '../types/agent.type';

/**
 * Agent 服务实现类
 */
export class AgentService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * 获取用户的 Agent 列表
   * @param page 页码，从1开始
   * @param pageSize 每页数量，最大100
   * @returns 用户的 Agent 列表
   */
  async queryAgents(request: GetAgentsRequest): ServiceResult<AgentListResponse> {
    this.log('info', '获取系统中全部的 Agent 列表', { request });

    const { keyword } = request;

    try {
      const query = this.db.query.agents.findMany({
        ...processPaginationConditions(request),
        orderBy: desc(agents.createdAt),
        where: keyword ? ilike(agents.title, `%${keyword}%`) : undefined,
      });

      const countQuery = this.db
        .select({ count: count() })
        .from(agents)
        .where(keyword ? ilike(agents.title, `%${keyword}%`) : undefined);

      const [agentsList, totalResult] = await Promise.all([query, countQuery]);

      this.log('info', `查询到系统中 ${agentsList.length} 个 Agent`);

      return {
        agents: agentsList,
        total: totalResult[0]?.count ?? 0,
      };
    } catch (error) {
      this.handleServiceError(error, '获取 Agent 列表');
    }
  }

  /**
   * 创建智能体
   * @param request 创建请求参数
   * @returns 创建完成的 Agent 信息
   */
  async createAgent(request: CreateAgentRequest): ServiceResult<AgentDetailResponse> {
    this.log('info', '创建智能体', { title: request.title });

    try {
      return await this.db.transaction(async (tx) => {
        // 准备创建数据
        const newAgentData: NewAgent = {
          accessedAt: new Date(),
          avatar: request.avatar || null,
          chatConfig: request.chatConfig || null,
          createdAt: new Date(),
          description: request.description || null,
          id: idGenerator('agents'),
          model: request.model || null,
          params: request.params ? JSON.stringify(request.params) : '{}',
          provider: request.provider || null,
          slug: randomSlug(4), // 系统自动生成 slug
          systemRole: request.systemRole || null,
          title: request.title,
          updatedAt: new Date(),
          userId: this.userId,
        };

        // 插入数据库
        const [createdAgent] = await tx.insert(agents).values(newAgentData).returning();
        this.log('info', 'Agent 创建成功', { id: createdAgent.id, slug: createdAgent.slug });

        return createdAgent;
      });
    } catch (error) {
      this.handleServiceError(error, '创建 Agent');
    }
  }

  /**
   * 更新智能体
   * @param request 更新请求参数
   * @returns 更新后的 Agent 信息
   */
  async updateAgent(request: UpdateAgentRequest): ServiceResult<AgentDetailResponse> {
    this.log('info', '更新智能体', { id: request.id, title: request.title });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('AGENT_UPDATE', {
        targetAgentId: request.id,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权更新此 Agent');
      }

      return await this.db.transaction(async (tx) => {
        // 构建查询条件
        const whereConditions = [eq(agents.id, request.id)];
        if (permissionResult.condition?.userId) {
          whereConditions.push(eq(agents.userId, permissionResult.condition.userId));
        }

        // 检查 Agent 是否存在
        const existingAgent = await tx.query.agents.findFirst({
          where: and(...whereConditions),
        });

        if (!existingAgent) {
          throw this.createBusinessError(`Agent ID "${request.id}" 不存在`);
        }

        // 准备更新数据
        const updateData = {
          avatar: request.avatar || null,
          chatConfig: request.chatConfig || null,
          description: request.description || null,
          model: request.model || null,
          params: request.params ? JSON.stringify(request.params) : '{}',
          provider: request.provider || null,
          systemRole: request.systemRole || null,
          title: request.title,
          updatedAt: new Date(),
        };

        // 更新数据库
        const [updatedAgent] = await tx
          .update(agents)
          .set(updateData)
          .where(and(...whereConditions))
          .returning();

        this.log('info', 'Agent 更新成功', { id: updatedAgent.id, slug: updatedAgent.slug });
        return updatedAgent;
      });
    } catch (error) {
      this.handleServiceError(error, '更新 Agent');
    }
  }

  /**
   * 删除智能体
   * @param request 删除请求参数
   */
  async deleteAgent(request: AgentDeleteRequest): ServiceResult<void> {
    this.log('info', '删除智能体', {
      agentId: request.agentId,
      migrateSessionTo: request.migrateSessionTo,
    });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('AGENT_DELETE', {
        targetAgentId: request.agentId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权删除此 Agent');
      }

      // 检查要删除的 Agent 是否存在
      const targetAgent = await this.db.query.agents.findFirst({
        where: eq(agents.id, request.agentId),
      });

      if (!targetAgent) {
        throw this.createBusinessError(`Agent ID ${request.agentId} 不存在`);
      }

      // 如果指定了迁移目标，进行会话迁移
      if (request.migrateSessionTo) {
        const migrateTarget = await this.db.query.agents.findFirst({
          where: eq(agents.id, request.migrateSessionTo),
        });

        if (!migrateTarget) {
          throw this.createBusinessError(`迁移目标 Agent ID ${request.migrateSessionTo} 不存在`);
        }

        // 实现会话迁移逻辑
        await this.migrateAgentSessions(request.agentId, request.migrateSessionTo);

        this.log('info', '会话迁移完成', {
          from: request.agentId,
          to: request.migrateSessionTo,
        });
      }

      // 删除 Agent（级联删除会自动处理相关的关联表数据）
      await this.db.delete(agents).where(eq(agents.id, request.agentId));

      this.log('info', 'Agent 删除成功', { agentId: request.agentId });
    } catch (error) {
      this.handleServiceError(error, '删除 Agent');
    }
  }

  /**
   * 根据 ID 获取 Agent 详情
   * @param agentId Agent ID
   * @returns Agent 详情
   */
  async getAgentById(agentId: string): ServiceResult<AgentDetailResponse | null> {
    this.log('info', '根据 ID 获取 Agent 详情', { agentId });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('AGENT_READ', {
        targetAgentId: agentId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问此 Agent');
      }

      // 复用 AgentModel 的方法获取完整的 Agent 配置
      const agentModel = new AgentModel(this.db, this.userId!);
      const agent = await agentModel.getAgentConfigById(agentId);

      if (!agent || !agent.id) {
        this.log('warn', 'Agent 不存在', { agentId });
        return null;
      }

      return agent as AgentDetailResponse;
    } catch (error) {
      this.handleServiceError(error, '获取 Agent 详情');
    }
  }

  /**
   * 迁移 Agent 的会话到另一个 Agent
   * @param fromAgentId 源 Agent ID
   * @param toAgentId 目标 Agent ID
   * @private
   */
  private async migrateAgentSessions(fromAgentId: string, toAgentId: string): Promise<void> {
    this.log('info', '开始迁移会话', { fromAgentId, toAgentId });

    try {
      // 使用数据库事务确保数据一致性
      await this.db.transaction(async (tx) => {
        this.log('info', '开始迁移会话', { fromAgentId, toAgentId });

        await tx
          .update(agentsToSessions)
          .set({ agentId: toAgentId })
          .where(eq(agentsToSessions.agentId, fromAgentId));

        this.log('info', '迁移会话完成');
      });

      this.log('info', '会话迁移成功', { fromAgentId, toAgentId });
    } catch (error) {
      this.handleServiceError(error, '会话迁移');
    }
  }
}
