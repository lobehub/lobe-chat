import {
  DEFAULT_AGENT_LOBE_SESSION,
  DEFAULT_INBOX_SESSION,
  INBOX_SESSION_ID,
} from '@/const/session';
import { BaseModel } from '@/database/core';
import { DB_Session, DB_SessionSchema } from '@/database/schemas/session';
import { DBModel } from '@/types/database/db';
import { LobeAgentSession, SessionGroupKey } from '@/types/session';
import { merge } from '@/utils/merge';
import { uuid } from '@/utils/uuid';

class _SessionModel extends BaseModel {
  constructor() {
    super('sessions', DB_SessionSchema);
  }

  async create(type: 'agent' | 'group', defaultValue: Partial<LobeAgentSession>, id = uuid()) {
    const data = merge(DEFAULT_AGENT_LOBE_SESSION, { type, ...defaultValue });
    return this._add(data, id);
  }

  async batchCreate(sessions: LobeAgentSession[]) {
    return this._batchAdd(sessions, { idGenerator: uuid });
  }

  async query({ pageSize = 9999, current = 0 }: { current?: number; pageSize?: number } = {}) {
    const offset = current * pageSize;

    return this.table.orderBy('updatedAt').reverse().offset(offset).limit(pageSize).toArray();
  }

  /**
   * get sessions by group
   * @param group
   */
  async queryByGroup(group: SessionGroupKey) {
    return this.table.where('group').equals(group).toArray();
  }

  async findById(id: string) {
    let session: DBModel<DB_Session>;
    if (id === INBOX_SESSION_ID) {
      session = await this.findByIdOrCreate(id);
    } else {
      session = await this.table.get(id);
    }
    return session;
  }

  async findByIdOrCreate(id: string) {
    let item = await this.table.get(id);

    if (!item) {
      const defaultSession = id === INBOX_SESSION_ID ? DEFAULT_INBOX_SESSION : { id };

      await this.create('agent', defaultSession, id);
      item = await this.findById(id);
    }

    return item;
  }

  async delete(id: string) {
    return this.table.delete(id);
  }

  async clearTable() {
    return this.table.clear();
  }

  async update(id: string, data: Partial<DB_Session>) {
    return super._update(id, data);
  }

  /**
   * Add message IDs to a session's messages array
   * @param sessionId The ID of the session
   * @param messageIds An array of message IDs to add
   */
  async addMessages(sessionId: string, messageIds: string[]) {
    const session = await this.findById(sessionId);

    if (!session) {
      throw new Error(`Session not found. [id] ${sessionId} `);
    }

    // Combine the existing messages with the new message IDs
    // Ensuring there are no duplicate IDs
    const updatedMessages = Array.from(new Set([...session.messages, ...messageIds]));

    // Update the session with the new messages array
    await this.update(sessionId, { messages: updatedMessages });
  }

  /**
   * Remove message IDs from a session's messages array
   * @param sessionId The ID of the session
   * @param messageIds An array of message IDs to remove
   */
  async removeMessages(sessionId: string, messageIds: string[]) {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    // Filter out the message IDs that need to be removed
    const updatedMessages = session.messages.filter((messageId) => !messageIds.includes(messageId));

    // Update the session with the new messages array
    await this.update(sessionId, { messages: updatedMessages });
  }

  async removeTopics(sessionId: string, topicIds: string[]) {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    // Filter out the topic IDs that need to be removed
    const updatedTopics = session.topics.filter((t) => !topicIds.includes(t));

    // Update the session with the new topics array
    await this.update(sessionId, { topics: updatedTopics });
  }
}

export const SessionModel = new _SessionModel();
