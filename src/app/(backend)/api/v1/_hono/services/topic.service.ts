import { asc, count, eq, sql } from 'drizzle-orm';

import { MessageItem, messages, topics, users } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { idGenerator } from '@/database/utils/idGenerator';
import { LLMRoleType } from '@/types/llm';

import { BaseService } from '../common/base.service';
import { NO_THINKING_CHAT_OPTIONS } from '../constant/chat';
import { TopicResponse, TopicSummaryRequest } from '../types/topic.type';
import { ChatService } from './chat.service';

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
  async getTopicsBySessionId(sessionId: string, keyword?: string): Promise<TopicResponse[]> {
    if (!this.userId) {
      throw this.createAuthError('未授权操作');
    }

    try {
      // 使用联查和子查询来统计每个话题的消息数量，并获取用户信息
      const query = this.db
        .select({
          clientId: topics.clientId,
          createdAt: topics.createdAt,
          favorite: topics.favorite,
          historySummary: topics.historySummary,
          id: topics.id,
          messageCount: count(messages.id),
          metadata: topics.metadata,
          sessionId: topics.sessionId,
          title: topics.title,
          updatedAt: topics.updatedAt,
          userAvatar: users.avatar,
          userEmail: users.email,
          userFullName: users.fullName,
          // 用户信息
          userId: users.id,
          userUsername: users.username,
        })
        .from(topics)
        .leftJoin(messages, eq(topics.id, messages.topicId))
        .innerJoin(users, eq(topics.userId, users.id))
        .where(
          keyword
            ? sql`${topics.sessionId} = ${sessionId} AND ${topics.title} LIKE ${`%${keyword}%`}`
            : eq(topics.sessionId, sessionId),
        );

      const result = await query.groupBy(topics.id, users.id).orderBy(asc(topics.createdAt));

      return result.map((topic) => ({
        clientId: topic.clientId,
        createdAt: topic.createdAt.toISOString(),
        favorite: topic.favorite || false,
        historySummary: topic.historySummary,
        id: topic.id,
        messageCount: topic.messageCount,
        metadata: topic.metadata,
        sessionId: topic.sessionId,
        title: topic.title,
        updatedAt: topic.updatedAt.toISOString(),
        user: {
          avatar: topic.userAvatar,
          email: topic.userEmail,
          fullName: topic.userFullName,
          id: topic.userId,
          username: topic.userUsername,
        },
      }));
    } catch (error) {
      this.log('error', 'Failed to get topics by session ID', { error, keyword, sessionId });
      throw this.createCommonError('获取话题列表失败');
    }
  }

  async getTopicById(topicId: string): Promise<TopicResponse> {
    try {
      const topic = await this.db.query.topics.findFirst({
        where: eq(topics.id, topicId),
      });

      if (!topic) {
        throw this.createCommonError('话题不存在');
      }

      // 获取用户信息
      const user = await this.db.query.users.findFirst({
        columns: {
          avatar: true,
          email: true,
          fullName: true,
          id: true,
          username: true,
        },
        where: eq(users.id, this.userId),
      });

      if (!user) {
        throw this.createCommonError('用户不存在');
      }

      const countResult = await this.db
        .select({
          count: count(messages.id),
        })
        .from(messages)
        .where(eq(messages.topicId, topicId))
        .limit(1);

      return {
        ...topic,
        createdAt: topic.createdAt.toISOString(),
        favorite: topic.favorite || false,
        messageCount: countResult[0].count,
        updatedAt: topic.updatedAt.toISOString(),
        user,
      };
    } catch (error) {
      this.log('error', 'Failed to get topic by id', { error, topicId });
      throw this.createCommonError('获取话题失败');
    }
  }

  /**
   * 创建新的话题
   * @param sessionId 会话ID
   * @param title 话题标题
   * @returns 创建的话题信息
   */
  async createTopic(sessionId: string, title: string): Promise<TopicResponse> {
    if (!this.userId) {
      throw this.createAuthError('未授权操作');
    }

    try {
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
      this.log('error', 'Failed to create topic', { error, sessionId, title });
      throw this.createCommonError('创建话题失败');
    }
  }

  /**
   * 更新话题
   * @param topicId 话题ID
   * @param title 话题标题
   * @returns 更新后的话题信息
   */
  async updateTopic(topicId: string, title: string): Promise<Partial<TopicResponse>> {
    try {
      await this.db.update(topics).set({ title }).where(eq(topics.id, topicId)).returning();

      return this.getTopicById(topicId);
    } catch (error) {
      this.log('error', 'Failed to update topic', { error, title, topicId });
      throw this.createCommonError('更新话题失败');
    }
  }

  /**
   * 删除话题
   * @param topicId 话题ID
   */
  async deleteTopic(topicId: string): Promise<void> {
    if (!this.userId) {
      throw this.createAuthError('未授权操作');
    }

    try {
      // 首先检查话题是否存在且属于当前用户
      const existingTopic = await this.db.query.topics.findFirst({
        where: eq(topics.id, topicId),
      });

      console.log('this.userId', this.userId);
      console.log('existingTopic', existingTopic);

      if (!existingTopic) {
        throw this.createCommonError('话题不存在');
      }

      if (existingTopic.userId !== this.userId) {
        throw this.createAuthorizationError('无权限删除此话题');
      }

      await this.db.delete(topics).where(eq(topics.id, topicId));

      this.log('info', 'Topic deleted successfully', { topicId });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'BusinessError' || error.name === 'AuthorizationError')
      ) {
        throw error;
      }
      this.log('error', 'Failed to delete topic', {
        error: error instanceof Error ? error.message : String(error),
        topicId,
      });
      throw this.createCommonError('删除话题失败');
    }
  }

  /**
   * 总结对应的话题
   * @param topicId 话题ID
   * @returns 更新后的话题信息
   */
  async summarizeTopicTitle(params: TopicSummaryRequest): Promise<TopicResponse> {
    if (!this.userId) {
      throw this.createAuthError('未授权操作');
    }

    const { id: topicId, lang = 'zh-CN' } = params;

    try {
      // 首先检查话题是否存在且属于当前用户
      const existingTopic = await this.db.query.topics.findFirst({
        where: eq(topics.id, topicId),
      });

      if (!existingTopic) {
        throw this.createCommonError('话题不存在');
      }

      if (existingTopic.userId !== this.userId) {
        throw this.createAuthorizationError('无权限操作此话题');
      }

      // 获取话题下的所有消息，按时间顺序排序
      const topicMessages: MessageItem[] = await this.db.query.messages.findMany({
        orderBy: [asc(messages.createdAt)],
        where: eq(messages.topicId, topicId),
      });

      this.log('info', '获取话题消息', {
        messageCount: topicMessages.length,
        topicId,
        userId: this.userId,
      });

      // 如果没有消息，返回错误
      if (topicMessages.length === 0) {
        throw this.createCommonError('话题中没有消息，无法生成摘要');
      }

      // 构建消息历史用于摘要生成
      const summaryTitleMessages = [
        {
          content: '你是一名擅长会话的助理，你需要将用户的会话总结为 10 个字以内的标题',
          role: 'system' as LLMRoleType,
        },
        {
          content: `${topicMessages.map((message) => `${message.role}: ${message.content}`).join('\n')}

  请总结上述对话为10个字以内的标题，不需要包含标点符号，输出语言语种为：${lang}`,
          role: 'user' as LLMRoleType,
        },
      ];

      const chatService = new ChatService(this.db, this.userId);

      const { model, provider } = await chatService.resolveModelConfig({
        sessionId: existingTopic.sessionId,
      });

      this.log('info', '生成话题摘要', {
        summaryLength: summaryTitleMessages?.length,
        topicId,
        userId: this.userId,
      });

      const { content: summaryTitle } = await chatService.chat(
        {
          messages: summaryTitleMessages || [],
          model,
          provider,
        },
        NO_THINKING_CHAT_OPTIONS,
      );

      // 更新话题的摘要信息
      await this.db
        .update(topics)
        .set({
          title: summaryTitle,
          updatedAt: new Date(),
        })
        .where(eq(topics.id, topicId))
        .returning();

      const updatedTopic = await this.getTopicsBySessionId(existingTopic.sessionId!);

      return updatedTopic[0];
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'BusinessError' || error.name === 'AuthorizationError')
      ) {
        throw error;
      }
      this.log('error', 'Failed to summarize topic', {
        error: error instanceof Error ? error.message : String(error),
        topicId,
      });
      throw this.createCommonError('总结话题失败');
    }
  }
}
