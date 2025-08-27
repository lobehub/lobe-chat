import { and, desc, eq, inArray } from 'drizzle-orm';

import { AgentModel } from '@/database/models/agent';
import { NewAgent, agents, agentsToSessions, sessions } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { idGenerator, randomSlug } from '@/database/utils/idGenerator';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  AgentDeleteRequest,
  AgentDetailResponse,
  AgentListItem,
  AgentListResponse,
  AgentSessionBatchLinkRequest,
  AgentSessionLinkRequest,
  AgentSessionRelation,
  BatchDeleteAgentsRequest,
  BatchOperationResult,
  BatchUpdateAgentsRequest,
  CreateAgentRequest,
  CreateSessionForAgentRequest,
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
   * @returns 用户的 Agent 列表
   */
  async getAllAgents(): ServiceResult<AgentListResponse> {
    this.log('info', '获取用户的 Agent 列表', { userId: this.userId });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_READ', 'ALL');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问 Agent 列表');
      }

      // 按用户ID过滤，确保数据隔离
      const agentsList = (await this.db.query.agents.findMany({
        orderBy: desc(agents.createdAt),
        with: {
          agentsToSessions: {
            with: {
              session: {
                columns: {
                  id: true,
                  title: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      })) as AgentListItem[];

      this.log('info', `查询到用户 ${this.userId} 的 ${agentsList.length} 个 Agent`);

      return agentsList;
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
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_CREATE', this.userId);

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权创建 Agent');
      }

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
          userId: this.userId!,
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
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_UPDATE', {
        targetAgentId: request.id,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权更新此 Agent');
      }

      return await this.db.transaction(async (tx) => {
        // 检查 Agent 是否存在
        const existingAgent = await tx.query.agents.findFirst({
          where: and(eq(agents.id, request.id)),
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
          .where(and(eq(agents.id, request.id), eq(agents.userId, this.userId!)))
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
    this.log('info', '删除智能体', { agentId: request.agentId, migrateTo: request.migrateTo });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_DELETE', {
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
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_READ', {
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
   * 根据 Session ID 获取关联的 Agent 详情
   * @param sessionId Session ID
   * @returns Agent 详情
   */
  async getAgentBySessionId(sessionId: string): ServiceResult<AgentDetailResponse | null> {
    this.log('info', '根据 Session ID 获取 Agent 详情', { sessionId });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_READ', {
        targetSessionId: sessionId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问此会话');
      }

      // 查找 session 是否存在且属于当前用户
      const session = await this.db.query.sessions.findFirst({
        where: and(
          eq(sessions.id, sessionId),
          permissionResult.condition?.userId
            ? eq(sessions.userId, permissionResult.condition.userId)
            : undefined,
        ),
      });

      if (!session) {
        this.log('warn', 'Session 不存在', { sessionId });
        return null;
      }

      // 查找关联的 Agent
      const agentModel = new AgentModel(this.db, this.userId!);
      const agent = await agentModel.findBySessionId(sessionId);

      if (!agent || !agent.id) {
        this.log('warn', 'Session 没有关联的 Agent', { sessionId });
        return null;
      }

      return agent as AgentDetailResponse;
    } catch (error) {
      this.handleServiceError(error, '根据 Session ID 获取 Agent 详情');
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
      this.handleServiceError(error, '会话迁移');
    }
  }

  /**
   * 为 Agent 创建新的 Session
   * @param request 创建请求参数
   * @returns 新创建的 Session ID
   */
  async createSessionForAgent(request: CreateSessionForAgentRequest): ServiceResult<string> {
    this.log('info', '为 Agent 创建 Session', { agentId: request.agentId });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_UPDATE', {
        targetAgentId: request.agentId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(
          permissionResult.message || '无权为此 Agent 创建 Session',
        );
      }

      return await this.db.transaction(async (tx) => {
        // 验证 Agent 存在
        const agent = await tx.query.agents.findFirst({
          where: and(eq(agents.id, request.agentId)),
        });

        if (!agent) {
          throw this.createNotFoundError(`Agent ID "${request.agentId}" 不存在`);
        }

        // 创建新的 Session
        const sessionId = idGenerator('sessions');
        const [newSession] = await tx
          .insert(sessions)
          .values({
            accessedAt: new Date(),
            avatar: request.avatar || agent.avatar,
            backgroundColor: request.backgroundColor || agent.backgroundColor,
            createdAt: new Date(),
            description: request.description,
            id: sessionId,
            slug: randomSlug(),
            title: request.title || `${agent.title} 的对话`,
            type: 'agent',
            updatedAt: new Date(),
            userId: this.userId!,
          })
          .returning();

        // 创建 Agent-Session 关联
        await tx.insert(agentsToSessions).values({
          agentId: request.agentId,
          sessionId: newSession.id,
          userId: this.userId!,
        });

        this.log('info', 'Agent Session 创建成功', {
          agentId: request.agentId,
          sessionId: newSession.id,
        });

        return newSession.id;
      });
    } catch (error) {
      this.handleServiceError(error, '为 Agent 创建 Session');
    }
  }

  /**
   * 获取 Agent 关联的所有 Session
   * @param agentId Agent ID
   * @returns Agent 关联的 Session 列表
   */
  async getAgentSessions(agentId: string): ServiceResult<AgentSessionRelation[]> {
    this.log('info', '获取 Agent 关联的 Session', { agentId });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_READ', {
        targetAgentId: agentId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(
          permissionResult.message || '无权访问此 Agent 的 Session',
        );
      }

      // 验证 Agent 存在
      const agent = await this.db.query.agents.findFirst({
        where: and(eq(agents.id, agentId)),
      });

      if (!agent) {
        throw this.createNotFoundError(`Agent ID "${agentId}" 不存在`);
      }

      // 查询关联的 Session
      const relations = (await this.db.query.agentsToSessions.findMany({
        where: and(
          eq(agentsToSessions.agentId, agentId),
          eq(agentsToSessions.userId, this.userId!),
        ),
        with: {
          session: {
            columns: {
              avatar: true,
              description: true,
              id: true,
              title: true,
              updatedAt: true,
            },
          },
        },
      })) as AgentSessionRelation[];

      const result = relations.map((rel) => ({
        agentId: rel.agentId,
        session: rel.session,
        sessionId: rel.sessionId,
      }));

      this.log('info', `查询到 Agent ${agentId} 关联的 ${result.length} 个 Session`);

      return result;
    } catch (error) {
      this.handleServiceError(error, '获取 Agent 关联的 Session');
    }
  }

  /**
   * 关联 Agent 和 Session
   * @param agentId Agent ID
   * @param request 关联请求参数
   */
  async linkAgentSession(agentId: string, request: AgentSessionLinkRequest): ServiceResult<void> {
    this.log('info', '关联 Agent 和 Session', { agentId, sessionId: request.sessionId });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_UPDATE', {
        targetAgentId: agentId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权关联此 Agent');
      }

      await this.db.transaction(async (tx) => {
        const [agent, session] = await Promise.all([
          tx.query.agents.findFirst({
            where: and(eq(agents.id, agentId)),
          }),
          tx.query.sessions.findFirst({
            where: and(eq(sessions.id, request.sessionId)),
          }),
        ]);

        if (!agent) {
          throw this.createNotFoundError(`Agent ID "${agentId}" 不存在`);
        }

        if (!session) {
          throw this.createNotFoundError(`Session ID "${request.sessionId}" 不存在`);
        }

        // 检查是否已经关联
        const existingRelation = await tx.query.agentsToSessions.findFirst({
          where:
            eq(agentsToSessions.agentId, agentId) &&
            eq(agentsToSessions.sessionId, request.sessionId),
        });

        if (existingRelation) {
          throw this.createBusinessError('Agent 和 Session 已经关联');
        }

        // 创建关联
        await tx.insert(agentsToSessions).values({
          agentId,
          sessionId: request.sessionId,
          userId: this.userId!,
        });

        this.log('info', 'Agent Session 关联成功', { agentId, sessionId: request.sessionId });
      });
    } catch (error) {
      this.handleServiceError(error, '关联 Agent 和 Session');
    }
  }

  /**
   * 取消 Agent 和 Session 的关联
   * @param agentId Agent ID
   * @param sessionId Session ID
   */
  async unlinkAgentSession(agentId: string, sessionId: string): ServiceResult<void> {
    this.log('info', '取消 Agent 和 Session 关联', { agentId, sessionId });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_UPDATE', {
        targetAgentId: agentId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权取消此 Agent 的关联');
      }

      await this.db.transaction(async (tx) => {
        // 验证关联关系存在且属于当前用户
        const relation = await tx.query.agentsToSessions.findFirst({
          where:
            eq(agentsToSessions.agentId, agentId) &&
            eq(agentsToSessions.sessionId, sessionId) &&
            eq(agentsToSessions.userId, this.userId!),
        });

        if (!relation) {
          throw this.createNotFoundError('Agent 和 Session 的关联关系不存在');
        }

        // 删除关联
        await tx
          .delete(agentsToSessions)
          .where(
            eq(agentsToSessions.agentId, agentId) &&
              eq(agentsToSessions.sessionId, sessionId) &&
              eq(agentsToSessions.userId, this.userId!),
          );

        this.log('info', 'Agent Session 关联取消成功', { agentId, sessionId });
      });
    } catch (error) {
      this.handleServiceError(error, '取消 Agent Session 关联');
    }
  }

  /**
   * 批量关联 Agent 和多个 Session
   * @param agentId Agent ID
   * @param request 批量关联请求参数
   */
  async batchLinkAgentSessions(
    agentId: string,
    request: AgentSessionBatchLinkRequest,
  ): ServiceResult<void> {
    this.log('info', '批量关联 Agent 和 Session', {
      agentId,
      sessionCount: request.sessionIds.length,
    });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('AGENT_UPDATE', {
        targetAgentId: agentId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权批量关联此 Agent');
      }

      await this.db.transaction(async (tx) => {
        // 验证 Agent 存在
        const agent = await tx.query.agents.findFirst({
          where: and(eq(agents.id, agentId)),
        });

        if (!agent) {
          throw this.createNotFoundError(`Agent ID "${agentId}" 不存在`);
        }

        // 验证所有 Session 都存在
        const validSessions = await tx.query.sessions.findMany({
          columns: { id: true },
          where: and(inArray(sessions.id, request.sessionIds)),
        });

        const validSessionIds = new Set(validSessions.map((s) => s.id));
        const invalidSessionIds = request.sessionIds.filter((id) => !validSessionIds.has(id));

        if (invalidSessionIds.length > 0) {
          throw this.createNotFoundError(`以下 Session 不存在: ${invalidSessionIds.join(', ')}`);
        }

        // 检查已存在的关联
        const existingRelations = await tx.query.agentsToSessions.findMany({
          columns: { sessionId: true },
          where: and(
            eq(agentsToSessions.agentId, agentId),
            eq(agentsToSessions.userId, this.userId!),
            inArray(agentsToSessions.sessionId, request.sessionIds),
          ),
        });

        const existingSessionIds = existingRelations.map((r) => r.sessionId);
        const newSessionIds = request.sessionIds.filter((id) => !existingSessionIds.includes(id));

        if (newSessionIds.length === 0) {
          throw this.createBusinessError('所有指定的 Session 都已经与该 Agent 关联');
        }

        // 批量创建关联
        const relationData = newSessionIds.map((sessionId) => ({
          agentId,
          sessionId,
          userId: this.userId!,
        }));

        await tx.insert(agentsToSessions).values(relationData);

        this.log('info', 'Agent Session 批量关联成功', {
          agentId,
          newRelations: newSessionIds.length,
          skippedExisting: existingSessionIds.length,
        });
      });
    } catch (error) {
      this.handleServiceError(error, '批量关联 Agent 和 Session');
    }
  }

  /**
   * 批量删除 Agent
   * @param request 批量删除请求参数
   * @returns 批量操作结果
   */
  async batchDeleteAgents(request: BatchDeleteAgentsRequest): ServiceResult<BatchOperationResult> {
    this.log('info', '批量删除 Agent', {
      agentCount: request.agentIds.length,
      migrateTo: request.migrateTo,
    });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveBatchQueryPermission('AGENT_DELETE', {
        targetAgentId: request.agentIds,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权批量删除 Agent');
      }

      const result: BatchOperationResult = {
        errors: [],
        failed: 0,
        success: 0,
        total: request.agentIds.length,
      };

      return await this.db.transaction(async (tx) => {
        // 验证迁移目标 Agent（如果指定）
        if (request.migrateTo) {
          const migrateTarget = await tx.query.agents.findFirst({
            where: and(eq(agents.id, request.migrateTo)),
          });

          if (!migrateTarget) {
            throw this.createNotFoundError(`迁移目标 Agent ID "${request.migrateTo}" 不存在`);
          }
        }

        // 批量处理每个 Agent
        for (const agentId of request.agentIds) {
          try {
            // 检查 Agent 是否存在
            const agent = await tx.query.agents.findFirst({
              where: and(eq(agents.id, agentId)),
            });

            if (!agent) {
              result.failed++;
              result.errors?.push({
                error: `Agent ID "${agentId}" 不存在`,
                id: agentId,
              });
              continue;
            }

            // 如果需要迁移会话
            if (request.migrateTo) {
              await this.migrateAgentSessions(agentId, request.migrateTo);
            }

            // 删除 Agent
            await tx
              .delete(agents)
              .where(and(eq(agents.id, agentId), eq(agents.userId, this.userId!)));

            result.success++;
            this.log('info', 'Agent 删除成功', { agentId });
          } catch (error) {
            result.failed++;
            result.errors?.push({
              error: error instanceof Error ? error.message : '删除失败',
              id: agentId,
            });
            this.log('error', 'Agent 删除失败', { agentId, error });
          }
        }

        this.log('info', '批量删除 Agent 完成', {
          failed: result.failed,
          success: result.success,
          total: result.total,
        });

        return result;
      });
    } catch (error) {
      this.handleServiceError(error, '批量删除 Agent');
    }
  }

  /**
   * 批量更新 Agent
   * @param request 批量更新请求参数
   * @returns 批量操作结果
   */
  async batchUpdateAgents(request: BatchUpdateAgentsRequest): ServiceResult<BatchOperationResult> {
    this.log('info', '批量更新 Agent', { agentCount: request.agentIds.length });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 权限校验
      const permissionResult = await this.resolveBatchQueryPermission('AGENT_UPDATE', {
        targetAgentId: request.agentIds,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权批量更新 Agent');
      }

      const result: BatchOperationResult = {
        errors: [],
        failed: 0,
        success: 0,
        total: request.agentIds.length,
      };

      return await this.db.transaction(async (tx) => {
        // 批量处理每个 Agent
        for (const agentId of request.agentIds) {
          try {
            // 检查 Agent 是否存在
            const agent = await tx.query.agents.findFirst({
              where: and(eq(agents.id, agentId)),
            });

            if (!agent) {
              result.failed++;
              result.errors?.push({
                error: `Agent ID "${agentId}" 不存在`,
                id: agentId,
              });
              continue;
            }

            // 准备更新数据
            const updateData = {
              ...request.updateData,
              updatedAt: new Date(),
            };

            // 更新 Agent
            await tx
              .update(agents)
              .set(updateData)
              .where(and(eq(agents.id, agentId), eq(agents.userId, this.userId!)));

            result.success++;
            this.log('info', 'Agent 更新成功', { agentId });
          } catch (error) {
            result.failed++;
            result.errors?.push({
              error: error instanceof Error ? error.message : '更新失败',
              id: agentId,
            });
            this.log('error', 'Agent 更新失败', { agentId, error });
          }
        }

        this.log('info', '批量更新 Agent 完成', {
          failed: result.failed,
          success: result.success,
          total: result.total,
        });

        return result;
      });
    } catch (error) {
      this.handleServiceError(error, '批量更新 Agent');
    }
  }
}
