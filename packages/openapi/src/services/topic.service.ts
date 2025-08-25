import { and, asc, count, eq, ilike } from 'drizzle-orm';

import { messages, topics, users } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { idGenerator } from '@/database/utils/idGenerator';

import { BaseService } from '../common/base.service';
import { TopicListQuery, TopicResponse, TopicUpdateRequest } from '../types/topic.type';

export class TopicService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * 获取指定会话的所有话题
   * @param sessionId 会话ID
   * @param keyword 可选的搜索关键词
   * @returns 话题列表
   */
  async getTopicsBySessionId(request: TopicListQuery): Promise<TopicResponse[]> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission(
        'TOPIC_READ',
        request.sessionId
          ? {
              targetSessionId: request.sessionId,
            }
          : undefined,
      );

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限访问话题列表');
      }

      // 构建查询条件
      const conditions = [];

      // 添加权限相关的查询条件
      if (permissionResult?.condition?.userId) {
        conditions.push(eq(topics.userId, permissionResult.condition.userId));
      }

      if (request.sessionId) {
        conditions.push(eq(topics.sessionId, request.sessionId));
      }

      // 如果有关键词，添加标题的模糊搜索条件
      if (request.keyword) {
        conditions.push(ilike(topics.title, `%${request.keyword}%`));
      }

      // 使用联查和子查询来统计每个话题的消息数量，并获取用户信息
      const results = await this.db
        .select({
          messageCount: count(messages.id),
          topic: topics,
          user: users,
        })
        .from(topics)
        .leftJoin(messages, eq(topics.id, messages.topicId))
        .innerJoin(users, eq(topics.userId, users.id))
        .groupBy(topics.id, users.id)
        .orderBy(asc(topics.createdAt))
        .where(and(...conditions));

      return results.map((result) => ({
        ...result.topic,
        messageCount: result.messageCount,
        user: result.user,
      }));
    } catch (error) {
      this.handleServiceError(error, '获取话题列表');
    }
  }

  async getTopicById(topicId: string): Promise<TopicResponse> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('TOPIC_READ', {
        targetTopicId: topicId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限访问该话题');
      }

      // 构建查询条件
      let whereConditions = [eq(topics.id, topicId)];

      // 应用权限条件
      if (permissionResult.condition?.userId) {
        whereConditions.push(eq(topics.userId, permissionResult.condition.userId));
      }

      const [result] = await this.db
        .select({
          messageCount: count(messages.id),
          topic: topics,
          user: users,
        })
        .from(topics)
        .leftJoin(messages, eq(topics.id, messages.topicId))
        .innerJoin(users, eq(topics.userId, users.id))
        .where(and(...whereConditions))
        .limit(1);

      if (!result) {
        throw this.createNotFoundError('话题不存在');
      }

      return {
        ...result.topic,
        messageCount: result.messageCount,
        user: result.user,
      };
    } catch (error) {
      return this.handleServiceError(error, '获取话题');
    }
  }

  /**
   * 创建新的话题
   * @param sessionId 会话ID
   * @param title 话题标题
   * @returns 创建的话题信息
   */
  async createTopic(sessionId: string, title: string): Promise<TopicResponse> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('TOPIC_CREATE', {
        targetSessionId: sessionId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权创建话题');
      }

      const [newTopic] = await this.db
        .insert(topics)
        .values({
          favorite: false,
          id: idGenerator('topics'),
          sessionId,
          title,
          userId: this.userId,
        })
        .returning();

      return this.getTopicById(newTopic.id);
    } catch (error) {
      this.handleServiceError(error, '创建话题');
    }
  }

  /**
   * 更新话题
   * @param topicId 话题ID
   * @param title 话题标题
   * @returns 更新后的话题信息
   */
  async updateTopic(topicId: string, payload: TopicUpdateRequest): Promise<Partial<TopicResponse>> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('TOPIC_UPDATE', {
        targetTopicId: topicId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限更新该话题');
      }

      // 构建查询条件检查话题是否存在
      let whereConditions = [eq(topics.id, topicId)];

      // 应用权限条件
      if (permissionResult.condition?.userId) {
        whereConditions.push(eq(topics.userId, permissionResult.condition.userId));
      }

      const [updatedTopic] = await this.db
        .update(topics)
        .set(payload)
        .where(and(...whereConditions))
        .returning();

      if (!updatedTopic) {
        throw this.createNotFoundError('话题不存在');
      }

      return this.getTopicById(updatedTopic.id);
    } catch (error) {
      return this.handleServiceError(error, '更新话题');
    }
  }

  /**
   * 删除话题
   * @param topicId 话题ID
   */
  async deleteTopic(topicId: string): Promise<void> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('TOPIC_DELETE', {
        targetTopicId: topicId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限删除该话题');
      }

      // 构建查询条件检查话题是否存在
      let whereConditions = [eq(topics.id, topicId)];

      // 应用权限条件
      if (permissionResult.condition?.userId) {
        whereConditions.push(eq(topics.userId, permissionResult.condition.userId));
      }

      const [existingTopic] = await this.db
        .delete(topics)
        .where(and(...whereConditions))
        .returning();

      if (!existingTopic) {
        throw this.createNotFoundError('话题不存在');
      }

      this.log('info', '话题删除成功', { topicId });
    } catch (error) {
      return this.handleServiceError(error, '删除话题');
    }
  }
}
