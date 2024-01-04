import { DeepPartial } from 'utility-types';

import { DEFAULT_AGENT_LOBE_SESSION } from '@/const/session';
import { BaseModel } from '@/database/core';
import { DBModel } from '@/database/core/types/db';
import { DB_Session, DB_SessionSchema } from '@/database/schemas/session';
import { LobeAgentConfig } from '@/types/agent';
import { LobeAgentSession, LobeSessions, SessionGroupKey } from '@/types/session';
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

  async query({
    pageSize = 9999,
    current = 0,
  }: { current?: number; pageSize?: number } = {}): Promise<LobeSessions> {
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

  async updateConfig(id: string, data: DeepPartial<LobeAgentConfig>) {
    const session = await this.findById(id);
    if (!session) return;

    const config = merge(session.config, data);

    return this.update(id, { config });
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

  async findById(id: string): Promise<DBModel<DB_Session>> {
    return this.table.get(id);
  }

  async isEmpty() {
    return (await this.table.count()) === 0;
  }

  /**
   * Query sessions by keyword in title, description, content, or translated content
   * @param keyword The keyword to search for
   */
  async queryByKeyword(keyword: string): Promise<LobeSessions> {
    if (!keyword) return [];

    console.time('queryByKeyword');
    const keywordLowerCase = keyword.toLowerCase();

    // First, filter sessions by title and description
    const matchingSessionsPromise = this.table
      .filter((session) => {
        return (
          session.meta.title.toLowerCase().includes(keywordLowerCase) ||
          session.meta.description.toLowerCase().includes(keywordLowerCase)
        );
      })
      .toArray();

    // Next, find message IDs that contain the keyword in content or translated content
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

    //  match topics
    const matchingTopicsPromise = this.db.topics
      .filter((topic) => {
        return topic.title.toLowerCase().includes(keywordLowerCase);
      })
      .toArray();

    // Resolve both promises
    const [matchingSessions, matchingMessages, matchingTopics] = await Promise.all([
      matchingSessionsPromise,
      matchingMessagesPromise,
      matchingTopicsPromise,
    ]);

    const sessionIdsFromMessages = matchingMessages.map((message) => message.sessionId);
    const sessionIdsFromTopics = matchingTopics.map((topic) => topic.sessionId);

    // Combine session IDs from both sources
    const combinedSessionIds = new Set([
      ...sessionIdsFromMessages,
      ...sessionIdsFromTopics,
      ...matchingSessions.map((session) => session.id),
    ]);

    // Retrieve unique sessions by IDs
    const data = await this.table
      .where('id')
      .anyOf([...combinedSessionIds])
      .toArray();

    console.timeEnd('queryByKeyword');
    return data;
  }

  async duplicate(id: string, newTitle?: string) {
    const session = await this.findById(id);
    if (!session) return;

    const newSession = merge(session, { meta: { title: newTitle } });

    return this._add(newSession, uuid());
  }
}

export const SessionModel = new _SessionModel();
