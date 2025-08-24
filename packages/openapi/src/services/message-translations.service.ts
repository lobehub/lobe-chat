import { eq } from 'drizzle-orm';

import { MessageTranslateItem, messageTranslates, messages } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { removeSystemContext } from '../helpers/translate';
import { ServiceResult } from '../types';
import {
  MessageTranslateInfoUpdate,
  MessageTranslateResponse,
  MessageTranslateTriggerRequest,
} from '../types/message-translations.type';
import { ChatService } from './chat.service';

export class MessageTranslateService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * 根据消息ID获取翻译信息
   * @param messageId 消息ID
   * @returns 翻译信息
   */
  async getTranslateByMessageId(messageId: string): ServiceResult<MessageTranslateResponse | null> {
    // 权限检查 - 读取目标信息
    const messageReadPermission = await this.resolveOperationPermission('MESSAGE_READ', {
      targetMessageId: messageId,
    });

    if (!messageReadPermission.isPermitted) {
      throw this.createAuthorizationError(messageReadPermission.message || '无权访问此消息的翻译');
    }

    // 权限检查 - 读取翻译信息
    const translateReadPermission = await this.resolveOperationPermission(
      'MESSAGE_TRANSLATE_READ',
      {
        targetMessageId: messageId,
      },
    );
    if (!translateReadPermission.isPermitted) {
      throw this.createAuthorizationError(
        translateReadPermission.message || '无权访问此消息的翻译',
      );
    }

    this.log('info', '根据消息ID获取翻译信息', { messageId, userId: this.userId });

    try {
      const result = await this.db.query.messageTranslates.findFirst({
        where: eq(messageTranslates.id, messageId),
      });

      if (!result) {
        this.log('info', '未找到翻译信息', { messageId });
        return null;
      }

      const response: MessageTranslateResponse = {
        clientId: result.clientId,
        content: result.content,
        from: result.from,
        id: result.id,
        to: result.to,
        userId: result.userId,
      };

      this.log('info', '获取翻译信息完成', { messageId });
      return response;
    } catch (error) {
      this.handleServiceError(error, '根据消息ID获取翻译信息');
    }
  }

  /**
   * 创建或更新消息翻译
   * @param translateData 翻译数据
   * @returns 翻译结果
   */
  async translateMessage(
    translateData: MessageTranslateTriggerRequest,
  ): ServiceResult<Partial<MessageTranslateItem>> {
    // 权限检查 - 读取目标信息
    const messageReadPermission = await this.resolveOperationPermission('MESSAGE_READ', {
      targetMessageId: translateData.messageId,
    });

    if (!messageReadPermission.isPermitted) {
      throw this.createAuthorizationError(messageReadPermission.message || '没有权限读取该消息');
    }

    // 权限检查 - 创建翻译
    const messageCreatePermission = await this.resolveOperationPermission('MESSAGE_CREATE', {
      targetMessageId: translateData.messageId,
    });
    if (!messageCreatePermission.isPermitted) {
      throw this.createAuthorizationError(messageCreatePermission.message || '没有权限创建翻译');
    }

    this.log('info', '开始翻译消息', {
      from: translateData.from,
      messageId: translateData.messageId,
      to: translateData.to,
      userId: this.userId,
    });

    try {
      // 首先获取原始消息内容和 sessionId
      const messageInfo = await this.getMessageWithSessionId(translateData.messageId);
      if (!messageInfo) {
        throw this.createCommonError('未找到要翻译的消息');
      }

      this.log('info', '原始消息内容', { originalMessage: messageInfo.content });

      // 使用ChatService进行翻译，传递 sessionId 以使用正确的模型配置
      const chatService = new ChatService(this.db, this.userId);
      const translatedContent = await chatService.translate({
        fromLanguage: translateData.from,
        sessionId: messageInfo.sessionId,
        text: removeSystemContext(messageInfo.content),
        toLanguage: translateData.to,
      });

      // 使用 updateTranslateInfo 来更新翻译内容
      return this.updateTranslateInfo({
        from: translateData.from,
        messageId: translateData.messageId,
        to: translateData.to,
        translatedContent,
      });
    } catch (error) {
      this.handleServiceError(error, '翻译消息');
    }
  }

  /**
   * 更新消息翻译信息
   * @param data 翻译信息更新数据
   * @returns 更新后的翻译结果
   */
  async updateTranslateInfo(
    data: MessageTranslateInfoUpdate,
  ): ServiceResult<Partial<MessageTranslateItem>> {
    // 权限检查 - 读取目标信息
    const messageReadPermission = await this.resolveOperationPermission('MESSAGE_READ', {
      targetMessageId: data.messageId,
    });
    if (!messageReadPermission.isPermitted) {
      throw this.createAuthorizationError(messageReadPermission.message || '无权更新此消息的翻译');
    }

    // 权限检查 - 更新翻译
    const messageUpdatePermission = await this.resolveOperationPermission('MESSAGE_UPDATE', {
      targetMessageId: data.messageId,
    });
    if (!messageUpdatePermission.isPermitted) {
      throw this.createAuthorizationError(
        messageUpdatePermission.message || '无权更新此消息的翻译',
      );
    }

    try {
      // 检查消息是否存在
      const messageInfo = await this.getMessageWithSessionId(data.messageId);
      if (!messageInfo) {
        throw this.createCommonError('未找到要更新翻译信息的消息');
      }

      // 更新翻译信息和内容
      await this.db
        .insert(messageTranslates)
        .values({
          content: data.translatedContent,
          from: data.from,
          id: data.messageId,
          to: data.to,
          userId: this.userId,
        })
        .onConflictDoUpdate({
          set: {
            content: data.translatedContent,
            from: data.from,
            to: data.to,
          },
          target: messageTranslates.id,
        });

      this.log('info', '更新翻译信息完成', { messageId: data.messageId });

      return {
        content: data.translatedContent,
        from: data.from,
        id: data.messageId,
        to: data.to,
        userId: this.userId,
      };
    } catch (error) {
      this.handleServiceError(error, '更新翻译信息');
    }
  }

  /**
   * 获取消息内容和 sessionId
   * @param messageId 消息ID
   * @returns 消息内容和 sessionId
   */
  private async getMessageWithSessionId(
    messageId: string,
  ): Promise<{ content: string; sessionId: string } | null> {
    try {
      const result = await this.db.query.messages.findFirst({
        columns: { content: true, sessionId: true },
        where: eq(messages.id, messageId),
      });

      if (!result?.content || !result?.sessionId) {
        return null;
      }

      return {
        content: result.content,
        sessionId: result.sessionId,
      };
    } catch (error) {
      this.handleServiceError(error, '获取消息内容和 sessionId');
    }
  }
}
