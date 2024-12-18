import { count } from 'drizzle-orm';
import { and, asc, desc, eq, gte, inArray, isNull, like, lt } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';
import { idGenerator } from '@/database/utils/idGenerator';
import {
  ChatFileItem,
  ChatImageItem,
  ChatTTS,
  ChatToolPayload,
  CreateMessageParams,
} from '@/types/message';
import { merge } from '@/utils/merge';

import {
  MessageItem,
  MessagePluginItem,
  NewMessageQuery,
  chunks,
  embeddings,
  fileChunks,
  files,
  messagePlugins,
  messageQueries,
  messageQueryChunks,
  messageTTS,
  messageTranslates,
  messages,
  messagesFiles,
} from '../../schemas';

export interface QueryMessageParams {
  current?: number;
  pageSize?: number;
  sessionId?: string | null;
  topicId?: string | null;
}

export class MessageModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  // **************** Query *************** //
  query = async (
    { current = 0, pageSize = 1000, sessionId, topicId }: QueryMessageParams = {},
    options: { postProcessUrl?: (path: string | null) => Promise<string> } = {},
  ): Promise<MessageItem[]> => {
    const offset = current * pageSize;

    // 1. get basic messages
    const result = await this.db
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
        threadId: messages.threadId,

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
        ttsContentMd5: messageTTS.contentMd5,
        ttsFile: messageTTS.fileId,
        ttsVoice: messageTTS.voice,
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

    if (messageIds.length === 0) return [];

    // 2. get relative files
    const rawRelatedFileList = await this.db
      .select({
        fileType: files.fileType,
        id: messagesFiles.fileId,
        messageId: messagesFiles.messageId,
        name: files.name,
        size: files.size,
        url: files.url,
      })
      .from(messagesFiles)
      .leftJoin(files, eq(files.id, messagesFiles.fileId))
      .where(inArray(messagesFiles.messageId, messageIds));

    const relatedFileList = await Promise.all(
      rawRelatedFileList.map(async (file) => ({
        ...file,
        url: options.postProcessUrl ? await options.postProcessUrl(file.url) : (file.url as string),
      })),
    );

    const imageList = relatedFileList.filter((i) => (i.fileType || '').startsWith('image'));
    const fileList = relatedFileList.filter((i) => !(i.fileType || '').startsWith('image'));

    // 3. get relative file chunks
    const chunksList = await this.db
      .select({
        fileId: files.id,
        fileType: files.fileType,
        fileUrl: files.url,
        filename: files.name,
        id: chunks.id,
        messageId: messageQueryChunks.messageId,
        similarity: messageQueryChunks.similarity,
        text: chunks.text,
      })
      .from(messageQueryChunks)
      .leftJoin(chunks, eq(chunks.id, messageQueryChunks.chunkId))
      .leftJoin(fileChunks, eq(fileChunks.chunkId, chunks.id))
      .innerJoin(files, eq(fileChunks.fileId, files.id))
      .where(inArray(messageQueryChunks.messageId, messageIds));

    // 3. get relative message query
    const messageQueriesList = await this.db
      .select({
        id: messageQueries.id,
        messageId: messageQueries.messageId,
        rewriteQuery: messageQueries.rewriteQuery,
        userQuery: messageQueries.userQuery,
      })
      .from(messageQueries)
      .where(inArray(messageQueries.messageId, messageIds));

    return result.map(
      ({ model, provider, translate, ttsId, ttsFile, ttsContentMd5, ttsVoice, ...item }) => {
        const messageQuery = messageQueriesList.find((relation) => relation.messageId === item.id);
        return {
          ...item,
          chunksList: chunksList
            .filter((relation) => relation.messageId === item.id)
            .map((c) => ({
              ...c,
              similarity: Number(c.similarity) ?? undefined,
            })),

          extra: {
            fromModel: model,
            fromProvider: provider,
            translate,
            tts: ttsId
              ? {
                  contentMd5: ttsContentMd5,
                  file: ttsFile,
                  voice: ttsVoice,
                }
              : undefined,
          },
          fileList: fileList
            .filter((relation) => relation.messageId === item.id)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .map<ChatFileItem>(({ id, url, size, fileType, name }) => ({
              fileType: fileType!,
              id,
              name: name!,
              size: size!,
              url,
            })),

          imageList: imageList
            .filter((relation) => relation.messageId === item.id)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .map<ChatImageItem>(({ id, url, name }) => ({ alt: name!, id, url })),

          ragQuery: messageQuery?.rewriteQuery,
          ragQueryId: messageQuery?.id,
          ragRawQuery: messageQuery?.userQuery,
        };
      },
    );
  };

  findById = async (id: string) => {
    return this.db.query.messages.findFirst({
      where: and(eq(messages.id, id), eq(messages.userId, this.userId)),
    });
  };

  findMessageQueriesById = async (messageId: string) => {
    const result = await this.db
      .select({
        embeddings: embeddings.embeddings,
        id: messageQueries.id,
        query: messageQueries.rewriteQuery,
        rewriteQuery: messageQueries.rewriteQuery,
        userQuery: messageQueries.userQuery,
      })
      .from(messageQueries)
      .where(and(eq(messageQueries.messageId, messageId)))
      .leftJoin(embeddings, eq(embeddings.id, messageQueries.embeddingsId));

    if (result.length === 0) return undefined;

    return result[0];
  };

  queryAll = async (): Promise<MessageItem[]> => {
    return this.db
      .select()
      .from(messages)
      .orderBy(messages.createdAt)
      .where(eq(messages.userId, this.userId));
  };

  queryBySessionId = async (sessionId?: string | null): Promise<MessageItem[]> => {
    return this.db.query.messages.findMany({
      orderBy: [asc(messages.createdAt)],
      where: and(eq(messages.userId, this.userId), this.matchSession(sessionId)),
    });
  };

  queryByKeyword = async (keyword: string): Promise<MessageItem[]> => {
    if (!keyword) return [];
    return this.db.query.messages.findMany({
      orderBy: [desc(messages.createdAt)],
      where: and(eq(messages.userId, this.userId), like(messages.content, `%${keyword}%`)),
    });
  };

  count = async (): Promise<number> => {
    const result = await this.db
      .select({
        count: count(messages.id),
      })
      .from(messages)
      .where(eq(messages.userId, this.userId));

    return result[0].count;
  };

  countToday = async (): Promise<number> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await this.db
      .select({
        count: count(messages.id),
      })
      .from(messages)
      .where(
        and(
          eq(messages.userId, this.userId),
          gte(messages.createdAt, today),
          lt(messages.createdAt, tomorrow),
        ),
      );

    return result[0].count;
  };

  // **************** Create *************** //

  create = async (
    {
      fromModel,
      fromProvider,
      files,
      plugin,
      pluginState,
      fileChunks,
      ragQueryId,
      ...message
    }: CreateMessageParams,
    id: string = this.genId(),
  ): Promise<MessageItem> => {
    return this.db.transaction(async (trx) => {
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
          apiName: plugin?.apiName,
          arguments: plugin?.arguments,
          id,
          identifier: plugin?.identifier,
          state: pluginState,
          toolCallId: message.tool_call_id,
          type: plugin?.type,
        });
      }

      if (files && files.length > 0) {
        await trx
          .insert(messagesFiles)
          .values(files.map((file) => ({ fileId: file, messageId: id })));
      }

      if (fileChunks && fileChunks.length > 0 && ragQueryId) {
        await trx.insert(messageQueryChunks).values(
          fileChunks.map((chunk) => ({
            chunkId: chunk.id,
            messageId: id,
            queryId: ragQueryId,
            similarity: chunk.similarity?.toString(),
          })),
        );
      }

      return item;
    });
  };

  batchCreate = async (newMessages: MessageItem[]) => {
    const messagesToInsert = newMessages.map((m) => {
      return { ...m, userId: this.userId };
    });

    return this.db.insert(messages).values(messagesToInsert);
  };

  createMessageQuery = async (params: NewMessageQuery) => {
    const result = await this.db.insert(messageQueries).values(params).returning();

    return result[0];
  };
  // **************** Update *************** //

  update = async (id: string, message: Partial<MessageItem>) => {
    return this.db
      .update(messages)
      .set(message)
      .where(and(eq(messages.id, id), eq(messages.userId, this.userId)));
  };

  updatePluginState = async (id: string, state: Record<string, any>) => {
    const item = await this.db.query.messagePlugins.findFirst({
      where: eq(messagePlugins.id, id),
    });
    if (!item) throw new Error('Plugin not found');

    return this.db
      .update(messagePlugins)
      .set({ state: merge(item.state || {}, state) })
      .where(eq(messagePlugins.id, id));
  };

  updateMessagePlugin = async (id: string, value: Partial<MessagePluginItem>) => {
    const item = await this.db.query.messagePlugins.findFirst({
      where: eq(messagePlugins.id, id),
    });
    if (!item) throw new Error('Plugin not found');

    return this.db.update(messagePlugins).set(value).where(eq(messagePlugins.id, id));
  };

  updateTranslate = async (id: string, translate: Partial<MessageItem>) => {
    const result = await this.db.query.messageTranslates.findFirst({
      where: and(eq(messageTranslates.id, id)),
    });

    // If the message does not exist in the translate table, insert it
    if (!result) {
      return this.db.insert(messageTranslates).values({ ...translate, id });
    }

    // or just update the existing one
    return this.db.update(messageTranslates).set(translate).where(eq(messageTranslates.id, id));
  };

  updateTTS = async (id: string, tts: Partial<ChatTTS>) => {
    const result = await this.db.query.messageTTS.findFirst({
      where: and(eq(messageTTS.id, id)),
    });

    // If the message does not exist in the translate table, insert it
    if (!result) {
      return this.db
        .insert(messageTTS)
        .values({ contentMd5: tts.contentMd5, fileId: tts.file, id, voice: tts.voice });
    }

    // or just update the existing one
    return this.db
      .update(messageTTS)
      .set({ contentMd5: tts.contentMd5, fileId: tts.file, voice: tts.voice })
      .where(eq(messageTTS.id, id));
  };

  // **************** Delete *************** //

  deleteMessage = async (id: string) => {
    return this.db.transaction(async (tx) => {
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
          .where(inArray(messagePlugins.toolCallId, toolCallIds));

        relatedMessageIds = res.map((row) => row.id);
      }

      // 4. 合并要删除的 message id 列表
      const messageIdsToDelete = [id, ...relatedMessageIds];

      // 5. 删除所有相关的 message
      await tx.delete(messages).where(inArray(messages.id, messageIdsToDelete));
    });
  };

  deleteMessages = async (ids: string[]) =>
    this.db
      .delete(messages)
      .where(and(eq(messages.userId, this.userId), inArray(messages.id, ids)));

  deleteMessageTranslate = async (id: string) =>
    this.db.delete(messageTranslates).where(and(eq(messageTranslates.id, id)));

  deleteMessageTTS = async (id: string) =>
    this.db.delete(messageTTS).where(and(eq(messageTTS.id, id)));

  deleteMessageQuery = async (id: string) =>
    this.db.delete(messageQueries).where(and(eq(messageQueries.id, id)));

  deleteMessagesBySession = async (sessionId?: string | null, topicId?: string | null) =>
    this.db
      .delete(messages)
      .where(
        and(
          eq(messages.userId, this.userId),
          this.matchSession(sessionId),
          this.matchTopic(topicId),
        ),
      );

  deleteAllMessages = async () => {
    return this.db.delete(messages).where(eq(messages.userId, this.userId));
  };

  // **************** Helper *************** //

  private genId = () => idGenerator('messages', 14);

  private matchSession = (sessionId?: string | null) =>
    sessionId ? eq(messages.sessionId, sessionId) : isNull(messages.sessionId);

  private matchTopic = (topicId?: string | null) =>
    topicId ? eq(messages.topicId, topicId) : isNull(messages.topicId);
}
