import { BaseModel } from '@/database/core';
import { DB_Topic, DB_TopicSchema } from '@/database/schemas/topic';
import { DBModel } from '@/types/database/db';
import { ChatTopic } from '@/types/topic';
import { nanoid } from '@/utils/uuid';

export interface CreateTopicParams {
  favorite?: boolean;
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

  async create({ title, favorite, sessionId }: CreateTopicParams, id = nanoid()) {
    return this._add({ favorite: favorite ? 1 : 0, sessionId, title: title }, id);
  }

  async batchCreate(topics: CreateTopicParams[]) {
    return this._batchAdd(topics.map((t) => ({ ...t, favorite: t.favorite ? 1 : 0 })));
  }

  async query({ pageSize = 9999, current = 0, sessionId }: QueryTopicParams): Promise<ChatTopic[]> {
    const offset = current * pageSize;

    const result: DBModel<DB_Topic>[] = await this.table
      .where('sessionId')
      .equals(sessionId)
      .reverse()
      .sortBy('createdAt')
      // handle page size
      .then((sortedArray) => sortedArray.slice(offset, offset + pageSize));

    return result.map((i) => ({ ...i, favorite: !!i.favorite }));
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
}

export const TopicModel = new _TopicModel();
