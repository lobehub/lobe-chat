import { and, count, desc, eq, ilike, inArray } from 'drizzle-orm';

import { SessionModel } from '@/database/models/session';
import { agents, agentsToSessions, messages, sessions } from '@/database/schemas';
import { users } from '@/database/schemas/user';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  BatchGetSessionsResponse,
  BatchUpdateSessionsRequest,
  CloneSessionRequest,
  CreateSessionRequest,
  GetSessionsRequest,
  SessionDetailResponse,
  SessionsGroupsRequest,
  SessionsGroupsResponse,
  UpdateSessionRequest,
} from '../types/session.type';

/**
 * Session 服务实现类
 */
export class SessionService extends BaseService {
  private sessionModel: SessionModel;

  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
    this.sessionModel = new SessionModel(db, userId!);
  }

  /**
   * 批量查询指定的会话
   * @param request 批量查询请求参数
   * @returns 批量查询结果
   */
  async getSessions(request: GetSessionsRequest): ServiceResult<BatchGetSessionsResponse> {
    const { sessionIds, query, userId, pageSize, page, agentId } = request;

    this.log('info', '获取会话列表', request);

    try {
      // 权限检查
      const permissionResult = await this.resolveBatchQueryPermission('SESSION_READ', {
        targetSessionIds: sessionIds,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权限批量查询会话');
      }

      // 构建查询条件
      const conditions = [];

      if (permissionResult.condition?.userIds) {
        conditions.push(inArray(sessions.userId, permissionResult.condition.userIds));
      }

      if (query) {
        conditions.push(ilike(sessions.title, `%${query}%`));
      }

      if (userId) {
        conditions.push(eq(sessions.userId, userId));
      }

      if (sessionIds) {
        // 去重处理
        const uniqueSessionIds = Array.from(new Set(sessionIds));

        conditions.push(inArray(sessions.id, uniqueSessionIds));
      }

      if (agentId) {
        conditions.push(eq(agentsToSessions.agentId, agentId));
      }

      // 统一查询路径与并发计数/列表
      const size = pageSize ?? 10;
      const offsetValue = page ? (page - 1) * size : 0;
      const whereExpr = conditions.length ? and(...conditions) : undefined;

      const listQuery = this.db
        .select({ agent: agents, session: sessions, user: users })
        .from(sessions)
        .innerJoin(agentsToSessions, eq(sessions.id, agentsToSessions.sessionId))
        .innerJoin(agents, eq(agentsToSessions.agentId, agents.id))
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(whereExpr)
        .limit(size)
        .offset(offsetValue)
        .orderBy(desc(sessions.updatedAt));

      const countQuery = this.db
        .select({ count: count() })
        .from(sessions)
        .innerJoin(agentsToSessions, eq(sessions.id, agentsToSessions.sessionId))
        .innerJoin(agents, eq(agentsToSessions.agentId, agents.id))
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(whereExpr);

      const [result, [countResult]] = await Promise.all([listQuery, countQuery]);

      return {
        sessions: result.map((item) => ({
          ...item.session,
          agent: item.agent,
          user: item.user,
        })),
        total: countResult.count,
      };
    } catch (error) {
      return this.handleServiceError(error, '批量查询会话');
    }
  }

  /**
   * 根据 ID 获取会话详情
   * @param sessionId 会话 ID
   * @returns 会话详情
   */
  async getSessionById(sessionId: string): ServiceResult<SessionDetailResponse> {
    this.log('info', '根据 ID 获取会话详情', { sessionId });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_READ', {
        targetSessionId: sessionId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问此会话');
      }

      // 构建查询条件
      const conditions = [eq(sessions.id, sessionId)];

      if (permissionResult.condition?.userId) {
        conditions.push(eq(sessions.userId, permissionResult.condition.userId));
      }

      // 查询会话信息，包含关联的 agent 和 user 信息
      const sessionWithAgent = await this.db
        .select({ agent: agents, session: sessions, user: users })
        .from(sessions)
        .innerJoin(agentsToSessions, eq(sessions.id, agentsToSessions.sessionId))
        .innerJoin(agents, eq(agentsToSessions.agentId, agents.id))
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(and(...conditions));

      if (!sessionWithAgent.length) {
        this.log('warn', '会话不存在', { sessionId });
        throw this.createNotFoundError('会话不存在');
      }

      return {
        ...sessionWithAgent[0].session,
        agent: sessionWithAgent[0].agent,
        user: sessionWithAgent[0].user,
      };
    } catch (error) {
      this.log('error', '获取会话详情失败', { error });
      throw this.createBusinessError('获取会话详情失败');
    }
  }

  /**
   * 创建会话
   * @param request 创建请求参数
   * @returns 创建完成的会话 ID
   */
  async createSession(request: CreateSessionRequest): ServiceResult<string> {
    this.log('info', '创建会话', {
      agentId: request.agentId,
      title: request.title,
      type: request.type,
    });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_CREATE');
      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权创建会话');
      }

      return await this.db.transaction(async (tx) => {
        // 如果指定了 agentId，验证 Agent 是否存在
        if (request.agentId) {
          const agent = await tx.query.agents.findFirst({
            where: and(eq(agents.id, request.agentId)),
          });

          if (!agent) {
            throw this.createNotFoundError(`Agent ID "${request.agentId}" 不存在`);
          }
        }

        const { config, meta, agentId, ...sessionData } = request;

        // 创建 Session
        const result = await this.sessionModel.create({
          config: { ...config, ...meta } as any,
          session: {
            ...sessionData,
            type: request.type || 'agent',
          },
          // 如果传入了 agentId，跳过创建新的 Agent
          skipAgentCreation: !!agentId,

          type: (request.type || 'agent') as 'agent' | 'group',
        });

        if (!result) {
          throw this.createBusinessError('会话创建失败');
        }

        // 如果指定了 agentId，创建 Agent-Session 关联
        if (agentId) {
          await tx.insert(agentsToSessions).values({
            agentId,
            sessionId: result.id,
            userId: this.userId!,
          });

          this.log('info', '会话与 Agent 关联成功', {
            agentId,
            sessionId: result.id,
          });
        }

        this.log('info', '会话创建成功', {
          agentId: agentId || null,
          id: result.id,
          title: request.title,
        });

        return result.id;
      });
    } catch (error) {
      this.handleServiceError(error, '创建会话');
    }
  }

  /**
   * 更新会话
   * @param request 更新请求参数
   * @returns 更新结果
   */
  async updateSession(request: UpdateSessionRequest): ServiceResult<void> {
    this.log('info', '更新会话', { id: request.id });

    try {
      const { id, agentId, groupId, ...updateData } = request;

      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_UPDATE', {
        targetSessionId: id,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权更新此会话');
      }

      await this.db.transaction(async (tx) => {
        // 更新会话基本信息
        await this.sessionModel.update(id, {
          ...updateData,
          groupId: groupId === 'default' ? null : groupId,
        });

        // 如果提供了 agentId，更新会话与 Agent 的关联
        if (agentId) {
          // 验证 Agent 是否存在
          const agent = await tx.query.agents.findFirst({
            where: eq(agents.id, agentId),
          });

          if (!agent) {
            throw this.createNotFoundError(`Agent ID "${agentId}" 不存在`);
          }

          await tx
            .insert(agentsToSessions)
            .values({ agentId, sessionId: id, userId: this.userId! })
            .onConflictDoUpdate({
              set: { agentId, userId: this.userId! },
              target: agentsToSessions.sessionId,
            });
        }
      });

      this.log('info', '会话更新成功', { agentId, id });
    } catch (error) {
      this.handleServiceError(error, '更新会话');
    }
  }

  /**
   * 删除会话
   * @param sessionId 会话 ID
   * @returns 删除结果
   */
  async deleteSession(sessionId: string): ServiceResult<void> {
    this.log('info', '删除会话', { sessionId });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_DELETE', {
        targetSessionId: sessionId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权删除此会话');
      }

      await this.db.transaction(async (trx) => {
        // 1. 删除会话与 agent 的关联
        this.log('info', '删除会话与 agent 的关联');

        await trx.delete(agentsToSessions).where(and(eq(agentsToSessions.sessionId, sessionId)));

        // 2. 删除会话相关的消息
        this.log('info', '删除会话相关的消息');
        await trx.delete(messages).where(eq(messages.sessionId, sessionId));

        // 3. 删除会话本身
        this.log('info', '删除会话本身');
        await trx.delete(sessions).where(eq(sessions.id, sessionId));

        this.log('info', '删除会话成功', {
          sessionId,
        });
      });
    } catch (error) {
      this.handleServiceError(error, '删除会话');
    }
  }

  /**
   * 克隆会话
   * @param request 克隆请求参数
   * @returns 新会话 ID
   */
  async cloneSession(request: CloneSessionRequest): ServiceResult<string | null> {
    this.log('info', '克隆会话', { id: request.id, newTitle: request.newTitle });

    try {
      // 权限校验
      const permissionRead = await this.resolveOperationPermission('SESSION_READ', {
        targetSessionId: request.id,
      });
      const permissionCreate = await this.resolveOperationPermission('SESSION_CREATE', {
        targetSessionId: request.id,
      });

      if (!permissionRead.isPermitted || !permissionCreate.isPermitted) {
        throw this.createAuthorizationError(permissionRead.message || '无权克隆此会话');
      }

      const result = await this.sessionModel.duplicate(request.id, request.newTitle);

      if (!result) {
        this.log('warn', '会话克隆失败，原会话可能不存在', { id: request.id });
        return null;
      }

      this.log('info', '会话克隆成功', { newId: result.id, originalId: request.id });
      return result.id;
    } catch (error) {
      this.log('error', '克隆会话失败', { error });
      throw this.createBusinessError('克隆会话失败');
    }
  }

  /**
   * 获取按Agent分组的会话列表
   * @param request 分组查询请求参数
   * @returns 按Agent分组的会话列表
   */
  async getSessionsGroupsByAgent(
    request: SessionsGroupsRequest,
  ): ServiceResult<SessionsGroupsResponse[]> {
    this.log('info', '获取按Agent分组的会话列表', { request });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_READ');
      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问会话列表');
      }

      // 构建查询条件
      const conditions = [];

      if (permissionResult.condition?.userId) {
        conditions.push(eq(sessions.userId, permissionResult.condition.userId));
      }

      const whereExpr = conditions.length ? and(...conditions) : undefined;

      // 查询所有会话，按Agent分组
      const result = await this.db
        .select({
          agent: agents,
          session: sessions,
          user: users,
        })
        .from(sessions)
        .innerJoin(agentsToSessions, eq(sessions.id, agentsToSessions.sessionId))
        .innerJoin(agents, eq(agentsToSessions.agentId, agents.id))
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(whereExpr)
        .orderBy(desc(sessions.updatedAt));

      // 按agent进行分组
      const groupedByAgent = new Map<string, SessionsGroupsResponse>();

      for (const item of result) {
        const agentId = item.agent.id;

        if (!groupedByAgent.has(agentId)) {
          groupedByAgent.set(agentId, {
            agent: item.agent,
            sessions: [],
            total: 0,
          });
        }

        const group = groupedByAgent.get(agentId)!;

        group.sessions.push({
          ...item.session,
          agent: item.agent,
          user: item.user,
        });

        group.total += 1;
      }

      const groupedSessions = Array.from(groupedByAgent.values());

      this.log('info', '成功获取按Agent分组的会话列表', {
        groupCount: groupedSessions.length,
        totalSessions: result.length,
      });

      return groupedSessions;
    } catch (error) {
      this.log('error', '获取按Agent分组的会话列表失败', { error });
      throw this.createBusinessError('获取按Agent分组的会话列表失败');
    }
  }

  /**
   * 批量更新会话
   * @param request 批量更新请求参数
   * @returns 批量更新结果
   */
  async batchUpdateSessions(request: BatchUpdateSessionsRequest): ServiceResult<{
    errors: Array<{ error: string; id: string }>;
    failed: number;
    success: boolean;
    updated: number;
  }> {
    const { sessions: sessionsToUpdate } = request;

    this.log('info', '批量更新会话', { sessions: sessionsToUpdate });

    try {
      // 权限检查
      const permissionResult = await this.resolveBatchQueryPermission('SESSION_UPDATE', {
        targetSessionIds: sessionsToUpdate.map((s) => s.id),
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权限批量更新会话');
      }

      let updated = 0;
      let failed = 0;
      const errors: Array<{ error: string; id: string }> = [];

      // 使用事务批量更新
      await this.db.transaction(async (tx) => {
        for (const sessionData of sessionsToUpdate) {
          try {
            // 首先检查会话是否存在
            const existingSession = await tx.query.sessions.findFirst({
              where: eq(sessions.id, sessionData.id),
            });

            if (!existingSession) {
              errors.push({ error: '会话不存在', id: sessionData.id });
              failed++;
              continue;
            }

            // 执行更新
            const { id, groupId, ...updateData } = sessionData;

            if (Object.keys(updateData).length > 0) {
              await tx
                .update(sessions)
                .set({
                  ...updateData,
                  groupId: groupId === 'default' ? null : groupId,
                  updatedAt: new Date(),
                })
                .where(eq(sessions.id, id));

              updated++;
              this.log('info', '会话更新成功', { id });
            } else {
              // 没有任何字段需要更新
              errors.push({ error: '没有提供要更新的字段', id: sessionData.id });
              updated++;
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            errors.push({ error: errorMessage, id: sessionData.id });
            failed++;
            this.log('error', '会话更新失败', { error: errorMessage, id: sessionData.id });
          }
        }
      });

      const result = {
        errors,
        failed,
        success: failed === 0,
        updated,
      };

      this.log('info', '批量更新会话完成', result);

      return result;
    } catch (error) {
      return this.handleServiceError(error, '批量更新会话');
    }
  }
}
