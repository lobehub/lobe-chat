import { DeepPartial } from 'utility-types';

import { BaseModel } from '@/database/core';
import { DB_Message, DB_MessageSchema } from '@/database/schemas/message';
import { DBModel } from '@/types/database/db';
import { nanoid } from '@/utils/uuid';

export interface CreateMessageParams extends DB_Message {
  // content: string;
  // role: MessageRoleType;
  sessionId: string;
}

export interface QueryMessageParams {
  current?: number;
  pageSize?: number;
  sessionId: string;
  topicId?: string;
}

class _MessageModel extends BaseModel {
  constructor() {
    super('messages', DB_MessageSchema);
  }
  async create(data: CreateMessageParams, defaultValue: Partial<DB_Message> = {}) {
    const id = nanoid();

    const messageData: DB_Message = { ...defaultValue, ...data };

    return this._add(messageData, id);
  }

  async batchCreate(messages: DB_Message[]) {
    return this._batchAdd(messages, { idGenerator: nanoid });
  }

  async query({ sessionId, topicId, pageSize = 9999, current = 0 }: QueryMessageParams) {
    const offset = current * pageSize;

    const query =
      topicId !== undefined
        ? // TODO: The query {"sessionId":"xxx","topicId":"xxx"} on messages would benefit of a compound index [sessionId+topicId]
          this.table.where({ sessionId, topicId }) // Use a compound index
        : this.table
            .where('sessionId')
            .equals(sessionId)
            .and((message) => message.topicId === undefined);

    return (
      query
        .sortBy('createdAt')
        // handle page size
        .then((sortedArray) => sortedArray.slice(offset, offset + pageSize))
    );
  }

  async findById(id: string): Promise<DBModel<DB_Message>> {
    return this.table.get(id);
  }

  async delete(id: string) {
    return this.table.delete(id);
  }

  async clearTable() {
    return this.table.clear();
  }

  async update(id: string, data: DeepPartial<DB_Message>) {
    return super._update(id, data);
  }

  /**
   * Batch updates multiple fields of the specified messages.
   *
   * @param {string[]} messageIds - The identifiers of the messages to be updated.
   * @param {Partial<DB_Message>} updateFields - An object containing the fields to update and their new values.
   * @returns {Promise<number>} - The number of updated messages.
   */
  async batchUpdate(messageIds: string[], updateFields: Partial<DB_Message>): Promise<number> {
    // Retrieve the messages by their IDs
    const messagesToUpdate = await this.table.where(':id').anyOf(messageIds).toArray();

    // Update the specified fields of each message
    const updatedMessages = messagesToUpdate.map((message) => ({
      ...message,
      ...updateFields,
    }));

    // Use the bulkPut method to update the messages in bulk
    return this.table.bulkPut(updatedMessages);
  }

  /**
   * Deletes multiple messages based on the assistantId and optionally the topicId.
   * If topicId is not provided, it deletes messages where topicId is undefined.
   * If topicId is provided, it deletes messages with that specific topicId.
   *
   * @param {string} sessionId - The identifier of the assistant associated with the messages.
   * @param {string | undefined} topicId - The identifier of the topic associated with the messages (optional).
   * @returns {Promise<void>}
   */
  async batchDelete(sessionId: string, topicId: string | undefined): Promise<void> {
    // If topicId is specified, use both assistantId and topicId as the filter criteria in the query.
    // Otherwise, filter by assistantId and require that topicId is undefined.
    const query =
      topicId !== undefined
        ? this.table.where({ sessionId, topicId }) // Use a compound index
        : this.table
            .where('sessionId')
            .equals(sessionId)
            .and((message) => message.topicId === undefined);

    // Retrieve a collection of message IDs that satisfy the criteria
    const messageIds = await query.primaryKeys();

    // Use the bulkDelete method to delete all selected messages in bulk
    return this.table.bulkDelete(messageIds);
  }
}

export const MessageModel = new _MessageModel();
