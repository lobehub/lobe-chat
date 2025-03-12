import type { HeatmapsProps } from '@lobehub/charts';
import dayjs from 'dayjs';
import { count, sql } from 'drizzle-orm';
import { and, asc, desc, eq, gt, inArray, isNotNull, isNull, like } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';
import {
  genEndDateWhere,
  genRangeWhere,
  genStartDateWhere,
  genWhere,
} from '@/database/utils/genWhere';
import { idGenerator } from '@/database/utils/idGenerator';
import {
  ChatFileItem,
  ChatImageItem,
  ChatMessage,
  ChatTTS,
  ChatToolPayload,
  ChatTranslate,
  CreateMessageParams,
  MessageItem,
  ModelRankItem,
} from '@/types/message';
import { merge } from '@/utils/merge';
import { today } from '@/utils/time';

import {
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
    options: {
      postProcessUrl?: (path: string | null, file: { fileType: string }) => Promise<string>;
    } = {},
  ) => {
    const offset = current * pageSize;

    // 1. get basic messages
    const result = await this.db
      .select({
        /* eslint-disable sort-keys-fix/sort-keys-fix*/
        id: messages.id,
        role: messages.role,
        content: messages.content,
        reasoning: messages.reasoning,
        search: messages.search,
        metadata: messages.metadata,
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
        url: options.postProcessUrl
          ? await options.postProcessUrl(file.url, file as any)
          : (file.url as string),
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

          meta: {},
          ragQuery: messageQuery?.rewriteQuery,
          ragQueryId: messageQuery?.id,
          ragRawQuery: messageQuery?.userQuery,
        } as unknown as ChatMessage;
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

  queryAll = async () => {
    const result = await this.db
      .select()
      .from(messages)
      .orderBy(messages.createdAt)
      .where(eq(messages.userId, this.userId));

    return result as MessageItem[];
  };

  queryBySessionId = async (sessionId?: string | null) => {
    const result = await this.db.query.messages.findMany({
      orderBy: [asc(messages.createdAt)],
      where: and(eq(messages.userId, this.userId), this.matchSession(sessionId)),
    });

    return result as MessageItem[];
  };

  queryByKeyword = async (keyword: string) => {
    if (!keyword) return [];
    const result = await this.db.query.messages.findMany({
      orderBy: [desc(messages.createdAt)],
      where: and(eq(messages.userId, this.userId), like(messages.content, `%${keyword}%`)),
    });

    return result as MessageItem[];
  };

  count = async (params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number> => {
    const result = await this.db
      .select({
        count: count(messages.id),
      })
      .from(messages)
      .where(
        genWhere([
          eq(messages.userId, this.userId),
          params?.range
            ? genRangeWhere(params.range, messages.createdAt, (date) => date.toDate())
            : undefined,
          params?.endDate
            ? genEndDateWhere(params.endDate, messages.createdAt, (date) => date.toDate())
            : undefined,
          params?.startDate
            ? genStartDateWhere(params.startDate, messages.createdAt, (date) => date.toDate())
            : undefined,
        ]),
      );

    return result[0].count;
  };

  countWords = async (params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number> => {
    const result = await this.db
      .select({
        count: sql<string>`sum(length(${messages.content}))`.as('total_length'),
      })
      .from(messages)
      .where(
        genWhere([
          eq(messages.userId, this.userId),
          params?.range
            ? genRangeWhere(params.range, messages.createdAt, (date) => date.toDate())
            : undefined,
          params?.endDate
            ? genEndDateWhere(params.endDate, messages.createdAt, (date) => date.toDate())
            : undefined,
          params?.startDate
            ? genStartDateWhere(params.startDate, messages.createdAt, (date) => date.toDate())
            : undefined,
        ]),
      );

    return Number(result[0].count);
  };

  rankModels = async (limit: number = 10): Promise<ModelRankItem[]> => {
    return this.db
      .select({
        count: count(messages.id).as('count'),
        id: messages.model,
      })
      .from(messages)
      .where(and(eq(messages.userId, this.userId), isNotNull(messages.model)))
      .having(({ count }) => gt(count, 0))
      .groupBy(messages.model)
      .orderBy(desc(sql`count`), asc(messages.model))
      .limit(limit);
  };

  getHeatmaps = async (): Promise<HeatmapsProps['data']> => {
    const startDate = today().subtract(1, 'year').startOf('day');
    const endDate = today().endOf('day');

    const result = await this.db
      .select({
        count: count(messages.id),
        date: sql`DATE(${messages.createdAt})`.as('heatmaps_date'),
      })
      .from(messages)
      .where(
        genWhere([
          eq(messages.userId, this.userId),
          genRangeWhere(
            [startDate.format('YYYY-MM-DD'), endDate.add(1, 'day').format('YYYY-MM-DD')],
            messages.createdAt,
            (date) => date.toDate(),
          ),
        ]),
      )
      .groupBy(sql`heatmaps_date`)
      .orderBy(desc(sql`heatmaps_date`));

    const heatmapData: HeatmapsProps['data'] = [];
    let currentDate = startDate;

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      const formattedDate = currentDate.format('YYYY-MM-DD');
      const matchingResult = result.find(
        (r) => r?.date && dayjs(r.date as string).format('YYYY-MM-DD') === formattedDate,
      );

      const count = matchingResult ? matchingResult.count : 0;
      const levelCount = count > 0 ? Math.ceil(count / 5) : 0;
      const level = levelCount > 4 ? 4 : levelCount;

      heatmapData.push({
        count,
        date: formattedDate,
        level,
      });

      currentDate = currentDate.add(1, 'day');
    }

    return heatmapData;
  };

  hasMoreThanN = async (n: number): Promise<boolean> => {
    const result = await this.db
      .select({ id: messages.id })
      .from(messages)
      .where(eq(messages.userId, this.userId))
      .limit(n + 1);

    return result.length > n;
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
      updatedAt,
      createdAt,
      ...message
    }: CreateMessageParams,
    id: string = this.genId(),
  ): Promise<MessageItem> => {
    return this.db.transaction(async (trx) => {
      const [item] = (await trx
        .insert(messages)
        .values({
          ...message,
          // TODO: remove this when the client is updated
          createdAt: createdAt ? new Date(createdAt) : undefined,
          id,
          model: fromModel,
          provider: fromProvider,
          updatedAt: updatedAt ? new Date(updatedAt) : undefined,
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
      // TODO: need a better way to handle this
      return { ...m, role: m.role as any, userId: this.userId };
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
      .set({
        ...message,
        // TODO: need a better way to handle this
        role: message.role as any,
      })
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

  updateTranslate = async (id: string, translate: Partial<ChatTranslate>) => {
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
      const toolCallIds = (message[0].tools as ChatToolPayload[])
        ?.map((tool) => tool.id)
        .filter(Boolean);

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
