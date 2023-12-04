import { BaseModel } from '@/database/core';
import { DB_Topic, DB_TopicSchema } from '@/database/schemas/topic';
import { ChatTopic } from '@/types/topic';
import { nanoid } from '@/utils/uuid';

export interface CreateTopicParams {
  favorite?: boolean;
  messages?: string[];
  sessionId: string;
  title: string;
}

export interface QueryTopicParams {
  current?: number;
  pageSize?: number;
  sessionId: string;
}

class _TopicModel extends BaseModel {
  constructor() {
    super('topics', DB_TopicSchema);
  }

  async create({ title, favorite, sessionId, messages }: CreateTopicParams, id = nanoid()) {
    const topic = await this._add({ favorite: favorite ? 1 : 0, sessionId, title: title }, id);

    // add topicId to these messages
    if (messages) {
      await this.db.messages.where('id').anyOf(messages).modify({ topicId: topic.id });
    }
    return topic;
  }

  async batchCreate(topics: CreateTopicParams[]) {
    return this._batchAdd(topics.map((t) => ({ ...t, favorite: t.favorite ? 1 : 0 })));
  }

  async query({ pageSize = 9999, current = 0, sessionId }: QueryTopicParams): Promise<ChatTopic[]> {
    const offset = current * pageSize;

    // get all topics
    const allTopics = await this.table.where('sessionId').equals(sessionId).toArray();

    // 将所有主题按星标消息优先，时间倒序进行排序
    const sortedTopics = allTopics.sort((a, b) => {
      if (a.favorite && !b.favorite) return -1; // a是星标，b不是，a排前面
      if (!a.favorite && b.favorite) return 1; // b是星标，a不是，b排前面

      // 如果星标状态相同，则按时间倒序排序
      return b.createdAt - a.createdAt;
    });

    // handle pageSize
    const pagedTopics = sortedTopics.slice(offset, offset + pageSize);

    return pagedTopics.map((i) => ({ ...i, favorite: !!i.favorite }));
  }

  async findBySessionId(sessionId: string) {
    return this.table.where({ sessionId }).toArray();
  }

  async findById(id: string) {
    return this.table.get(id);
  }

  /**
   * Deletes a topic and all messages associated with it.
   */
  async delete(id: string) {
    return this.db.transaction('rw', [this.table, this.db.messages], async () => {
      // Delete all messages associated with the topic
      const messages = await this.db.messages.where('topicId').equals(id).toArray();

      if (messages.length > 0) {
        const messageIds = messages.map((msg) => msg.id);
        await this.db.messages.bulkDelete(messageIds);
      }

      await this.table.delete(id);
    });
  }

  /**
   * Deletes multiple topic based on the sessionId.
   *
   * @param {string} sessionId - The identifier of the assistant associated with the messages.
   * @returns {Promise<void>}
   */
  async batchDeleteBySessionId(sessionId: string): Promise<void> {
    // use sessionId as the filter criteria in the query.
    const query = this.table.where('sessionId').equals(sessionId);

    // Retrieve a collection of message IDs that satisfy the criteria
    const topicIds = await query.primaryKeys();

    // Use the bulkDelete method to delete all selected messages in bulk
    return this.table.bulkDelete(topicIds);
  }

  async clearTable() {
    return this.table.clear();
  }

  async update(id: string, data: Partial<DB_Topic>) {
    return super._update(id, { ...data, updatedAt: Date.now() });
  }

  async toggleFavorite(id: string, newState?: boolean) {
    const topic = await this.findById(id);
    if (!topic) {
      throw new Error(`Topic with id ${id} not found`);
    }

    // Toggle the 'favorite' status
    const nextState = typeof newState !== 'undefined' ? newState : !topic.favorite;

    await this.update(id, { favorite: nextState ? 1 : 0 });

    return nextState;
  }

  /**
   * Deletes multiple topics and all messages associated with them in a transaction.
   */
  async batchDelete(topicIds: string[]) {
    return this.db.transaction('rw', [this.table, this.db.messages], async () => {
      // Iterate over each topicId and delete related messages, then delete the topic itself
      for (const topicId of topicIds) {
        // Delete all messages associated with the topic
        const messages = await this.db.messages.where('topicId').equals(topicId).toArray();
        if (messages.length > 0) {
          const messageIds = messages.map((msg) => msg.id);
          await this.db.messages.bulkDelete(messageIds);
        }

        // Delete the topic
        await this.table.delete(topicId);
      }
    });
  }

  queryAll() {
    return this.table.orderBy('updatedAt').toArray();
  }

  /**
   * Query topics by keyword in title, message content, or translated content
   * @param keyword The keyword to search for
   */
  async queryByKeyword(keyword: string): Promise<ChatTopic[]> {
    if (!keyword) return [];

    console.time('queryTopicsByKeyword');
    const keywordLowerCase = keyword.toLowerCase();

    // Find topics with matching title
    const matchingTopicsPromise = this.table
      .filter((topic) => topic.title.toLowerCase().includes(keywordLowerCase))
      .toArray();

    // Find messages with matching content or translate.content
    const matchingMessagesPromise = this.db.messages
      .filter((message) => {
        // check content
        if (message.content.toLowerCase().includes(keywordLowerCase)) return true;

        // check translate content
        if (message.translate && message.translate.content) {
          return message.translate.content.toLowerCase().includes(keywordLowerCase);
        }

        return false;
      })
      .toArray();

    // Resolve both promises
    const [matchingTopics, matchingMessages] = await Promise.all([
      matchingTopicsPromise,
      matchingMessagesPromise,
    ]);

    // Extract topic IDs from messages
    const topicIdsFromMessages = matchingMessages.map((message) => message.topicId);

    // Combine topic IDs from both sources
    const combinedTopicIds = new Set([
      ...topicIdsFromMessages,
      ...matchingTopics.map((topic) => topic.id),
    ]);

    // Retrieve unique topics by IDs
    const uniqueTopics = await this.table
      .where('id')
      .anyOf([...combinedTopicIds])
      .toArray();

    console.timeEnd('queryTopicsByKeyword');
    return uniqueTopics.map((i) => ({ ...i, favorite: !!i.favorite }));
  }
}

export const TopicModel = new _TopicModel();
