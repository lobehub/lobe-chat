import { Column, count, inArray, sql } from 'drizzle-orm';
import { and, desc, eq, exists, isNull, like, or } from 'drizzle-orm/expressions';

import { serverDB } from '@/database/server/core/db';

import { NewMessage, TopicItem, messages, topics } from '../schemas/lobechat';
import { idGenerator } from '../utils/idGenerator';

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

  constructor(userId: string) {
    this.userId = userId;
  }
  // **************** Query *************** //

  async query({ current = 0, pageSize = 9999, sessionId }: QueryTopicParams = {}) {
    const offset = current * pageSize;

    return (
      serverDB
        .select({
          createdAt: topics.createdAt,
          favorite: topics.favorite,
          id: topics.id,
          metadata: topics.metadata,
          summary: topics.historySummary,
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

    // return result.map(({ summary, metadata, ...item }) => {
    //   const meta = metadata as ChatTopicMetadata;
    //   return {
    //     ...item,
    //     summary: !!summary
    //       ? ({
    //           content: summary,
    //           model: meta?.model,
    //           provider: meta?.provider,
    //         } as ChatTopicSummary)
    //       : undefined,
    //   };
    // });
  }

  async findById(id: string) {
    return serverDB.query.topics.findFirst({
      where: and(eq(topics.id, id), eq(topics.userId, this.userId)),
    });
  }

  async queryAll(): Promise<TopicItem[]> {
    return serverDB
      .select()
      .from(topics)
      .orderBy(topics.updatedAt)
      .where(eq(topics.userId, this.userId))
      .execute();
  }

  async queryByKeyword(keyword: string, sessionId?: string | null): Promise<TopicItem[]> {
    if (!keyword) return [];

    const keywordLowerCase = keyword.toLowerCase();

    const matchKeyword = (field: any) =>
      like(sql`lower(${field})` as unknown as Column, `%${keywordLowerCase}%`);

    return serverDB.query.topics.findMany({
      orderBy: [desc(topics.updatedAt)],
      where: and(
        eq(topics.userId, this.userId),
        this.matchSession(sessionId),
        or(
          matchKeyword(topics.title),
          exists(
            serverDB
              .select()
              .from(messages)
              .where(and(eq(messages.topicId, topics.id), or(matchKeyword(messages.content)))),
          ),
        ),
      ),
    });
  }

  async count() {
    const result = await serverDB
      .select({
        count: count(),
      })
      .from(topics)
      .where(eq(topics.userId, this.userId))
      .execute();

    return result[0].count;
  }

  // **************** Create *************** //

  async create(
    { messages: messageIds, ...params }: CreateTopicParams,
    id: string = this.genId(),
  ): Promise<TopicItem> {
    return serverDB.transaction(async (tx) => {
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
  }

  async batchCreate(topicParams: (CreateTopicParams & { id?: string })[]) {
    // 开始一个事务
    return serverDB.transaction(async (tx) => {
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
  }

  async duplicate(topicId: string, newTitle?: string) {
    return serverDB.transaction(async (tx) => {
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
              id: idGenerator('messages'),
              topicId: duplicatedTopic.id,
            })
            .returning()) as NewMessage[];

          return result[0];
        }),
      );

      return {
        messages: duplicatedMessages,
        topic: duplicatedTopic,
      };
    });
  }

  // **************** Delete *************** //

  /**
   * Delete a session, also delete all messages and topics associated with it.
   */
  async delete(id: string) {
    return serverDB.delete(topics).where(and(eq(topics.id, id), eq(topics.userId, this.userId)));
  }

  /**
   * Deletes multiple topics based on the sessionId.
   */
  async batchDeleteBySessionId(sessionId?: string | null) {
    return serverDB
      .delete(topics)
      .where(and(this.matchSession(sessionId), eq(topics.userId, this.userId)));
  }

  /**
   * Deletes multiple topics and all messages associated with them in a transaction.
   */
  async batchDelete(ids: string[]) {
    return serverDB
      .delete(topics)
      .where(and(inArray(topics.id, ids), eq(topics.userId, this.userId)));
  }

  async deleteAll() {
    return serverDB.delete(topics).where(eq(topics.userId, this.userId));
  }

  // **************** Update *************** //

  async update(id: string, data: Partial<TopicItem>) {
    return serverDB
      .update(topics)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(topics.id, id), eq(topics.userId, this.userId)))
      .returning();
  }

  // **************** Helper *************** //

  private genId = () => idGenerator('topics');

  private matchSession = (sessionId?: string | null) =>
    sessionId ? eq(topics.sessionId, sessionId) : isNull(topics.sessionId);
}
