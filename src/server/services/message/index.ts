import { LobeChatDatabase } from '@lobechat/database';
import { CreateMessageParams, UIChatMessage, UpdateMessageParams } from '@lobechat/types';

import { MessageModel } from '@/database/models/message';

import { FileService } from '../file';

interface QueryOptions {
  groupId?: string | null;
  sessionId?: string | null;
  topicId?: string | null;
}

interface CreateMessageResult {
  id: string;
  messages: any[];
}

/**
 * Message Service
 *
 * Encapsulates repeated "mutation + conditional query" logic.
 * After performing update/delete operations, conditionally returns message list based on sessionId/topicId.
 */
export class MessageService {
  private messageModel: MessageModel;
  private fileService: FileService;

  constructor(db: LobeChatDatabase, userId: string) {
    this.messageModel = new MessageModel(db, userId);
    this.fileService = new FileService(db, userId);
  }

  /**
   * Unified URL processing function
   */
  private get postProcessUrl() {
    return (path: string | null) => this.fileService.getFullFileUrl(path);
  }

  /**
   * Unified query options
   */
  private getQueryOptions() {
    return {
      groupAssistantMessages: false,
      postProcessUrl: this.postProcessUrl,
    };
  }

  /**
   * Query messages and return response with success status (used after mutations)
   */
  private async queryWithSuccess(
    options?: QueryOptions,
  ): Promise<{ messages?: UIChatMessage[], success: boolean; }> {
    if (!options || (options.sessionId === undefined && options.topicId === undefined)) {
      return { success: true };
    }

    const { sessionId, topicId, groupId } = options;

    const messages = await this.messageModel.query(
      { groupId, sessionId, topicId },
      this.getQueryOptions(),
    );

    return { messages, success: true };
  }

  /**
   * Create a new message and return the complete message list
   * Pattern: create + query
   *
   * This method combines message creation and querying into a single operation,
   * reducing the need for separate refresh calls and improving performance.
   */
  async createMessage(params: CreateMessageParams): Promise<CreateMessageResult> {
    // 1. Create the message
    const item = await this.messageModel.create(params);

    // 2. Query all messages for this session/topic
    const messages = await this.messageModel.query(
      {
        current: 0,
        groupId: params.groupId,
        pageSize: 9999,
        sessionId: params.sessionId,
        topicId: params.topicId,
      },
      {
        groupAssistantMessages: false,
        postProcessUrl: this.postProcessUrl,
      },
    );

    // 3. Return the result
    return {
      id: item.id,
      messages,
    };
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
   * Update plugin state and return message list
   * Pattern: update + conditional query
   */
  async updatePluginState(
    id: string,
    value: any,
    options: QueryOptions,
  ): Promise<{ messages?: UIChatMessage[], success: boolean; }> {
    await this.messageModel.updatePluginState(id, value);
    return this.queryWithSuccess(options);
  }

  /**
   * Update message plugin and return message list
   * Pattern: update + conditional query
   */
  async updateMessagePlugin(
    id: string,
    value: any,
    options: QueryOptions,
  ): Promise<{ messages?: UIChatMessage[], success: boolean; }> {
    await this.messageModel.updateMessagePlugin(id, value);
    return this.queryWithSuccess(options);
  }

  /**
   * Update message and return message list
   * Pattern: update + conditional query
   */
  async updateMessage(
    id: string,
    value: UpdateMessageParams,
    options: QueryOptions,
  ): Promise<{ messages?: UIChatMessage[], success: boolean; }> {
    await this.messageModel.update(id, value as any);
    return this.queryWithSuccess(options);
  }

  /**
   * Update message metadata with optional message list return
   * Pattern: update + conditional query
   */
  async updateMetadata(id: string, value: any, options?: QueryOptions) {
    await this.messageModel.updateMetadata(id, value);
    return this.queryWithSuccess(options);
  }
}
