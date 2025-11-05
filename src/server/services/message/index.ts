import { LobeChatDatabase } from '@lobechat/database';
import { UpdateMessageParams } from '@lobechat/types';

import { MessageModel } from '@/database/models/message';

import { FileService } from '../file';

interface QueryOptions {
  groupId?: string | null;
  sessionId?: string | null;
  topicId?: string | null;
  useGroup?: boolean;
}

/**
 * Message Service
 *
 * 主要封装 "mutation + conditional query" 的重复逻辑
 * 即：执行更新/删除操作后，根据 sessionId/topicId 条件返回消息列表
 */
export class MessageService {
  private messageModel: MessageModel;
  private fileService: FileService;

  constructor(db: LobeChatDatabase, userId: string) {
    this.messageModel = new MessageModel(db, userId);
    this.fileService = new FileService(db, userId);
  }

  /**
   * 统一的 URL 处理函数
   */
  private get postProcessUrl() {
    return (path: string | null) => this.fileService.getFullFileUrl(path);
  }

  /**
   * 统一的查询选项
   */
  private getQueryOptions(options: QueryOptions) {
    return {
      groupAssistantMessages: options.useGroup ?? false,
      postProcessUrl: this.postProcessUrl,
    };
  }

  /**
   * 查询消息并返回带 success 状态的响应 (mutation 后使用)
   */
  private async queryWithSuccess(options?: QueryOptions) {
    if (!options || (options.sessionId === undefined && options.topicId === undefined)) {
      return { success: true };
    }

    const { sessionId, topicId, groupId } = options;

    const messages = await this.messageModel.query(
      { groupId, sessionId, topicId },
      this.getQueryOptions(options),
    );

    return { messages, success: true };
  }

  /**
   * Remove messages with optional message list return
   * Pattern: delete + conditional query
   */
  async removeMessages(ids: string[], options?: QueryOptions) {
    await this.messageModel.deleteMessages(ids);
    return this.queryWithSuccess(options);
  }

  /**
   * Remove single message with optional message list return
   * Pattern: delete + conditional query
   */
  async removeMessage(id: string, options?: QueryOptions) {
    await this.messageModel.deleteMessage(id);
    return this.queryWithSuccess(options);
  }

  /**
   * Update message RAG with optional message list return
   * Pattern: update + conditional query
   */
  async updateMessageRAG(id: string, value: any, options?: QueryOptions) {
    await this.messageModel.updateMessageRAG(id, value);
    return this.queryWithSuccess(options);
  }

  /**
   * Update plugin error with optional message list return
   * Pattern: update + conditional query
   */
  async updatePluginError(id: string, value: any, options?: QueryOptions) {
    await this.messageModel.updateMessagePlugin(id, { error: value });
    return this.queryWithSuccess(options);
  }

  /**
   * Update plugin state (always returns result)
   * Pattern: update with context options
   */
  async updatePluginState(id: string, value: any, options: QueryOptions): Promise<any> {
    return this.messageModel.updatePluginState(id, value, {
      ...this.getQueryOptions(options),
      sessionId: options.sessionId,
      topicId: options.topicId,
    });
  }

  /**
   * Update message (always returns result)
   * Pattern: update with context options
   */
  async updateMessage(id: string, value: UpdateMessageParams, options: QueryOptions): Promise<any> {
    return this.messageModel.update(id, value as any, {
      ...this.getQueryOptions(options),
      sessionId: options.sessionId,
      topicId: options.topicId,
    });
  }
}
