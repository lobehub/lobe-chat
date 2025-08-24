import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { MessageService } from '../services/message.service';
import {
  MessagesCountQuery,
  MessagesCreateRequest,
  MessagesListQuery,
} from '../types/message.type';

export class MessageController extends BaseController {
  /**
   * 统一的消息数量统计接口 (RESTful API 优化后)
   * GET /api/v1/messages/count
   * Query: { topicIds?: string, userId?: string }
   */
  async handleCountMessages(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const rawQuery = this.getQuery(c);

      // 处理 topicIds 参数 (comma-separated string -> array)
      const processedQuery: MessagesCountQuery = {
        ...rawQuery,
        topicIds: rawQuery.topicIds ? (rawQuery.topicIds as string).split(',') : undefined,
      };

      const db = await this.getDatabase();
      const messageService = new MessageService(db, userId);
      const result = await messageService.countMessages(processedQuery);

      return this.success(c, result, '查询消息数量成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 统一的消息列表查询接口 (RESTful API 优化后)
   * GET /api/v1/messages
   * Query: { page?, limit?, topicId?, sessionId?, userId?, role?, query?, sort?, order? }
   */
  async handleGetMessages(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const rawQuery = this.getQuery(c);

      // 处理数字类型的查询参数 (查询参数都是字符串，需要转换)
      const processedQuery: MessagesListQuery = {
        ...rawQuery,
        limit: rawQuery.limit ? parseInt(rawQuery.limit as string, 10) : undefined,
        offset: rawQuery.offset ? parseInt(rawQuery.offset as string, 10) : undefined,
        page: rawQuery.page ? parseInt(rawQuery.page as string, 10) : undefined,
      };

      const db = await this.getDatabase();
      const messageService = new MessageService(db, userId);
      const result = await messageService.getMessages(processedQuery);

      return this.success(c, result, '获取消息列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 根据消息ID获取消息详情
   * GET /api/v1/messages/:id
   * Params: { id: string }
   */
  async handleGetMessageById(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const { id } = this.getParams<{ id: string }>(c);

      const db = await this.getDatabase();
      const messageService = new MessageService(db, userId);
      const message = await messageService.getMessageById(id);

      if (!message) {
        return this.error(c, '消息不存在或无权限访问', 404);
      }

      return this.success(c, message, '获取消息详情成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 创建新消息
   * POST /api/v1/messages/create
   * Body: { content: string, role: 'assistant'|'user', sessionId: string, topic: string, fromModel: string, fromProvider: string, files?: string[] }
   */
  async handleCreateMessage(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const messageData = (await this.getBody<MessagesCreateRequest>(c))!;

      const db = await this.getDatabase();
      const messageService = new MessageService(db, userId);
      const result = await messageService.createMessage(messageData);

      return this.success(c, result, '创建消息成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 创建用户消息并生成AI回复
   * POST /api/v1/messages/create-with-reply
   * Body: { content: string, role: 'assistant'|'user', sessionId: string, topic: string, fromModel: string, fromProvider: string, files?: string[] }
   */
  async handleCreateMessageWithAIReply(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const messageData = (await this.getBody<MessagesCreateRequest>(c))!;

      const db = await this.getDatabase();
      const messageService = new MessageService(db, userId);
      const result = await messageService.createMessageWithAIReply(messageData);

      return this.success(c, result, '创建消息并生成AI回复成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
