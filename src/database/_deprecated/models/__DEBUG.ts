// This file is for debugging purposes only.
// DON'T USE IT IN PRODUCTION.
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { DBModel } from '@/database/_deprecated/core/types/db';
import { DB_Message } from '@/database/_deprecated/schemas/message';
import { DB_Topic } from '@/database/_deprecated/schemas/topic';

import { BaseModel } from '../core';
import { DB_Session, DB_SessionSchema } from '../schemas/session';

class _DEBUG_MODEL extends BaseModel<'sessions'> {
  constructor() {
    super('sessions', DB_SessionSchema);
  }
  private getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  private randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).getTime();
  }

  private randomPick<T>(array: T[]): T {
    const randomIndex = this.getRandomInt(0, array.length - 1);
    return array[randomIndex];
  }

  createRandomData = async ({
    sessionCount = 10,
    topicCount = 2000,
    messageCount = 10_000,
    startIndex = 1,
  }) => {
    const numberOfSessions = sessionCount;
    const numberOfTopics = topicCount;
    const numberOfMessages = messageCount;

    // Prepare data for batch inserts
    const sessionsData: DBModel<DB_Session>[] = [];
    const topicsData: DBModel<DB_Topic>[] = [];
    const messagesData: DBModel<DB_Message>[] = [];

    // Prepare sessions
    for (let i = startIndex; i < numberOfSessions + startIndex; i++) {
      sessionsData.push({
        config: DEFAULT_AGENT_CONFIG,
        createdAt: this.randomDate(new Date(2020, 0, 1), new Date()),
        group: 'default',
        id: `sess_${i}`,
        meta: {
          description: `Session Description ${i}`,
          title: `Session Title ${i}`,
        },
        type: 'agent',
        updatedAt: this.randomDate(new Date(2020, 0, 1), new Date()),
      });
    }

    // Prepare topics
    for (let i = startIndex; i < numberOfTopics + startIndex; i++) {
      topicsData.push({
        createdAt: this.randomDate(new Date(2020, 0, 1), new Date()),
        favorite: this.getRandomInt(0, 1),
        id: `topic_${i}`,
        sessionId: `sess_${this.getRandomInt(startIndex, numberOfSessions)}`,
        title: `Topic Title ${i}`,
        updatedAt: this.randomDate(new Date(2020, 0, 1), new Date()),
      });
    }

    // Prepare messages
    for (let i = startIndex; i < numberOfMessages + startIndex; i++) {
      messagesData.push({
        content: this.randomString(300),
        createdAt: this.randomDate(new Date(2020, 0, 1), new Date()),
        favorite: this.getRandomInt(0, 1),
        fromModel: 'model',
        id: `msg_${i}`,
        parentId: `msg_${this.getRandomInt(startIndex, numberOfMessages)}`,
        quotaId: `msg_${this.getRandomInt(startIndex, numberOfMessages)}`,
        role: this.randomPick(['user', 'assistant']),
        sessionId: `sess_${this.getRandomInt(startIndex, numberOfSessions)}`,
        topicId: `topic_${this.getRandomInt(startIndex, numberOfTopics)}`,
        updatedAt: this.randomDate(new Date(2020, 0, 1), new Date()),
      });
    }

    // Start a transaction for batch inserts
    await this.db.transaction(
      'rw',
      this.db.sessions,
      this.db.topics,
      this.db.messages,
      async () => {
        // Batch insert sessions, topics, and messages
        console.log('开始插入 sessions');
        console.time('插入sessions');
        await this.db.sessions.bulkAdd(sessionsData);
        console.timeEnd('插入sessions');

        console.log('开始插入 topics');
        console.time('插入topics');
        await this.db.topics.bulkAdd(topicsData);
        console.timeEnd('插入topics');

        console.log('开始插入 messages');
        console.time('插入messages');
        await this.db.messages.bulkAdd(messagesData);
        console.timeEnd('插入messages');
      },
    );
  };
}

export const DEBUG_MODEL = new _DEBUG_MODEL();
