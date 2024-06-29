import { count, sql } from 'drizzle-orm';
import { and, asc, desc, eq, isNull, like } from 'drizzle-orm/expressions';
import { inArray } from 'drizzle-orm/sql/expressions/conditions';

import { CreateMessageParams } from '@/database/client/models/message';
import { serverDB } from '@/database/server/core/db';
import { idGenerator } from '@/database/server/utils/idGenerator';
import { ChatTTS, ChatToolPayload } from '@/types/message';
import { merge } from '@/utils/merge';

import {
  MessageItem,
  filesToMessages,
  messagePlugins,
  messageTTS,
  messageTranslates,
  messages,
} from '../schemas/lobechat';

export interface QueryMessageParams {
  current?: number;
  pageSize?: number;
  sessionId?: string | null;
  topicId?: string | null;
}

export class MessageModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // **************** Query *************** //
  async query({
    current = 0,
    pageSize = 1000,
    sessionId,
    topicId,
  }: QueryMessageParams = {}): Promise<MessageItem[]> {
    const offset = current * pageSize;

    const result = await serverDB
      .select({
        /* eslint-disable sort-keys-fix/sort-keys-fix*/
        id: messages.id,
        role: messages.role,
        content: messages.content,
        error: messages.error,

        model: messages.model,
        provider: messages.provider,

        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,

        parentId: messages.parentId,

        tools: messages.tools,
        tool_call_id: messagePlugins.toolCallId,

        plugin: {
          apiName: messagePlugins.apiName,
          arguments: messagePlugins.arguments,
          identifier: messagePlugins.identifier,
          type: messagePlugins.type,
        },
        pluginError: messagePlugins.error,
        pluginState: messagePlugins.state,

        translate: {
          content: messageTranslates.content,
          from: messageTranslates.from,
          to: messageTranslates.to,
        },

        ttsId: messageTTS.id,

        // TODO: 确认下如何处理 TTS 的读取
        // ttsContentMd5: messageTTS.contentMd5,
        // ttsFile: messageTTS.fileId,
        // ttsVoice: messageTTS.voice,
        /* eslint-enable */
      })
      .from(messages)
      .where(
        and(
          eq(messages.userId, this.userId),
          this.matchSession(sessionId),
          this.matchTopic(topicId),
        ),
      )
      .leftJoin(messagePlugins, eq(messagePlugins.id, messages.id))
      .leftJoin(messageTranslates, eq(messageTranslates.id, messages.id))
      .leftJoin(messageTTS, eq(messageTTS.id, messages.id))
      .orderBy(asc(messages.createdAt))
      .limit(pageSize)
      .offset(offset);

    const messageIds = result.map((message) => message.id as string);

    if (messageIds.length === 0) return result;

    const fileIds = await serverDB
      .select({
        fileId: filesToMessages.fileId,
        messageId: filesToMessages.messageId,
      })
      .from(filesToMessages)
      .where(inArray(filesToMessages.messageId, messageIds));

    return result.map(
      ({
        model,
        provider,
        translate,
        ttsId,
        // ttsFile, ttsId, ttsContentMd5, ttsVoice,
        ...item
      }) => ({
        ...item,
        extra: {
          fromModel: model,
          fromProvider: provider,
          translate,
          tts: ttsId
            ? {
                // contentMd5: ttsContentMd5,
                // file: ttsFile,
                // voice: ttsVoice,
              }
            : undefined,
        },
        files: fileIds.filter((relation) => relation.messageId === item.id).map((r) => r.fileId),
      }),
    );
  }

  async findById(id: string) {
    return serverDB.query.messages.findFirst({
      where: and(eq(messages.id, id), eq(messages.userId, this.userId)),
    });
  }

  async queryAll(): Promise<MessageItem[]> {
    return serverDB
      .select()
      .from(messages)
      .orderBy(messages.createdAt)
      .where(eq(messages.userId, this.userId))

      .execute();
  }

  async queryBySessionId(sessionId?: string | null): Promise<MessageItem[]> {
    return serverDB.query.messages.findMany({
      orderBy: [asc(messages.createdAt)],
      where: and(eq(messages.userId, this.userId), this.matchSession(sessionId)),
    });
  }

  async queryByKeyword(keyword: string): Promise<MessageItem[]> {
    if (!keyword) return [];

    return serverDB.query.messages.findMany({
      orderBy: [desc(messages.createdAt)],
      where: and(eq(messages.userId, this.userId), like(messages.content, `%${keyword}%`)),
    });
  }

  async count() {
    const result = await serverDB
      .select({
        count: count(),
      })
      .from(messages)
      .where(eq(messages.userId, this.userId))
      .execute();

    return result[0].count;
  }

  async countToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await serverDB
      .select({
        count: count(),
      })
      .from(messages)
      .where(
        and(
          eq(messages.userId, this.userId),
          sql`${messages.createdAt} >= ${today} AND ${messages.createdAt} < ${tomorrow}`,
        ),
      )
      .execute();

    return result[0].count;
  }

  // **************** Create *************** //

  async create(
    { fromModel, fromProvider, files, ...message }: CreateMessageParams,
    id: string = this.genId(),
  ): Promise<MessageItem> {
    return serverDB.transaction(async (trx) => {
      const [item] = (await trx
        .insert(messages)
        .values({
          ...message,
          id,
          model: fromModel,
          provider: fromProvider,
          userId: this.userId,
        })
        .returning()) as MessageItem[];

      // Insert the plugin data if the message is a tool
      if (message.role === 'tool') {
        await trx.insert(messagePlugins).values({
          apiName: message.plugin?.apiName,
          arguments: message.plugin?.arguments,
          id,
          identifier: message.plugin?.identifier,
          toolCallId: message.tool_call_id,
          type: message.plugin?.type,
        });
      }

      if (files && files.length > 0) {
        await trx
          .insert(filesToMessages)
          .values(files.map((file) => ({ fileId: file, messageId: id })));
      }

      return item;
    });
  }

  async batchCreate(newMessages: MessageItem[]) {
    const messagesToInsert = newMessages.map((m) => {
      return { ...m, userId: this.userId };
    });

    return serverDB.insert(messages).values(messagesToInsert);
  }

  // **************** Update *************** //

  async update(id: string, message: Partial<MessageItem>) {
    return serverDB
      .update(messages)
      .set(message)
      .where(and(eq(messages.id, id), eq(messages.userId, this.userId)));
  }

  async updatePluginState(id: string, state: Record<string, any>) {
    const item = await serverDB.query.messagePlugins.findFirst({
      where: eq(messagePlugins.id, id),
    });
    if (!item) throw new Error('Plugin not found');

    return serverDB
      .update(messagePlugins)
      .set({ state: merge(item.state || {}, state) })
      .where(eq(messagePlugins.id, id));
  }

  async updateTranslate(id: string, translate: Partial<MessageItem>) {
    const result = await serverDB.query.messageTranslates.findFirst({
      where: and(eq(messageTranslates.id, id)),
    });

    // If the message does not exist in the translate table, insert it
    if (!result) {
      return serverDB.insert(messageTranslates).values({ ...translate, id });
    }

    // or just update the existing one
    return serverDB.update(messageTranslates).set(translate).where(eq(messageTranslates.id, id));
  }

  async updateTTS(id: string, tts: Partial<ChatTTS>) {
    const result = await serverDB.query.messageTTS.findFirst({
      where: and(eq(messageTTS.id, id)),
    });

    // If the message does not exist in the translate table, insert it
    if (!result) {
      return serverDB
        .insert(messageTTS)
        .values({ contentMd5: tts.contentMd5, fileId: tts.file, id, voice: tts.voice });
    }

    // or just update the existing one
    return serverDB
      .update(messageTTS)
      .set({ contentMd5: tts.contentMd5, fileId: tts.file, voice: tts.voice })
      .where(eq(messageTTS.id, id));
  }

  // **************** Delete *************** //

  async deleteMessage(id: string) {
    return serverDB.transaction(async (tx) => {
      // 1. 查询要删除的 message 的完整信息
      const message = await tx
        .select()
        .from(messages)
        .where(and(eq(messages.id, id), eq(messages.userId, this.userId)))
        .limit(1);

      // 如果找不到要删除的 message,直接返回
      if (message.length === 0) return;

      // 2. 检查 message 是否包含 tools
      const toolCallIds = message[0].tools?.map((tool: ChatToolPayload) => tool.id).filter(Boolean);

      let relatedMessageIds: string[] = [];

      if (toolCallIds?.length > 0) {
        // 3. 如果 message 包含 tools,查询出所有相关联的 message id
        const res = await tx
          .select({ id: messagePlugins.id })
          .from(messagePlugins)
          .where(inArray(messagePlugins.toolCallId, toolCallIds))
          .execute();

        relatedMessageIds = res.map((row) => row.id);
      }

      // 4. 合并要删除的 message id 列表
      const messageIdsToDelete = [id, ...relatedMessageIds];

      // 5. 删除所有相关的 message
      await tx.delete(messages).where(inArray(messages.id, messageIdsToDelete));
    });
  }

  async deleteMessageTranslate(id: string) {
    return serverDB.delete(messageTranslates).where(and(eq(messageTranslates.id, id)));
  }

  async deleteMessageTTS(id: string) {
    return serverDB.delete(messageTTS).where(and(eq(messageTTS.id, id)));
  }

  async deleteMessages(sessionId?: string | null, topicId?: string | null) {
    return serverDB
      .delete(messages)
      .where(
        and(
          eq(messages.userId, this.userId),
          this.matchSession(sessionId),
          this.matchTopic(topicId),
        ),
      );
  }

  async deleteAllMessages() {
    return serverDB.delete(messages).where(eq(messages.userId, this.userId));
  }

  // **************** Helper *************** //

  private genId = () => idGenerator('messages', 14);

  private matchSession = (sessionId?: string | null) =>
    sessionId ? eq(messages.sessionId, sessionId) : isNull(messages.sessionId);

  private matchTopic = (topicId?: string | null) =>
    topicId ? eq(messages.topicId, topicId) : isNull(messages.topicId);
}
