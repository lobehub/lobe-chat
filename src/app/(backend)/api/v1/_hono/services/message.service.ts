import { count } from 'drizzle-orm';
import { and, desc, eq, ilike, inArray, isNull, or } from 'drizzle-orm/expressions';

import { messages, messagesFiles, topics } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { idGenerator } from '@/database/utils/idGenerator';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  MessageCreateResponse,
  MessageResponse,
  MessageWithTopicResponse,
  MessagesCreateRequest,
  SearchMessagesByKeywordRequest,
} from '../types/message.type';
import { ChatService } from './chat.service';

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
    this.log('info', '根据话题ID获取消息列表', { topicId, userId: this.userId });

    try {
      const result = await this.db.query.messages.findMany({
        orderBy: desc(messages.createdAt),
        where: and(eq(messages.topicId, topicId), eq(messages.userId, this.userId!)),
      });

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
    this.log('info', '创建新消息', {
      role: messageData.role,
      sessionId: messageData.sessionId,
      topicId: messageData.topicId,
      userId: this.userId,
    });

    try {
      const [newMessage] = await this.db
        .insert(messages)
        .values({
          content: messageData.content,
          favorite: false,
          id: idGenerator('messages'),
          model: messageData.model,
          provider: messageData.provider,
          role: messageData.role,
          sessionId: messageData.sessionId,
          topicId: messageData.topicId,
          userId: this.userId!,
        })
        .returning({ id: messages.id });

      // 处理文件附件
      if (messageData.files && messageData.files.length > 0) {
        this.log('info', '消息包含文件附件', {
          files: messageData.files,
          messageId: newMessage.id,
        });

        // 更新 messages_files 表
        await this.db.insert(messagesFiles).values(
          messageData.files.map((fileId) => ({
            fileId,
            messageId: newMessage.id,
            userId: this.userId!,
          })),
        );
      }

      this.log('info', '创建消息完成', { messageId: newMessage.id });
      return { id: newMessage.id };
    } catch (error) {
      this.log('error', '创建消息失败', { error });
      throw this.createCommonError('创建消息失败');
    }
  }

  /**
   * 创建用户消息并生成AI回复
   * @param messageData 用户消息数据
   * @returns 用户消息ID和AI回复消息ID
   */
  async createMessageWithAIReply(messageData: MessagesCreateRequest): ServiceResult<{
    aiReplyContent: string;
    aiReplyId: string;
    userMessageId: string;
  }> {
    this.log('info', '创建消息并生成AI回复', {
      role: messageData.role,
      sessionId: messageData.sessionId,
      topicId: messageData.topicId,
      userId: this.userId,
    });

    try {
      // 1. 创建用户消息
      const userMessage = await this.createMessage(messageData);

      // 2. 如果是用户消息，生成AI回复
      if (messageData.role === 'user') {
        // 获取对话历史
        const conversationHistory = await this.getConversationHistory(
          messageData.sessionId || null,
          messageData.topicId,
        );

        // 使用ChatService生成回复
        const chatService = new ChatService(this.db, this.userId);
        const aiReplyContent = await chatService.generateReply({
          conversationHistory,
          model: messageData.model,
          provider: messageData.provider,
          sessionId: messageData.sessionId!,
          userMessage: messageData.content,
        });

        // 3. 创建AI回复消息
        const aiReplyData: MessagesCreateRequest = {
          content: aiReplyContent,
          model: messageData.model,
          provider: messageData.provider,
          role: 'assistant',
          sessionId: messageData.sessionId,
          topicId: messageData.topicId,
        };

        const aiReply = await this.createMessage(aiReplyData);

        this.log('info', '创建消息和AI回复完成', {
          aiReplyId: aiReply.id,
          userMessageId: userMessage.id,
        });

        return {
          aiReplyContent,
          aiReplyId: aiReply.id,
          userMessageId: userMessage.id,
        };
      }

      // 如果不是用户消息，只返回消息ID
      return {
        aiReplyContent: '',
        aiReplyId: '',
        userMessageId: userMessage.id,
      };
    } catch (error) {
      this.log('error', '创建消息和AI回复失败', { error });
      throw this.createCommonError('创建消息和AI回复失败');
    }
  }

  /**
   * 获取对话历史
   * @param sessionId 会话ID
   * @param topicId 话题ID
   * @param limit 消息数量限制
   * @returns 对话历史
   */
  private async getConversationHistory(
    sessionId: string | null,
    topicId: string | null,
    limit: number = 10,
  ): Promise<Array<{ content: string; role: 'user' | 'assistant' | 'system' }>> {
    try {
      const result = await this.db.query.messages.findMany({
        columns: {
          content: true,
          role: true,
        },
        limit: limit,
        orderBy: desc(messages.createdAt),
        where: and(
          sessionId === null ? isNull(messages.sessionId) : eq(messages.sessionId, sessionId),
          topicId === null ? isNull(messages.topicId) : eq(messages.topicId, topicId),
          eq(messages.userId, this.userId!),
        ),
      });

      // 反转顺序，使最新的消息在后面
      return result
        .reverse()
        .filter((msg) => msg.content && ['user', 'assistant'].includes(msg.role))
        .map((msg) => ({
          content: msg.content!,
          role: msg.role as 'user' | 'assistant',
        }));
    } catch (error) {
      this.log('error', '获取对话历史失败', {
        error: error instanceof Error ? error.message : String(error),
        sessionId,
        topicId,
      });
      return [];
    }
  }

  /**
   * 根据关键词模糊搜索消息及对应话题
   * @param searchRequest 搜索请求参数
   * @returns 包含消息和话题信息的结果列表
   */
  async searchMessagesByKeyword(
    searchRequest: SearchMessagesByKeywordRequest,
  ): ServiceResult<MessageWithTopicResponse[]> {
    this.log('info', '根据关键词搜索消息', {
      keyword: searchRequest.keyword,
      limit: searchRequest.limit,
      offset: searchRequest.offset,
      userId: this.userId,
    });

    try {
      const { keyword, limit = 20, offset = 0 } = searchRequest;

      // 使用 JOIN 查询来支持跨表搜索，但使用更简洁的 select 语法
      const result = await this.db
        .select({
          message: messages,
          topic: topics,
        })
        .from(messages)
        .leftJoin(topics, eq(messages.topicId, topics.id))
        .where(
          and(
            eq(messages.userId, this.userId!),
            or(ilike(messages.content, `%${keyword}%`), ilike(topics.title, `%${keyword}%`)),
          ),
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      const searchResults: MessageWithTopicResponse[] = result.map((row) => ({
        message: {
          ...row.message,
          createdAt: row.message.createdAt.toISOString(),
          favorite: !!row.message.favorite,
          updatedAt: row.message.updatedAt.toISOString(),
        },
        topic: row.topic
          ? {
              ...row.topic,
              createdAt: row.topic.createdAt.toISOString(),
              favorite: !!row.topic.favorite,
              updatedAt: row.topic.updatedAt.toISOString(),
            }
          : null,
      }));

      this.log('info', '关键词搜索消息完成', {
        keyword,
        resultCount: searchResults.length,
      });

      return searchResults;
    } catch (error) {
      this.log('error', '关键词搜索消息失败', { error, keyword: searchRequest.keyword });
      throw this.createCommonError('搜索消息失败');
    }
  }
}
