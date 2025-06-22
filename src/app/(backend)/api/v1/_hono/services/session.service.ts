import { Column, and, desc, eq, like, not, or, sql } from 'drizzle-orm';

import { INBOX_SESSION_ID } from '@/const/session';
import { SessionModel } from '@/database/models/session';
import { SessionItem, agents, agentsToSessions, sessions } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { LobeAgentConfig } from '@/types/agent';
import { ChatSessionList } from '@/types/session';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  CloneSessionRequest,
  CreateSessionRequest,
  GetSessionsRequest,
  SearchSessionsRequest,
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
   * @returns 会话列表
   */
  async getSessions(request: GetSessionsRequest = {}): ServiceResult<SessionItem[]> {
    this.log('info', '获取会话列表', { request });

    try {
      const { current = 1, pageSize = 20, userId } = request;

      // 构建查询条件
      let whereConditions = [not(eq(sessions.slug, INBOX_SESSION_ID))];

      if (userId === null) {
        // 查询所有用户的会话
        this.log('info', '获取所有用户的会话列表');
      } else {
        // 查询特定用户的会话
        const targetUserId = userId || this.userId;
        whereConditions.push(eq(sessions.userId, targetUserId));
        this.log('info', '根据用户 ID 获取会话列表', { userId: targetUserId });
      }

      const sessionsList = await this.db.query.sessions.findMany({
        limit: pageSize,
        offset: (current - 1) * pageSize,
        orderBy: [desc(sessions.updatedAt)],
        where: and(...whereConditions),
        with: { agentsToSessions: { columns: {}, with: { agent: true } }, group: true },
      });

      this.log('info', `查询到 ${sessionsList.length} 个会话`);

      return sessionsList;
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
   * 根据 ID 获取会话详情
   * @param sessionId 会话 ID
   * @returns 会话详情
   */
  async getSessionById(sessionId: string): ServiceResult<SessionItem> {
    this.log('info', '根据 ID 获取会话详情', { sessionId });

    try {
      const session = await this.sessionModel.findByIdOrSlug(sessionId);

      if (!session) {
        this.log('warn', '会话不存在', { sessionId });
        throw this.createNotFoundError('会话不存在');
      }

      return session;
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
    this.log('info', '更新会话', { id: request.id, title: request.title });

    try {
      const { id, ...updateData } = request;

      await this.sessionModel.update(id, {
        ...updateData,
        groupId: updateData.groupId === 'default' ? null : updateData.groupId,
      });

      this.log('info', '会话更新成功', { id });
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
    const { keywords } = request;

    this.log('info', '搜索会话', { keywords });

    try {
      // 直接从 sessions 表里查询
      const sessionsList = await this.db.query.sessions.findMany({
        where: and(
          eq(sessions.userId, this.userId!),
          or(
            like(sql`lower(${sessions.title})` as unknown as Column, `%${keywords.toLowerCase()}%`),
          ),
        ),
      });

      this.log('info', `搜索到 ${sessionsList.length} 个会话`, { keywords: request.keywords });

      return sessionsList;
    } catch (error) {
      this.log('error', '搜索会话失败', { error });
      throw this.createBusinessError('搜索会话失败');
    }
  }
}
