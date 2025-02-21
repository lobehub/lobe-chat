import { Column, count, sql } from 'drizzle-orm';
import { and, desc, eq, exists, gt, inArray, isNull, like, or } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';
import {
  genEndDateWhere,
  genRangeWhere,
  genStartDateWhere,
  genWhere,
} from '@/database/utils/genWhere';
import { idGenerator } from '@/database/utils/idGenerator';
import { MessageItem } from '@/types/message';
import { TopicRankItem } from '@/types/topic';

import { TopicItem, messages, topics } from '../../schemas';

export interface CreateTopicParams {
  favorite?: boolean;
  messages?: string[];
  sessionId?: string | null;
  title: string;
}

interface QueryTopicParams {
  current?: number;
  pageSize?: number;
  sessionId?: string | null;
}

export class TopicModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }
  // **************** Query *************** //

  query = async ({ current = 0, pageSize = 9999, sessionId }: QueryTopicParams = {}) => {
    const offset = current * pageSize;
    return (
      this.db
        .select({
          createdAt: topics.createdAt,
          favorite: topics.favorite,
          historySummary: topics.historySummary,
          id: topics.id,
          metadata: topics.metadata,
          title: topics.title,
          updatedAt: topics.updatedAt,
        })
        .from(topics)
        .where(and(eq(topics.userId, this.userId), this.matchSession(sessionId)))
        // In boolean sorting, false is considered "smaller" than true.
        // So here we use desc to ensure that topics with favorite as true are in front.
        .orderBy(desc(topics.favorite), desc(topics.updatedAt))
        .limit(pageSize)
        .offset(offset)
    );
  };

  findById = async (id: string) => {
    return this.db.query.topics.findFirst({
      where: and(eq(topics.id, id), eq(topics.userId, this.userId)),
    });
  };

  queryAll = async (): Promise<TopicItem[]> => {
    return this.db
      .select()
      .from(topics)
      .orderBy(topics.updatedAt)
      .where(eq(topics.userId, this.userId));
  };

  queryByKeyword = async (keyword: string, sessionId?: string | null): Promise<TopicItem[]> => {
    if (!keyword) return [];

    const keywordLowerCase = keyword.toLowerCase();

    const matchKeyword = (field: any) =>
      like(sql`lower(${field})` as unknown as Column, `%${keywordLowerCase}%`);

    return this.db.query.topics.findMany({
      orderBy: [desc(topics.updatedAt)],
      where: and(
        eq(topics.userId, this.userId),
        this.matchSession(sessionId),
        or(
          matchKeyword(topics.title),
          exists(
            this.db
              .select()
              .from(messages)
              .where(and(eq(messages.topicId, topics.id), matchKeyword(messages.content))),
          ),
        ),
      ),
    });
  };

  count = async (params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number> => {
    const result = await this.db
      .select({
        count: count(topics.id),
      })
      .from(topics)
      .where(
        genWhere([
          eq(topics.userId, this.userId),
          params?.range
            ? genRangeWhere(params.range, topics.createdAt, (date) => date.toDate())
            : undefined,
          params?.endDate
            ? genEndDateWhere(params.endDate, topics.createdAt, (date) => date.toDate())
            : undefined,
          params?.startDate
            ? genStartDateWhere(params.startDate, topics.createdAt, (date) => date.toDate())
            : undefined,
        ]),
      );

    return result[0].count;
  };

  rank = async (limit: number = 10): Promise<TopicRankItem[]> => {
    return this.db
      .select({
        count: count(messages.id).as('count'),
        id: topics.id,
        sessionId: topics.sessionId,
        title: topics.title,
      })
      .from(topics)
      .where(and(eq(topics.userId, this.userId)))
      .leftJoin(messages, eq(topics.id, messages.topicId))
      .groupBy(topics.id)
      .orderBy(desc(sql`count`))
      .having(({ count }) => gt(count, 0))
      .limit(limit);
  };

  // **************** Create *************** //

  create = async (
    { messages: messageIds, ...params }: CreateTopicParams,
    id: string = this.genId(),
  ): Promise<TopicItem> => {
    return this.db.transaction(async (tx) => {
      // 在 topics 表中插入新的 topic
      const [topic] = await tx
        .insert(topics)
        .values({
          ...params,
          id: id,
          userId: this.userId,
        })
        .returning();

      // 如果有关联的 messages, 更新它们的 topicId
      if (messageIds && messageIds.length > 0) {
        await tx
          .update(messages)
          .set({ topicId: topic.id })
          .where(and(eq(messages.userId, this.userId), inArray(messages.id, messageIds)));
      }

      return topic;
    });
  };

  batchCreate = async (topicParams: (CreateTopicParams & { id?: string })[]) => {
    // 开始一个事务
    return this.db.transaction(async (tx) => {
      // 在 topics 表中批量插入新的 topics
      const createdTopics = await tx
        .insert(topics)
        .values(
          topicParams.map((params) => ({
            favorite: params.favorite,
            id: params.id || this.genId(),
            sessionId: params.sessionId,
            title: params.title,
            userId: this.userId,
          })),
        )
        .returning();

      // 对每个新创建的 topic,更新关联的 messages 的 topicId
      await Promise.all(
        createdTopics.map(async (topic, index) => {
          const messageIds = topicParams[index].messages;
          if (messageIds && messageIds.length > 0) {
            await tx
              .update(messages)
              .set({ topicId: topic.id })
              .where(and(eq(messages.userId, this.userId), inArray(messages.id, messageIds)));
          }
        }),
      );

      return createdTopics;
    });
  };

  duplicate = async (topicId: string, newTitle?: string) => {
    return this.db.transaction(async (tx) => {
      // find original topic
      const originalTopic = await tx.query.topics.findFirst({
        where: and(eq(topics.id, topicId), eq(topics.userId, this.userId)),
      });

      if (!originalTopic) {
        throw new Error(`Topic with id ${topicId} not found`);
      }

      // copy topic
      const [duplicatedTopic] = await tx
        .insert(topics)
        .values({
          ...originalTopic,
          clientId: null,
          id: this.genId(),
          title: newTitle || originalTopic?.title,
        })
        .returning();

      // 查找与原始 topic 关联的 messages
      const originalMessages = await tx
        .select()
        .from(messages)
        .where(and(eq(messages.topicId, topicId), eq(messages.userId, this.userId)));

      // copy messages
      const duplicatedMessages = await Promise.all(
        originalMessages.map(async (message) => {
          const result = (await tx
            .insert(messages)
            .values({
              ...message,
              clientId: null,
              id: idGenerator('messages'),
              topicId: duplicatedTopic.id,
            })
            .returning()) as MessageItem[];

          return result[0];
        }),
      );

      return {
        messages: duplicatedMessages,
        topic: duplicatedTopic,
      };
    });
  };

  // **************** Delete *************** //

  /**
   * Delete a session, also delete all messages and topics associated with it.
   */
  delete = async (id: string) => {
    return this.db.delete(topics).where(and(eq(topics.id, id), eq(topics.userId, this.userId)));
  };

  /**
   * Deletes multiple topics based on the sessionId.
   */
  batchDeleteBySessionId = async (sessionId?: string | null) => {
    return this.db
      .delete(topics)
      .where(and(this.matchSession(sessionId), eq(topics.userId, this.userId)));
  };

  /**
   * Deletes multiple topics and all messages associated with them in a transaction.
   */
  batchDelete = async (ids: string[]) => {
    return this.db
      .delete(topics)
      .where(and(inArray(topics.id, ids), eq(topics.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(topics).where(eq(topics.userId, this.userId));
  };

  // **************** Update *************** //

  update = async (id: string, data: Partial<TopicItem>) => {
    return this.db
      .update(topics)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(topics.id, id), eq(topics.userId, this.userId)))
      .returning();
  };

  // **************** Helper *************** //

  private genId = () => idGenerator('topics');

  private matchSession = (sessionId?: string | null) =>
    sessionId ? eq(topics.sessionId, sessionId) : isNull(topics.sessionId);
}
