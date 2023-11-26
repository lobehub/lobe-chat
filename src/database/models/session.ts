import { DEFAULT_AGENT_LOBE_SESSION } from '@/const/session';
import { BaseModel } from '@/database/core';
import { DB_Session, DB_SessionSchema } from '@/database/schemas/session';
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

  async update(id: string, data: Partial<DB_Session>) {
    return super._update(id, data);
  }
  /**
   * Delete a session , also delete all messages and topic associated with it.
   */
  async delete(id: string) {
    return this.db.transaction('rw', [this.table, this.db.topics, this.db.messages], async () => {
      // Delete all topics associated with the session
      const topics = await this.db.topics.where('sessionId').equals(id).toArray();
      const topicIds = topics.map((topic) => topic.id);
      if (topicIds.length > 0) {
        await this.db.topics.bulkDelete(topicIds);
      }

      // Delete all messages associated with the session
      const messages = await this.db.messages.where('sessionId').equals(id).toArray();
      const messageIds = messages.map((message) => message.id);
      if (messageIds.length > 0) {
        await this.db.messages.bulkDelete(messageIds);
      }

      // Finally, delete the session itself
      await this.table.delete(id);
    });
  }

  async clearTable() {
    return this.table.clear();
  }

  async findById(id: string) {
    return this.table.get(id);
  }
}

export const SessionModel = new _SessionModel();
