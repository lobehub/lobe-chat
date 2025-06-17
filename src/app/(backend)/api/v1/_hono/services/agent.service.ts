import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { AgentModel } from '@/database/models/agent';
import { NewAgent, agents, agentsToSessions } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  AgentDeleteRequest,
  AgentDetailResponse,
  AgentListResponse,
  CreateAgentRequest,
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
   * 获取系统中所有的 Agent 列表
   * @returns Agent 列表
   */
  async getAllAgents(): ServiceResult<AgentListResponse> {
    this.log('info', '获取系统中所有的 Agent 列表');

    try {
      // 直接使用数据库查询，获取所有 Agent
      const agentsList = await this.db.query.agents.findMany({
        orderBy: (agents, { desc }) => [desc(agents.createdAt)],
      });

      this.log('info', `查询到 ${agentsList.length} 个 Agent`);
      return agentsList;
    } catch (error) {
      this.log('error', '获取 Agent 列表失败', { error });
      throw this.createBusinessError('获取 Agent 列表失败');
    }
  }

  /**
   * 创建智能体
   * @param request 创建请求参数
   * @returns 创建完成的 Agent 信息
   */
  async createAgent(request: CreateAgentRequest): ServiceResult<AgentDetailResponse> {
    this.log('info', '创建智能体', { slug: request.slug, title: request.title });

    try {
      // 检查 slug 是否已存在
      const existingAgent = await this.db.query.agents.findFirst({
        where: eq(agents.slug, request.slug),
      });

      if (existingAgent) {
        throw this.createBusinessError(`Agent slug "${request.slug}" 已存在`);
      }

      // 准备创建数据
      const newAgentData: NewAgent = {
        accessedAt: new Date(),
        avatar: request.avatar || null,
        chatConfig: request.chatConfig || null,
        createdAt: new Date(),
        description: request.description || null,
        id: nanoid(),
        model: request.model || null,
        params: request.params ? JSON.stringify(request.params) : '{}',
        provider: request.provider || null,
        slug: request.slug,
        systemRole: request.systemRole || null,
        title: request.title,
        updatedAt: new Date(),
        userId: this.userId!,
      };

      // 插入数据库
      const [createdAgent] = await this.db.insert(agents).values(newAgentData).returning();

      this.log('info', 'Agent 创建成功', { id: createdAgent.id, slug: createdAgent.slug });
      return createdAgent;
    } catch (error) {
      this.log('error', '创建 Agent 失败', { error });
      if (error instanceof Error && error.message.includes('已存在')) {
        throw error;
      }
      throw this.createBusinessError('创建 Agent 失败');
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
      // 检查 Agent 是否存在
      const existingAgent = await this.db.query.agents.findFirst({
        where: eq(agents.id, request.id),
      });

      if (!existingAgent) {
        throw this.createBusinessError(`Agent ID "${request.id}" 不存在`);
      }

      // 如果修改了 slug，检查新的 slug 是否已被其他 Agent 使用
      if (request.slug !== existingAgent.slug) {
        const slugConflict = await this.db.query.agents.findFirst({
          where: eq(agents.slug, request.slug),
        });

        if (slugConflict && slugConflict.id !== request.id) {
          throw this.createBusinessError(`Agent slug "${request.slug}" 已被其他 Agent 使用`);
        }
      }

      // 准备更新数据
      const updateData = {
        avatar: request.avatar || null,
        chatConfig: request.chatConfig || null,
        description: request.description || null,
        model: request.model || null,
        params: request.params ? JSON.stringify(request.params) : '{}',
        provider: request.provider || null,
        slug: request.slug,
        systemRole: request.systemRole || null,
        title: request.title,
        updatedAt: new Date(),
      };

      // 更新数据库
      const [updatedAgent] = await this.db
        .update(agents)
        .set(updateData)
        .where(eq(agents.id, request.id))
        .returning();

      this.log('info', 'Agent 更新成功', { id: updatedAgent.id, slug: updatedAgent.slug });
      return updatedAgent;
    } catch (error) {
      this.log('error', '更新 Agent 失败', { error });
      if (
        error instanceof Error &&
        (error.message.includes('不存在') || error.message.includes('已被'))
      ) {
        throw error;
      }
      throw this.createBusinessError('更新 Agent 失败');
    }
  }

  /**
   * 删除智能体
   * @param request 删除请求参数
   */
  async deleteAgent(request: AgentDeleteRequest): ServiceResult<void> {
    this.log('info', '删除智能体', { agentId: request.agentId, migrateTo: request.migrateTo });

    try {
      // 检查要删除的 Agent 是否存在
      const targetAgent = await this.db.query.agents.findFirst({
        where: eq(agents.id, request.agentId),
      });

      if (!targetAgent) {
        throw this.createBusinessError(`Agent ID "${request.agentId}" 不存在`);
      }

      // 如果指定了迁移目标，进行会话迁移
      if (request.migrateTo) {
        const migrateTarget = await this.db.query.agents.findFirst({
          where: eq(agents.id, request.migrateTo),
        });

        if (!migrateTarget) {
          throw this.createBusinessError(`迁移目标 Agent ID "${request.migrateTo}" 不存在`);
        }

        // 实现会话迁移逻辑
        await this.migrateAgentSessions(request.agentId, request.migrateTo);

        this.log('info', '会话迁移完成', {
          from: request.agentId,
          to: request.migrateTo,
        });
      }

      // 删除 Agent（级联删除会自动处理相关的关联表数据）
      await this.db.delete(agents).where(eq(agents.id, request.agentId));

      this.log('info', 'Agent 删除成功', { agentId: request.agentId });
    } catch (error) {
      this.log('error', '删除 Agent 失败', { error });
      if (error instanceof Error && error.message.includes('不存在')) {
        throw error;
      }
      throw this.createBusinessError('删除 Agent 失败');
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
      // 复用 AgentModel 的方法获取完整的 Agent 配置
      const agentModel = new AgentModel(this.db, this.userId!);
      const agent = await agentModel.getAgentConfigById(agentId);

      if (!agent || !agent.id) {
        this.log('warn', 'Agent 不存在', { agentId });
        return null;
      }

      return agent as AgentDetailResponse;
    } catch (error) {
      this.log('error', '获取 Agent 详情失败', { error });
      throw this.createBusinessError('获取 Agent 详情失败');
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
        // 查找所有关联到源 Agent 的会话
        const sessionRelations = await tx.query.agentsToSessions.findMany({
          where: eq(agentsToSessions.agentId, fromAgentId),
        });

        this.log('info', `找到 ${sessionRelations.length} 个会话需要迁移`);

        if (sessionRelations.length > 0) {
          // 删除旧的关联关系
          await tx.delete(agentsToSessions).where(eq(agentsToSessions.agentId, fromAgentId));

          // 创建新的关联关系
          const newRelations = sessionRelations.map((relation) => ({
            agentId: toAgentId,
            sessionId: relation.sessionId,
            userId: relation.userId,
          }));

          await tx.insert(agentsToSessions).values(newRelations);
        }
      });

      this.log('info', '会话迁移成功', { fromAgentId, toAgentId });
    } catch (error) {
      this.log('error', '会话迁移失败', { error });
      throw this.createBusinessError('会话迁移失败');
    }
  }
}
