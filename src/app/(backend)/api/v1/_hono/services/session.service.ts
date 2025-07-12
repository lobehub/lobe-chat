import { Column, SQL, and, desc, eq, inArray, like, not, or, sql } from 'drizzle-orm';
import { groupBy } from 'lodash';

import { INBOX_SESSION_ID } from '@/const/session';
import { SessionModel } from '@/database/models/session';
import { SessionItem, agents, agentsToSessions, messages, sessions } from '@/database/schemas';
import { UserItem } from '@/database/schemas/user';
import { LobeChatDatabase } from '@/database/type';
import { LobeAgentConfig } from '@/types/agent';
import { ChatSessionList } from '@/types/session';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  BatchGetSessionsRequest,
  BatchGetSessionsResponse,
  BatchUpdateSessionsRequest,
  CloneSessionRequest,
  CreateSessionRequest,
  GetSessionsRequest,
  SearchSessionsRequest,
  SessionCountByAgentResponse,
  SessionDetailResponse,
  SessionListItem,
  SessionsByAgentResponse,
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
   * 获取会话列表
   * @param request 分页参数
   * @returns 会话列表和总数
   */
  async getSessions(request: GetSessionsRequest = {}): ServiceResult<{
    sessions: SessionListItem[];
    total: number;
  }> {
    this.log('info', '获取会话列表', { request });

    try {
      const { page = 1, pageSize = 20, agentId, keyword = '', targetUserId } = request;

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('SESSION_READ', targetUserId);

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限访问会话列表');
      }

      // 构建查询条件
      let whereConditions = [not(eq(sessions.slug, INBOX_SESSION_ID))];

      // 添加权限相关的查询条件
      if (permissionResult?.condition?.userId) {
        whereConditions.push(eq(sessions.userId, permissionResult.condition.userId));
      }

      // 如果指定了 agentId，需要通过 agentsToSessions 表进行过滤
      if (agentId && agentId !== 'ALL') {
        this.log('info', '根据 Agent ID 过滤会话', { agentId });

        // 首先查询具有指定 agent 的 session ID
        const agentSessions = await this.db.query.agentsToSessions.findMany({
          columns: { sessionId: true },
          where: eq(agentsToSessions.agentId, agentId),
        });

        const sessionIds = agentSessions.map((item) => item.sessionId);

        if (sessionIds.length === 0) {
          this.log('info', '未找到关联该 Agent 的会话');
          return { sessions: [], total: 0 };
        }

        // 添加 session ID 过滤条件
        whereConditions.push(inArray(sessions.id, sessionIds));
      }

      // 如果有关键词，添加标题和描述的模糊搜索条件
      if (keyword) {
        this.log('info', '根据关键词过滤会话', { keyword });
        whereConditions.push(
          or(
            like(sessions.title, `%${keyword}%`),
            like(sessions.description, `%${keyword}%`),
          ) as SQL<unknown>,
        );
      }

      // 获取总数
      const totalResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(sessions)
        .where(and(...whereConditions));

      const total = Number(totalResult[0]?.count || 0);

      // 获取分页数据
      const sessionsList = await this.db.query.sessions.findMany({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: [desc(sessions.updatedAt)],
        where: and(...whereConditions),
        with: {
          agentsToSessions: { with: { agent: true } },
          group: true,
          user: true,
        },
      });

      // 获取每个会话的消息数量
      const sessionIds = sessionsList.map((session) => session.id);
      let messageCountsResult: Array<{ count: number; sessionId: string | null }> = [];

      if (sessionIds.length > 0) {
        messageCountsResult = await this.db
          .select({
            count: sql<number>`count(*)`,
            sessionId: messages.sessionId,
          })
          .from(messages)
          .where(inArray(messages.sessionId, sessionIds))
          .groupBy(messages.sessionId);
      }

      // 创建消息数量映射
      const messageCountMap = new Map<string, number>();
      messageCountsResult.forEach((row) => {
        if (row.sessionId) {
          messageCountMap.set(row.sessionId, Number(row.count));
        }
      });

      // 添加消息数量到会话列表
      const sessionsWithMessageCount: SessionListItem[] = sessionsList.map(
        (session) =>
          ({
            ...session,
            messageCount: messageCountMap.get(session.id) || 0,
          }) as unknown as SessionListItem,
      );

      this.log('info', `查询到 ${sessionsList.length} 个会话，总数: ${total}`, { agentId });

      return { sessions: sessionsWithMessageCount, total };
    } catch (error) {
      this.log('error', '获取会话列表失败', { error });
      throw this.createBusinessError('获取会话列表失败');
    }
  }

  /**
   * 获取分组的会话列表
   * @returns 分组会话列表
   */
  async getGroupedSessions(): ServiceResult<ChatSessionList> {
    this.log('info', '获取分组的会话列表');

    try {
      const result = await this.sessionModel.queryWithGroups();

      this.log('info', '成功获取分组会话列表', {
        sessionGroups: result.sessionGroups.length,
        sessions: result.sessions.length,
      });

      return result;
    } catch (error) {
      this.log('error', '获取分组会话列表失败', { error });
      throw this.createBusinessError('获取分组会话列表失败');
    }
  }

  /**
   * 获取按Agent分组的会话列表
   * @returns 按Agent分组的会话列表
   */
  async getSessionsGroupedByAgent(): ServiceResult<SessionsByAgentResponse> {
    this.log('info', '获取按Agent分组的会话列表');

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 查询当前用户的所有会话，包含关联的agent信息
      const sessionsList = await this.db.query.sessions.findMany({
        orderBy: [desc(sessions.updatedAt)],
        where: and(eq(sessions.userId, this.userId), not(eq(sessions.slug, INBOX_SESSION_ID))),
        with: {
          agentsToSessions: {
            with: {
              agent: true,
            },
          },
        },
      });

      // 按agent进行分组
      const groupByAgent = groupBy(sessionsList, (session) => session.agentsToSessions?.[0]?.id);

      // @ts-ignore
      const groupedSessions: SessionsByAgentResponse = Object.values(groupByAgent).map(
        (sessions) => {
          const agent = sessions[0].agentsToSessions?.[0]?.agent ?? null;

          return { agent, sessions };
        },
      );

      this.log('info', '成功获取按Agent分组的会话列表', {
        groupCount: Object.keys(groupedSessions).length,
        totalSessions: sessionsList.length,
      });

      return groupedSessions;
    } catch (error) {
      this.log('error', '获取按Agent分组的会话列表失败', { error });
      throw this.createBusinessError('获取按Agent分组的会话列表失败');
    }
  }

  /**
   * 获取按Agent分组的会话数量
   * @returns 按Agent分组的会话数量
   */
  async getSessionCountGroupedByAgent(): ServiceResult<SessionCountByAgentResponse[]> {
    this.log('info', '获取按Agent分组的会话数量');

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      // 查询当前用户的所有会话，包含关联的agent信息
      const sessionsList = await this.db.query.sessions.findMany({
        where: and(not(eq(sessions.slug, INBOX_SESSION_ID))),
        with: {
          agentsToSessions: {
            with: {
              agent: true,
            },
          },
        },
      });

      // 按agent进行分组
      const groupByAgent = groupBy(sessionsList, (session) => {
        return session.agentsToSessions?.[0]?.agent?.id || 'no_agent';
      });

      // 转换为数量统计
      const countByAgent: SessionCountByAgentResponse[] = Object.entries(groupByAgent).map(
        ([agentId, sessionsList]) => {
          const agent =
            agentId === 'no_agent' ? null : (sessionsList[0]?.agentsToSessions?.[0]?.agent ?? null);

          return {
            agent,
            count: sessionsList.length,
          };
        },
      );

      this.log('info', '成功获取按Agent分组的会话数量', {
        agentCount: countByAgent.length,
        totalSessions: sessionsList.length,
      });

      return countByAgent;
    } catch (error) {
      this.log('error', '获取按Agent分组的会话数量失败', { error });
      throw this.createBusinessError('获取按Agent分组的会话数量失败');
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
      // 查询会话信息，包含关联的 agent 和 user 信息
      const sessionWithAgent = await this.db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: {
          agentsToSessions: {
            with: {
              agent: {
                columns: {
                  avatar: true,
                  backgroundColor: true,
                  chatConfig: true,
                  description: true,
                  id: true,
                  model: true,
                  provider: true,
                  systemRole: true,
                  title: true,
                },
              },
            },
          },
          user: true,
        },
      });

      if (!sessionWithAgent) {
        this.log('warn', '会话不存在', { sessionId });
        throw this.createNotFoundError('会话不存在');
      }

      // 构造返回数据
      const result: SessionDetailResponse = {
        ...sessionWithAgent,
        agent: sessionWithAgent.agentsToSessions?.[0]?.agent || null,
        user: sessionWithAgent.user as UserItem,
      };

      // 移除 agentsToSessions 字段，因为我们已经提取了 agent 信息
      delete (result as any).agentsToSessions;

      return result;
    } catch (error) {
      this.log('error', '获取会话详情失败', { error });
      throw this.createBusinessError('获取会话详情失败');
    }
  }

  /**
   * 获取会话配置
   * @param sessionId 会话 ID
   * @returns 会话配置
   */
  async getSessionConfig(sessionId: string): ServiceResult<LobeAgentConfig | null> {
    this.log('info', '获取会话配置', { sessionId });

    try {
      const session = await this.sessionModel.findByIdOrSlug(sessionId);

      if (!session) {
        this.log('warn', '会话不存在', { sessionId });
        return null;
      }

      return session.agent as LobeAgentConfig;
    } catch (error) {
      this.log('error', '获取会话配置失败', { error });
      throw this.createBusinessError('获取会话配置失败');
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
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      return await this.db.transaction(async (tx) => {
        // 如果指定了 agentId，验证 Agent 是否存在且属于当前用户
        if (request.agentId) {
          const agent = await tx.query.agents.findFirst({
            where: and(eq(agents.id, request.agentId), eq(agents.userId, this.userId!)),
          });

          if (!agent) {
            throw this.createNotFoundError(`Agent ID "${request.agentId}" 不存在或无权限访问`);
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
      const { id, agentId, ...updateData } = request;

      await this.db.transaction(async (tx) => {
        // 更新会话基本信息
        await this.sessionModel.update(id, {
          ...updateData,
          groupId: updateData.groupId === 'default' ? null : updateData.groupId,
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

          // 先删除现有的关联
          await tx.delete(agentsToSessions).where(eq(agentsToSessions.sessionId, id));

          // 创建新的关联
          await tx.insert(agentsToSessions).values({
            agentId,
            sessionId: id,
            userId: this.userId!,
          });
        }
      });

      this.log('info', '会话更新成功', { agentId, id });
    } catch (error) {
      this.log('error', '更新会话失败', { error });
      throw this.createBusinessError('更新会话失败');
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
      await this.sessionModel.delete(sessionId);

      this.log('info', '会话删除成功', { sessionId });
    } catch (error) {
      this.log('error', '删除会话失败', { error });
      throw this.createBusinessError('删除会话失败');
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
   * 搜索会话
   * @param request 搜索请求参数
   * @returns 搜索结果
   */
  async searchSessions(request: SearchSessionsRequest): ServiceResult<SessionItem[]> {
    const { keyword } = request;

    this.log('info', '搜索会话', { keyword });

    try {
      // 直接从 sessions 表里查询
      const sessionsList = await this.db.query.sessions.findMany({
        where: and(
          eq(sessions.userId, this.userId!),
          or(
            like(sql`lower(${sessions.title})` as unknown as Column, `%${keyword.toLowerCase()}%`),
          ),
        ),
      });

      this.log('info', `搜索到 ${sessionsList.length} 个会话`, { keyword: request.keyword });

      return sessionsList;
    } catch (error) {
      this.log('error', '搜索会话失败', { error });
      throw this.createBusinessError('搜索会话失败');
    }
  }

  /**
   * 批量查询指定的会话
   * @param request 批量查询请求参数
   * @returns 批量查询结果
   */
  async batchGetSessions(
    request: BatchGetSessionsRequest,
  ): ServiceResult<BatchGetSessionsResponse> {
    const { sessionIds } = request;

    this.log('info', '批量查询会话', { count: sessionIds.length, sessionIds });

    try {
      // 去重处理
      const uniqueSessionIds = Array.from(new Set(sessionIds));

      // 查询指定的会话列表
      const foundSessions = await this.db.query.sessions.findMany({
        orderBy: [desc(sessions.updatedAt)],
        where: inArray(sessions.id, uniqueSessionIds),
      });

      // 找出存在的会话 ID
      const foundSessionIds = new Set(foundSessions.map((session) => session.id));

      // 找出不存在的会话 ID
      const notFoundSessionIds = uniqueSessionIds.filter((id) => !foundSessionIds.has(id));

      const result: BatchGetSessionsResponse = {
        found: foundSessions,
        notFound: notFoundSessionIds,
        totalFound: foundSessions.length,
        totalRequested: uniqueSessionIds.length,
      };

      this.log('info', '批量查询会话完成', {
        notFoundCount: result.notFound.length,
        totalFound: result.totalFound,
        totalRequested: result.totalRequested,
      });

      return result;
    } catch (error) {
      this.log('error', '批量查询会话失败', { error });
      throw this.createBusinessError('批量查询会话失败');
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

    this.log('info', '批量更新会话', { count: sessionsToUpdate.length });

    try {
      if (!this.userId) {
        throw this.createAuthError('用户未认证');
      }

      let updated = 0;
      let failed = 0;
      const errors: Array<{ error: string; id: string }> = [];

      // 使用事务批量更新
      await this.db.transaction(async (tx) => {
        for (const sessionData of sessionsToUpdate) {
          try {
            // 首先检查会话是否存在且属于当前用户
            const existingSession = await tx.query.sessions.findFirst({
              where: and(eq(sessions.id, sessionData.id)),
            });

            if (!existingSession) {
              errors.push({ error: '会话不存在或无权限访问', id: sessionData.id });
              failed++;
              continue;
            }

            // 执行更新
            const { id, ...updateData } = sessionData;

            // 过滤掉未定义的字段
            const filteredUpdateData = Object.fromEntries(
              Object.entries(updateData).filter(([, value]) => value !== undefined),
            );

            if (Object.keys(filteredUpdateData).length > 0) {
              await tx
                .update(sessions)
                .set({
                  ...filteredUpdateData,
                  groupId: updateData.groupId === 'default' ? null : updateData.groupId,
                  updatedAt: new Date(),
                })
                .where(eq(sessions.id, id));

              updated++;
              this.log('info', '会话更新成功', { id });
            } else {
              // 没有任何字段需要更新
              errors.push({ error: '没有提供要更新的字段', id: sessionData.id });
              failed++;
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
      this.log('error', '批量更新会话失败', { error });
      throw this.createBusinessError('批量更新会话失败');
    }
  }
}
