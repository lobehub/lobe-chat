import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DBModel } from '@/database/core/types/db';
import { CreateMessageParams, MessageModel } from '@/database/models/message';
import { DB_Message } from '@/database/schemas/message';
import { DB_Topic } from '@/database/schemas/topic';
import { nanoid } from '@/utils/uuid';
import * as uuidUtils from '@/utils/uuid';

import { CreateTopicParams, QueryTopicParams, TopicModel } from '../topic';

describe('TopicModel', () => {
  let topicData: CreateTopicParams;

  beforeEach(() => {
    // Set up topic data with the correct structure
    topicData = {
      sessionId: 'session1',
      title: 'Test Topic',
      favorite: false,
    };
  });

  afterEach(async () => {
    // Clean up the database after each test
    await TopicModel.clearTable();
  });

  describe('create', () => {
    it('should create a topic record', async () => {
      const result = await TopicModel.create(topicData);

      expect(result).toHaveProperty('id');
      // Verify that the topic has been added to the database
      const topicInDb = await TopicModel.findById(result.id);

      expect(topicInDb).toEqual(
        expect.objectContaining({
          title: topicData.title,
          favorite: topicData.favorite ? 1 : 0,
          sessionId: topicData.sessionId,
        }),
      );
    });

    it('should create a topic with favorite set to true', async () => {
      const favoriteTopicData: CreateTopicParams = {
        ...topicData,
        favorite: true,
      };
      const result = await TopicModel.create(favoriteTopicData);

      expect(result).toHaveProperty('id');
      const topicInDb = await TopicModel.findById(result.id);
      expect(topicInDb).toEqual(
        expect.objectContaining({
          title: favoriteTopicData.title,
          favorite: 1,
          sessionId: favoriteTopicData.sessionId,
        }),
      );
    });

    it('should update messages with the new topic id when messages are provided', async () => {
      const messagesToUpdate = [nanoid(), nanoid()];
      // 假设这些消息存在于数据库中
      for (const messageId of messagesToUpdate) {
        await MessageModel.table.add({ id: messageId, text: 'Sample message', topicId: null });
      }

      const topicDataWithMessages = {
        ...topicData,
        messages: messagesToUpdate,
      };

      const topic = await TopicModel.create(topicDataWithMessages);
      expect(topic).toHaveProperty('id');

      // 验证数据库中的消息是否已更新
      const updatedMessages: DB_Message[] = await MessageModel.table
        .where('id')
        .anyOf(messagesToUpdate)
        .toArray();

      expect(updatedMessages).toHaveLength(messagesToUpdate.length);
      for (const message of updatedMessages) {
        expect(message.topicId).toEqual(topic.id);
      }
    });

    it('should create a topic with a unique id when no id is provided', async () => {
      const spy = vi.spyOn(uuidUtils, 'nanoid'); // 使用 Vitest 的 spy 功能来监视 nanoid 调用
      const result = await TopicModel.create(topicData);

      expect(spy).toHaveBeenCalled(); // 验证 nanoid 被调用来生成 id
      expect(result).toHaveProperty('id');
      expect(typeof result.id).toBe('string');
      spy.mockRestore(); // 测试结束后恢复原始行为
    });
  });
  describe('batch create', () => {
    it('should batch create topic records', async () => {
      const topicsToCreate = [topicData, topicData];
      const results = await TopicModel.batchCreate(topicsToCreate);

      expect(results.ids).toHaveLength(topicsToCreate.length);
      // Verify that the topics have been added to the database
      for (const result of results.ids!) {
        const topicInDb = await TopicModel.findById(result);
        expect(topicInDb).toEqual(
          expect.objectContaining({
            title: topicData.title,
            favorite: topicData.favorite ? 1 : 0,
            sessionId: topicData.sessionId,
          }),
        );
      }
    });

    it('should batch create topics with mixed favorite values', async () => {
      const mixedTopicsData: CreateTopicParams[] = [
        { ...topicData, favorite: true },
        { ...topicData, favorite: false },
      ];

      const results = await TopicModel.batchCreate(mixedTopicsData);

      expect(results.ids).toHaveLength(mixedTopicsData.length);
      for (const id of results.ids!) {
        const topicInDb = await TopicModel.findById(id);
        expect(topicInDb).toBeDefined();
        expect(topicInDb.favorite).toBeGreaterThanOrEqual(0);
        expect(topicInDb.favorite).toBeLessThanOrEqual(1);
      }
    });
  });

  it('should query topics with pagination', async () => {
    // Create multiple topics to test the query method
    await TopicModel.batchCreate([topicData, topicData]);

    const queryParams: QueryTopicParams = { pageSize: 1, current: 0, sessionId: 'session1' };
    const queriedTopics = await TopicModel.query(queryParams);

    expect(queriedTopics).toHaveLength(1);
  });

  it('should find topics by session id', async () => {
    // Create multiple topics to test the findBySessionId method
    await TopicModel.batchCreate([topicData, topicData]);

    const topicsBySessionId = await TopicModel.findBySessionId(topicData.sessionId);

    expect(topicsBySessionId).toHaveLength(2);
    expect(topicsBySessionId.every((i) => i.sessionId === topicData.sessionId)).toBeTruthy();
  });

  it('should delete a topic and its associated messages', async () => {
    const createdTopic = await TopicModel.create(topicData);

    await TopicModel.delete(createdTopic.id);

    // Verify the topic and its related messages are deleted
    const topicInDb = await TopicModel.findById(createdTopic.id);
    expect(topicInDb).toBeUndefined();

    // You need to verify that messages related to the topic are also deleted
    // This would require additional setup to create messages associated with the topic
    // and then assertions to check that they're deleted after the topic itself is deleted
  });

  it('should batch delete topics by session id', async () => {
    // Create multiple topics to test the batchDeleteBySessionId method
    await TopicModel.batchCreate([topicData, topicData]);

    await TopicModel.batchDeleteBySessionId(topicData.sessionId);

    // Verify that all topics with the given session id are deleted
    const topicsInDb = await TopicModel.findBySessionId(topicData.sessionId);
    expect(topicsInDb).toHaveLength(0);
  });

  it('should update a topic', async () => {
    const createdTopic = await TopicModel.create(topicData);
    const updateData = { title: 'New Title' };

    await TopicModel.update(createdTopic.id, updateData);
    const updatedTopic = await TopicModel.findById(createdTopic.id);

    expect(updatedTopic).toHaveProperty('title', 'New Title');
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status of a topic', async () => {
      const createdTopic = await TopicModel.create(topicData);

      const newState = await TopicModel.toggleFavorite(createdTopic.id);

      expect(newState).toBe(true);
      const topicInDb = await TopicModel.findById(createdTopic.id);
      expect(topicInDb).toHaveProperty('favorite', 1);
    });

    it('should handle toggleFavorite when topic does not exist', async () => {
      const nonExistentTopicId = 'non-existent-id';
      await expect(TopicModel.toggleFavorite(nonExistentTopicId)).rejects.toThrow(
        `Topic with id ${nonExistentTopicId} not found`,
      );
    });

    it('should set favorite to specific state using toggleFavorite', async () => {
      const createdTopic = await TopicModel.create(topicData);

      // Set favorite to true regardless of current state
      await TopicModel.toggleFavorite(createdTopic.id, true);
      let topicInDb = await TopicModel.findById(createdTopic.id);
      expect(topicInDb.favorite).toBe(1);

      // Set favorite to false regardless of current state
      await TopicModel.toggleFavorite(createdTopic.id, false);
      topicInDb = await TopicModel.findById(createdTopic.id);
      expect(topicInDb.favorite).toBe(0);
    });
  });

  it('should delete a topic and its associated messages', async () => {
    // 创建话题和相关联的消息
    const createdTopic = await TopicModel.create(topicData);
    const messageData: CreateMessageParams = {
      content: 'Test Message',
      topicId: createdTopic.id,
      sessionId: topicData.sessionId,
      role: 'user',
    };
    await MessageModel.create(messageData);

    // 删除话题
    await TopicModel.delete(createdTopic.id);

    // 验证话题是否被删除
    const topicInDb = await TopicModel.findById(createdTopic.id);
    expect(topicInDb).toBeUndefined();

    // 验证与话题关联的消息是否也被删除
    const messagesInDb = await MessageModel.query({
      sessionId: topicData.sessionId,
      topicId: createdTopic.id,
    });
    expect(messagesInDb).toHaveLength(0);
  });

  it('should batch delete topics and their associated messages', async () => {
    // 创建多个话题和相关联的消息
    const createdTopic1 = await TopicModel.create(topicData);
    const createdTopic2 = await TopicModel.create(topicData);

    const messageData1: CreateMessageParams = {
      content: 'Test Message 1',
      topicId: createdTopic1.id,
      sessionId: topicData.sessionId,
      role: 'user',
    };
    const messageData2: CreateMessageParams = {
      content: 'Test Message 2',
      topicId: createdTopic2.id,
      sessionId: topicData.sessionId,
      role: 'user',
    };
    await MessageModel.create(messageData1);
    await MessageModel.create(messageData2);

    // 执行批量删除
    await TopicModel.batchDelete([createdTopic1.id, createdTopic2.id]);

    // 验证话题是否被删除
    const topicInDb1 = await TopicModel.findById(createdTopic1.id);
    const topicInDb2 = await TopicModel.findById(createdTopic2.id);
    expect(topicInDb1).toBeUndefined();
    expect(topicInDb2).toBeUndefined();

    // 验证与话题关联的消息是否也被删除
    const messagesInDb1 = await MessageModel.query({
      sessionId: topicData.sessionId,
      topicId: createdTopic1.id,
    });
    const messagesInDb2 = await MessageModel.query({
      sessionId: topicData.sessionId,
      topicId: createdTopic2.id,
    });
    expect(messagesInDb1).toHaveLength(0);
    expect(messagesInDb2).toHaveLength(0);
  });

  describe('duplicateTopic', () => {
    let originalTopic: DBModel<DB_Topic>;
    let originalMessages: any[];

    beforeEach(async () => {
      // 创建一个原始主题
      const { id } = await TopicModel.create({
        title: 'Original Topic',
        sessionId: 'session1',
        favorite: false,
      });
      originalTopic = await TopicModel.findById(id);

      // 创建一些关联到原始主题的消息
      originalMessages = await Promise.all(
        ['Message 1', 'Message 2'].map((text) =>
          MessageModel.create({
            content: text,
            topicId: originalTopic.id,
            sessionId: originalTopic.sessionId!,
            role: 'user',
          }),
        ),
      );
    });

    afterEach(async () => {
      // 清理数据库中的所有主题和消息
      await TopicModel.clearTable();
      await MessageModel.clearTable();
    });

    it('should duplicate a topic with all associated messages', async () => {
      // 执行复制操作
      await TopicModel.duplicateTopic(originalTopic.id);

      // 验证复制后的主题是否存在
      const duplicatedTopic = await TopicModel.findBySessionId(originalTopic.sessionId!);
      expect(duplicatedTopic).toHaveLength(2);

      // 验证复制后的消息是否存在
      const duplicatedMessages = await MessageModel.query({
        sessionId: originalTopic.sessionId!,
        topicId: duplicatedTopic[1].id, // 假设复制的主题是第二个
      });
      expect(duplicatedMessages).toHaveLength(originalMessages.length);
    });

    it('should throw an error if the topic does not exist', async () => {
      // 尝试复制一个不存在的主题
      const nonExistentTopicId = nanoid();
      await expect(TopicModel.duplicateTopic(nonExistentTopicId)).rejects.toThrow(
        `Topic with id ${nonExistentTopicId} not found`,
      );
    });

    it('should preserve the properties of the duplicated topic', async () => {
      // 执行复制操作
      await TopicModel.duplicateTopic(originalTopic.id);

      // 获取复制的主题
      const topics = await TopicModel.findBySessionId(originalTopic.sessionId!);
      const duplicatedTopic = topics.find((topic) => topic.id !== originalTopic.id);

      // 验证复制的主题是否保留了原始主题的属性
      expect(duplicatedTopic).toBeDefined();
      expect(duplicatedTopic).toMatchObject({
        title: originalTopic.title,
        favorite: originalTopic.favorite,
        sessionId: originalTopic.sessionId,
      });
      // 确保生成了新的 ID
      expect(duplicatedTopic.id).not.toBe(originalTopic.id);
    });

    it('should properly handle the messages hierarchy when duplicating', async () => {
      // 创建一个子消息关联到其中一个原始消息
      const { id } = await MessageModel.create({
        content: 'Child Message',
        topicId: originalTopic.id,
        parentId: originalMessages[0].id,
        sessionId: originalTopic.sessionId!,
        role: 'user',
      });
      const childMessage = await MessageModel.findById(id);

      // 执行复制操作
      await TopicModel.duplicateTopic(originalTopic.id);

      // 获取复制的消息
      const duplicatedMessages = await MessageModel.queryBySessionId(originalTopic.sessionId!);

      // 验证复制的子消息是否存在并且 parentId 已更新
      const duplicatedChildMessage = duplicatedMessages.find(
        (message) => message.content === childMessage.content && message.id !== childMessage.id,
      );

      expect(duplicatedChildMessage).toBeDefined();
      expect(duplicatedChildMessage.parentId).not.toBe(childMessage.parentId);
      expect(duplicatedChildMessage.parentId).toBeDefined();
    });

    it('should fail if the database transaction fails', async () => {
      // 强制数据库事务失败，例如通过在复制过程中抛出异常
      const dbTransactionFailedError = new Error('DB transaction failed');
      const spyOn = vi.spyOn(TopicModel['db'], 'transaction').mockImplementation((async () => {
        throw dbTransactionFailedError;
      }) as any);

      // 尝试复制主题并捕捉期望的错误
      await expect(TopicModel.duplicateTopic(originalTopic.id)).rejects.toThrow(
        dbTransactionFailedError,
      );
      spyOn.mockRestore();
    });

    it('should not create partial duplicates if the process fails at some point', async () => {
      // 假设复制消息的过程中发生了错误
      vi.spyOn(MessageModel, 'duplicateMessages').mockImplementation(async () => {
        throw new Error('Failed to duplicate messages');
      });

      // 尝试复制主题，期望会抛出错误
      await expect(TopicModel.duplicateTopic(originalTopic.id)).rejects.toThrow();

      // 确保没有创建任何副本
      const topics = await TopicModel.findBySessionId(originalTopic.sessionId!);
      expect(topics).toHaveLength(1); // 只有原始主题

      const messages = await MessageModel.queryBySessionId(originalTopic.sessionId!);
      expect(messages).toHaveLength(originalMessages.length); // 只有原始消息
    });
  });

  describe('clearTable', () => {
    it('should clear the table', async () => {
      // Create a topic to ensure the table is not empty
      await TopicModel.create(topicData);

      // Clear the table
      await TopicModel.clearTable();

      // Verify the table is empty
      const topics = await TopicModel.queryAll();
      expect(topics).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update a topic', async () => {
      // Create a topic
      const createdTopic = await TopicModel.create(topicData);

      // Update the topic
      const newTitle = 'Updated Title';
      await TopicModel.update(createdTopic.id, { title: newTitle });

      // Verify the topic is updated
      const updatedTopic = await TopicModel.findById(createdTopic.id);
      expect(updatedTopic.title).toBe(newTitle);
    });
  });

  describe('batchDelete', () => {
    it('should batch delete topics', async () => {
      // Create multiple topics
      const topic1 = await TopicModel.create(topicData);
      const topic2 = await TopicModel.create(topicData);

      await TopicModel.create(topicData);

      const ids = [topic1.id, topic2.id];
      // Batch delete the topics
      await TopicModel.batchDelete(ids);

      expect(await TopicModel.table.count()).toEqual(1);
    });
  });

  describe('queryAll', () => {
    it('should query all topics', async () => {
      // Create multiple topics
      await TopicModel.batchCreate([topicData, topicData]);

      // Query all topics
      const topics = await TopicModel.queryAll();

      // Verify all topics are queried
      expect(topics).toHaveLength(2);
    });
  });

  describe('queryByKeyword', () => {
    it('should query topics by keyword', async () => {
      // Create a topic with a unique title
      const uniqueTitle = 'Unique Title';
      await TopicModel.create({ ...topicData, title: uniqueTitle });

      // Query topics by the unique title
      const topics = await TopicModel.queryByKeyword(uniqueTitle);

      // Verify the correct topic is queried
      expect(topics).toHaveLength(1);
      expect(topics[0].title).toBe(uniqueTitle);
    });
  });
});
