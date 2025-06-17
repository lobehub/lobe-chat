import { count } from 'drizzle-orm';
import { and, desc, eq, inArray } from 'drizzle-orm/expressions';

import { messages } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  MessageCreateResponse,
  MessageResponse,
  MessagesCreateRequest,
} from '../types/message.type';

/**
 * 消息统计结果类型
 */
export interface MessageCountResult {
  count: number;
}

/**
 * 消息服务实现类 (Hono API 专用)
 * 提供各种消息数量统计功能
 */
export class MessageService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * 根据话题ID数组统计消息总数
   * @param topicIds 话题ID数组
   * @returns 消息数量统计结果
   */
  async countMessagesByTopicIds(topicIds: string[]): ServiceResult<MessageCountResult> {
    this.log('info', '根据话题ID数组统计消息数量', { topicIds, userId: this.userId });

    try {
      const result = await this.db
        .select({ count: count() })
        .from(messages)
        .where(and(eq(messages.userId, this.userId!), inArray(messages.topicId, topicIds)));

      const messageCount = result[0]?.count || 0;
      this.log('info', '话题消息统计完成', { count: messageCount });

      return { count: messageCount };
    } catch (error) {
      this.log('error', '话题消息统计失败', { error });
      throw this.createCommonError('查询话题消息数量失败');
    }
  }

  /**
   * 根据用户ID统计消息总数
   * @param targetUserId 目标用户ID
   * @returns 消息数量统计结果
   */
  async countMessagesByUserId(targetUserId: string): ServiceResult<MessageCountResult> {
    this.log('info', '根据用户ID统计消息数量', { targetUserId });

    try {
      const result = await this.db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.userId, targetUserId));

      const messageCount = result[0]?.count || 0;
      this.log('info', '用户消息统计完成', { count: messageCount });

      return { count: messageCount };
    } catch (error) {
      this.log('error', '用户消息统计失败', { error });
      throw this.createCommonError('查询用户消息数量失败');
    }
  }

  /**
   * 根据话题ID获取消息列表
   * @param topicId 话题ID
   * @returns 消息列表
   */
  async getMessagesByTopicId(topicId: string): ServiceResult<MessageResponse[]> {
    if (!this.userId) {
      throw this.createAuthError('未授权操作');
    }

    this.log('info', '根据话题ID获取消息列表', { topicId, userId: this.userId });

    try {
      const result = await this.db
        .select()
        .from(messages)
        .where(and(eq(messages.topicId, topicId), eq(messages.userId, this.userId)))
        .orderBy(desc(messages.createdAt));

      const messageList = result.map((message) => ({
        agentId: message.agentId,
        clientId: message.clientId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        error: message.error,
        favorite: message.favorite || false,
        id: message.id,
        metadata: message.metadata,
        model: message.model,
        observationId: message.observationId,
        parentId: message.parentId,
        provider: message.provider,
        quotaId: message.quotaId,
        reasoning: message.reasoning,
        role: message.role,
        search: message.search,
        sessionId: message.sessionId,
        threadId: message.threadId,
        tools: message.tools,
        topicId: message.topicId,
        traceId: message.traceId,
        updatedAt: message.updatedAt.toISOString(),
        userId: message.userId,
      }));

      this.log('info', '获取话题消息列表完成', { count: messageList.length });
      return messageList;
    } catch (error) {
      this.log('error', '获取话题消息列表失败', { error });
      throw this.createCommonError('查询话题消息列表失败');
    }
  }

  /**
   * 创建新消息
   * @param messageData 消息数据
   * @returns 创建的消息ID
   */
  async createMessage(messageData: MessagesCreateRequest): ServiceResult<MessageCreateResponse> {
    if (!this.userId) {
      throw this.createAuthError('未授权操作');
    }

    this.log('info', '创建新消息', {
      role: messageData.role,
      sessionId: messageData.sessionId,
      topicId: messageData.topic,
      userId: this.userId,
    });

    try {
      const [newMessage] = await this.db
        .insert(messages)
        .values({
          content: messageData.content,
          favorite: false,
          model: messageData.fromModel,
          provider: messageData.fromProvider,
          role: messageData.role,
          sessionId: messageData.sessionId,
          topicId: messageData.topic,
          userId: this.userId,
        })
        .returning({ id: messages.id });

      // TODO: Handle file attachments if provided
      if (messageData.files && messageData.files.length > 0) {
        this.log('info', '消息包含文件附件', {
          files: messageData.files,
          messageId: newMessage.id,
        });
        // This would require implementing file attachment logic
        // which involves the messages_files junction table
      }

      this.log('info', '创建消息完成', { messageId: newMessage.id });
      return { id: newMessage.id };
    } catch (error) {
      this.log('error', '创建消息失败', { error });
      throw this.createCommonError('创建消息失败');
    }
  }
}
