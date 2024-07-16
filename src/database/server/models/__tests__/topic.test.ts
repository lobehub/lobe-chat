import { eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTestDBInstance } from '@/database/server/core/dbForTest';

import { messages, sessions, topics, users } from '../../schemas/lobechat';
import { CreateTopicParams, TopicModel } from '../topic';

let serverDB = await getTestDBInstance();

vi.mock('@/database/server/core/db', async () => ({
  get serverDB() {
    return serverDB;
  },
}));

const userId = 'topic-user-test';
const sessionId = 'topic-session';
const topicModel = new TopicModel(userId);

describe('TopicModel', () => {
  beforeEach(async () => {
    await serverDB.delete(users);

    // 创建测试数据
    await serverDB.transaction(async (tx) => {
      await tx.insert(users).values({ id: userId });
      await tx.insert(sessions).values({ id: sessionId, userId });
    });
  });

  afterEach(async () => {
    // 在每个测试用例之后,清空表
    await serverDB.delete(users);
  });

  describe('query', () => {
    it('should query topics by user ID', async () => {
      // 创建一些测试数据
      await serverDB.transaction(async (tx) => {
        await tx.insert(users).values([{ id: '456' }]);

        await tx.insert(topics).values([
          { id: '1', userId, sessionId, updatedAt: new Date('2023-01-01') },
          { id: '4', userId, sessionId, updatedAt: new Date('2023-03-01') },
          { id: '2', userId, sessionId, updatedAt: new Date('2023-02-01'), favorite: true },
          { id: '5', userId, sessionId, updatedAt: new Date('2023-05-01'), favorite: true },
          { id: '3', userId: '456', sessionId, updatedAt: new Date('2023-03-01') },
        ]);
      });

      // 调用 query 方法
      const result = await topicModel.query({ sessionId });

      // 断言结果
      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('5'); // favorite 的 topic 应该在前面，按照 updatedAt 降序排序
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('4'); // 按照 updatedAt 降序排序
    });

    it('should query topics with pagination', async () => {
      // 创建测试数据
      await serverDB.insert(topics).values([
        { id: '1', userId, updatedAt: new Date('2023-01-01') },
        { id: '2', userId, updatedAt: new Date('2023-02-01') },
        { id: '3', userId, updatedAt: new Date('2023-03-01') },
      ]);

      // 应该返回 2 个 topics
      const result1 = await topicModel.query({ current: 0, pageSize: 2 });
      expect(result1).toHaveLength(2);

      // 应该只返回 1 个 topic,并且是第 2 个
      const result2 = await topicModel.query({ current: 1, pageSize: 1 });
      expect(result2).toHaveLength(1);
      expect(result2[0].id).toBe('2');
    });

    it('should query topics by session ID', async () => {
      // 创建测试数据
      await serverDB.transaction(async (tx) => {
        await tx.insert(sessions).values([
          { id: 'session1', userId },
          { id: 'session2', userId },
        ]);

        await tx.insert(topics).values([
          { id: '1', userId, sessionId: 'session1' },
          { id: '2', userId, sessionId: 'session2' },
          { id: '3', userId }, // 没有 sessionId
        ]);
      });

      // 应该只返回属于 session1 的 topic
      const result = await topicModel.query({ sessionId: 'session1' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return topics based on pagination parameters', async () => {
      // 创建测试数据
      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId, userId, updatedAt: new Date('2023-01-01') },
        { id: 'topic2', sessionId, userId, updatedAt: new Date('2023-01-02') },
        { id: 'topic3', sessionId, userId, updatedAt: new Date('2023-01-03') },
      ]);

      // 调用 query 方法
      const result1 = await topicModel.query({ current: 0, pageSize: 2, sessionId });
      const result2 = await topicModel.query({ current: 1, pageSize: 2, sessionId });

      // 断言返回结果符合分页要求
      expect(result1).toHaveLength(2);
      expect(result1[0].id).toBe('topic3');
      expect(result1[1].id).toBe('topic2');

      expect(result2).toHaveLength(1);
      expect(result2[0].id).toBe('topic1');
    });
  });

  describe('findById', () => {
    it('should return a topic by id', async () => {
      // 创建测试数据
      await serverDB.insert(topics).values({ id: 'topic1', sessionId, userId });

      // 调用 findById 方法
      const result = await topicModel.findById('topic1');

      // 断言返回结果符合预期
      expect(result?.id).toBe('topic1');
    });

    it('should return undefined for non-existent topic', async () => {
      // 调用 findById 方法
      const result = await topicModel.findById('non-existent');

      // 断言返回 undefined
      expect(result).toBeUndefined();
    });
  });

  describe('queryAll', () => {
    it('should return all topics', async () => {
      // 创建测试数据
      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId, userId },
        { id: 'topic2', sessionId, userId },
      ]);

      // 调用 queryAll 方法
      const result = await topicModel.queryAll();

      // 断言返回所有的 topics
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('topic1');
      expect(result[1].id).toBe('topic2');
    });
  });

  describe('queryByKeyword', () => {
    it('should return topics matching topic title keyword', async () => {
      // 创建测试数据
      await serverDB.transaction(async (tx) => {
        await tx.insert(topics).values([
          { id: 'topic1', title: 'Hello world', sessionId, userId },
          { id: 'topic2', title: 'Goodbye', sessionId, userId },
        ]);
        await tx
          .insert(messages)
          .values([
            { id: 'message1', role: 'assistant', content: 'abc there', topicId: 'topic1', userId },
          ]);
      });
      // 调用 queryByKeyword 方法
      const result = await topicModel.queryByKeyword('hello', sessionId);

      // 断言返回匹配关键字的 topic
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('topic1');
    });

    it('should return topics matching message content keyword', async () => {
      // 创建测试数据
      await serverDB.transaction(async (tx) => {
        await tx.insert(topics).values([
          { id: 'topic1', title: 'abc world', sessionId, userId },
          { id: 'topic2', title: 'Goodbye', sessionId, userId },
        ]);
        await tx.insert(messages).values([
          {
            id: 'message1',
            role: 'assistant',
            content: 'Hello there',
            topicId: 'topic1',
            userId,
          },
        ]);
      });
      // 调用 queryByKeyword 方法
      const result = await topicModel.queryByKeyword('hello', sessionId);

      // 断言返回匹配关键字的 topic
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('topic1');
    });

    it('should return nothing if not match', async () => {
      // 创建测试数据
      await serverDB.insert(topics).values([
        { id: 'topic1', title: 'Hello world', userId },
        { id: 'topic2', title: 'Goodbye', sessionId, userId },
      ]);
      await serverDB
        .insert(messages)
        .values([
          { id: 'message1', role: 'assistant', content: 'abc there', topicId: 'topic1', userId },
        ]);

      // 调用 queryByKeyword 方法
      const result = await topicModel.queryByKeyword('hello', sessionId);

      // 断言返回匹配关键字的 topic
      expect(result).toHaveLength(0);
    });
  });

  describe('count', () => {
    it('should return total number of topics', async () => {
      // 创建测试数据
      await serverDB.insert(topics).values([
        { id: 'abc_topic1', sessionId, userId },
        { id: 'abc_topic2', sessionId, userId },
      ]);

      // 调用 count 方法
      const result = await topicModel.count();

      // 断言返回 topics 总数
      expect(result).toBe(2);
    });
  });

  describe('delete', () => {
    it('should delete a topic and its associated messages', async () => {
      const topicId = 'topic1';
      await serverDB.transaction(async (tx) => {
        await tx.insert(users).values({ id: '345' });
        await tx.insert(sessions).values([
          { id: 'session1', userId },
          { id: 'session2', userId: '345' },
        ]);
        await tx.insert(topics).values([
          { id: topicId, sessionId: 'session1', userId },
          { id: 'topic2', sessionId: 'session2', userId: '345' },
        ]);
        await tx.insert(messages).values([
          { id: 'message1', role: 'user', topicId: topicId, userId },
          { id: 'message2', role: 'assistant', topicId: topicId, userId },
          { id: 'message3', role: 'user', topicId: 'topic2', userId: '345' },
        ]);
      });

      // 调用 delete 方法
      await topicModel.delete(topicId);

      // 断言 topic 和关联的 messages 都被删除了
      expect(
        await serverDB.select().from(messages).where(eq(messages.topicId, topicId)),
      ).toHaveLength(0);
      expect(await serverDB.select().from(topics)).toHaveLength(1);

      expect(await serverDB.select().from(messages)).toHaveLength(1);
    });
  });

  describe('batchDeleteBySessionId', () => {
    it('should delete all topics associated with a session', async () => {
      await serverDB.insert(sessions).values([
        { id: 'session1', userId },
        { id: 'session2', userId },
      ]);
      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId: 'session1', userId },
        { id: 'topic2', sessionId: 'session1', userId },
        { id: 'topic3', sessionId: 'session2', userId },
        { id: 'topic4', userId },
      ]);

      // 调用 batchDeleteBySessionId 方法
      await topicModel.batchDeleteBySessionId('session1');

      // 断言属于 session1 的 topics 都被删除了
      expect(
        await serverDB.select().from(topics).where(eq(topics.sessionId, 'session1')),
      ).toHaveLength(0);
      expect(await serverDB.select().from(topics)).toHaveLength(2);
    });
    it('should delete all topics associated without sessionId', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);

      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId: 'session1', userId },
        { id: 'topic2', sessionId: 'session1', userId },
        { id: 'topic4', userId },
      ]);

      // 调用 batchDeleteBySessionId 方法
      await topicModel.batchDeleteBySessionId();

      // 断言属于 session1 的 topics 都被删除了
      expect(
        await serverDB.select().from(topics).where(eq(topics.sessionId, 'session1')),
      ).toHaveLength(2);
      expect(await serverDB.select().from(topics)).toHaveLength(2);
    });
  });

  describe('batchDelete', () => {
    it('should delete multiple topics and their associated messages', async () => {
      await serverDB.transaction(async (tx) => {
        await tx.insert(sessions).values({ id: 'session1', userId });
        await tx.insert(topics).values([
          { id: 'topic1', sessionId: 'session1', userId },
          { id: 'topic2', sessionId: 'session1', userId },
          { id: 'topic3', sessionId: 'session1', userId },
        ]);
        await tx.insert(messages).values([
          { id: 'message1', role: 'user', topicId: 'topic1', userId },
          { id: 'message2', role: 'assistant', topicId: 'topic2', userId },
          { id: 'message3', role: 'user', topicId: 'topic3', userId },
        ]);
      });

      // 调用 batchDelete 方法
      await topicModel.batchDelete(['topic1', 'topic2']);

      // 断言指定的 topics 和关联的 messages 都被删除了
      expect(await serverDB.select().from(topics)).toHaveLength(1);
      expect(await serverDB.select().from(messages)).toHaveLength(1);
    });
  });

  describe('deleteAll', () => {
    it('should delete all topics of the user', async () => {
      await serverDB.insert(users).values({ id: '345' });
      await serverDB.insert(sessions).values([
        { id: 'session1', userId },
        { id: 'session2', userId: '345' },
      ]);
      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId: 'session1', userId },
        { id: 'topic2', sessionId: 'session1', userId },
        { id: 'topic3', sessionId: 'session2', userId: '345' },
      ]);

      // 调用 deleteAll 方法
      await topicModel.deleteAll();

      // 断言当前用户的所有 topics 都被删除了
      expect(await serverDB.select().from(topics).where(eq(topics.userId, userId))).toHaveLength(0);
      expect(await serverDB.select().from(topics)).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a topic', async () => {
      // 创建一个测试 session
      const topicId = '123';
      await serverDB.insert(topics).values({ userId, id: topicId, title: 'Test', favorite: true });

      // 调用 update 方法更新 session
      const item = await topicModel.update(topicId, {
        title: 'Updated Test',
        favorite: false,
      });

      // 断言更新后的结果
      expect(item).toHaveLength(1);
      expect(item[0].title).toBe('Updated Test');
      expect(item[0].favorite).toBeFalsy();
    });

    it('should not update a topic if user ID does not match', async () => {
      // 创建一个测试 topic, 但使用不同的 user ID
      await serverDB.insert(users).values([{ id: '456' }]);
      const topicId = '123';
      await serverDB
        .insert(topics)
        .values({ userId: '456', id: topicId, title: 'Test', favorite: true });

      // 尝试更新这个 topic , 应该不会有任何更新
      const item = await topicModel.update(topicId, {
        title: 'Updated Test Session',
      });

      expect(item).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create a new topic and associate messages', async () => {
      const topicData = {
        title: 'New Topic',
        favorite: true,
        sessionId,
        messages: ['message1', 'message2'],
      } satisfies CreateTopicParams;

      const topicId = 'new-topic';

      // 预先创建一些 messages
      await serverDB.insert(messages).values([
        { id: 'message1', role: 'user', userId, sessionId },
        { id: 'message2', role: 'assistant', userId, sessionId },
        { id: 'message3', role: 'user', userId, sessionId },
      ]);

      // 调用 create 方法
      const createdTopic = await topicModel.create(topicData, topicId);

      // 断言返回的 topic 数据正确
      expect(createdTopic).toEqual({
        id: topicId,
        title: 'New Topic',
        favorite: true,
        sessionId,
        userId,
        clientId: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // 断言 topic 已在数据库中创建
      const dbTopic = await serverDB.select().from(topics).where(eq(topics.id, topicId));
      expect(dbTopic).toHaveLength(1);
      expect(dbTopic[0]).toEqual(createdTopic);

      // 断言关联的 messages 的 topicId 已更新
      const associatedMessages = await serverDB
        .select()
        .from(messages)
        .where(inArray(messages.id, topicData.messages!));
      expect(associatedMessages).toHaveLength(2);
      expect(associatedMessages.every((msg) => msg.topicId === topicId)).toBe(true);

      // 断言未关联的 message 的 topicId 没有更新
      const unassociatedMessage = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.id, 'message3'));

      expect(unassociatedMessage[0].topicId).toBeNull();
    });

    it('should create a new topic without associating messages', async () => {
      const topicData = {
        title: 'New Topic',
        favorite: false,
        sessionId,
      };

      const topicId = 'new-topic';

      // 调用 create 方法
      const createdTopic = await topicModel.create(topicData, topicId);

      // 断言返回的 topic 数据正确
      expect(createdTopic).toEqual({
        id: topicId,
        title: 'New Topic',
        favorite: false,
        clientId: null,
        sessionId,
        userId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      // 断言 topic 已在数据库中创建
      const dbTopic = await serverDB.select().from(topics).where(eq(topics.id, topicId));
      expect(dbTopic).toHaveLength(1);
      expect(dbTopic[0]).toEqual(createdTopic);
    });
  });

  describe('batchCreate', () => {
    it('should batch create topics and update associated messages', async () => {
      // 准备测试数据
      const topicParams = [
        {
          title: 'Topic 1',
          favorite: true,
          sessionId,
          messages: ['message1', 'message2'],
        },
        {
          title: 'Topic 2',
          favorite: false,
          sessionId,
          messages: ['message3'],
        },
      ];
      await serverDB.insert(messages).values([
        { id: 'message1', role: 'user', userId },
        { id: 'message2', role: 'assistant', userId },
        { id: 'message3', role: 'user', userId },
      ]);

      // 调用 batchCreate 方法
      const createdTopics = await topicModel.batchCreate(topicParams);

      // 断言返回的 topics 数据正确
      expect(createdTopics).toHaveLength(2);
      expect(createdTopics[0]).toMatchObject({
        title: 'Topic 1',
        favorite: true,
        sessionId,
        userId,
      });
      expect(createdTopics[1]).toMatchObject({
        title: 'Topic 2',
        favorite: false,
        sessionId,
        userId,
      });

      // 断言 topics 表中的数据正确
      const items = await serverDB.select().from(topics);
      expect(items).toHaveLength(2);
      expect(items[0]).toMatchObject({
        title: 'Topic 1',
        favorite: true,
        sessionId,
        userId,
      });
      expect(items[1]).toMatchObject({
        title: 'Topic 2',
        favorite: false,
        sessionId,
        userId,
      });

      // 断言关联的 messages 的 topicId 被正确更新
      const updatedMessages = await serverDB.select().from(messages);
      expect(updatedMessages).toHaveLength(3);
      expect(updatedMessages[0].topicId).toBe(createdTopics[0].id);
      expect(updatedMessages[1].topicId).toBe(createdTopics[0].id);
      expect(updatedMessages[2].topicId).toBe(createdTopics[1].id);
    });

    it('should generate topic IDs if not provided', async () => {
      // 准备测试数据
      const topicParams = [
        {
          title: 'Topic 1',
          favorite: true,
          sessionId,
        },
        {
          title: 'Topic 2',
          favorite: false,
          sessionId,
        },
      ];

      // 调用 batchCreate 方法
      const createdTopics = await topicModel.batchCreate(topicParams);

      // 断言生成了正确的 topic ID
      expect(createdTopics[0].id).toBeDefined();
      expect(createdTopics[1].id).toBeDefined();
      expect(createdTopics[0].id).not.toBe(createdTopics[1].id);
    });
  });

  describe('duplicate', () => {
    it('should duplicate a topic and its associated messages', async () => {
      const topicId = 'topic-duplicate';
      const newTitle = 'Duplicated Topic';

      // 创建原始的 topic 和 messages
      await serverDB.transaction(async (tx) => {
        await tx.insert(topics).values({ id: topicId, sessionId, userId, title: 'Original Topic' });
        await tx.insert(messages).values([
          { id: 'message1', role: 'user', topicId, userId, content: 'User message' },
          { id: 'message2', role: 'assistant', topicId, userId, content: 'Assistant message' },
        ]);
      });

      // 调用 duplicate 方法
      const { topic: duplicatedTopic, messages: duplicatedMessages } = await topicModel.duplicate(
        topicId,
        newTitle,
      );

      // 断言复制的 topic 的属性正确
      expect(duplicatedTopic.id).not.toBe(topicId);
      expect(duplicatedTopic.title).toBe(newTitle);
      expect(duplicatedTopic.sessionId).toBe(sessionId);
      expect(duplicatedTopic.userId).toBe(userId);

      // 断言复制的 messages 的属性正确
      expect(duplicatedMessages).toHaveLength(2);
      expect(duplicatedMessages[0].id).not.toBe('message1');
      expect(duplicatedMessages[0].topicId).toBe(duplicatedTopic.id);
      expect(duplicatedMessages[0].content).toBe('User message');
      expect(duplicatedMessages[1].id).not.toBe('message2');
      expect(duplicatedMessages[1].topicId).toBe(duplicatedTopic.id);
      expect(duplicatedMessages[1].content).toBe('Assistant message');
    });

    it('should throw an error if the topic to duplicate does not exist', async () => {
      const topicId = 'nonexistent-topic';

      // 调用 duplicate 方法,期望抛出错误
      await expect(topicModel.duplicate(topicId)).rejects.toThrow(
        `Topic with id ${topicId} not found`,
      );
    });
  });
});
