import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clientDB, initializeDB } from '@/database/client/db';
import { sessions, topics, users } from '@/database/schemas';
import { ChatTopic } from '@/types/topic';

import { ClientService } from './pglite';

// Mock data
const userId = 'topic-user-test';
const sessionId = 'topic-session';
const mockTopicId = 'mock-topic-id';

const mockTopic = {
  id: mockTopicId,
  title: 'Mock Topic',
};

const topicService = new ClientService(userId);

beforeEach(async () => {
  await initializeDB();

  await clientDB.delete(users);

  // 创建测试数据
  await clientDB.transaction(async (tx) => {
    await tx.insert(users).values({ id: userId });
    await tx.insert(sessions).values({ id: sessionId, userId });
    await tx.insert(topics).values({ ...mockTopic, sessionId, userId });
  });
});

describe('TopicService', () => {
  describe('createTopic', () => {
    it('should create a topic and return its id', async () => {
      // Setup
      const createParams = {
        title: 'New Topic',
        sessionId: sessionId,
      };

      // Execute
      const topicId = await topicService.createTopic(createParams);

      // Assert
      expect(topicId).toBeDefined();
    });

    it('should throw an error if topic creation fails', async () => {
      // Setup
      const createParams = {
        title: 'New Topic',
        sessionId: 123 as any, // sessionId should be string
      };

      // Execute & Assert
      await expect(topicService.createTopic(createParams)).rejects.toThrowError();
    });
  });

  describe('getTopics', () => {
    // Example for getTopics
    it('should query topics with given parameters', async () => {
      // Setup
      const queryParams = { sessionId };

      // Execute
      const data = await topicService.getTopics(queryParams);

      // Assert
      expect(data[0]).toMatchObject(mockTopic);
    });
  });

  describe('updateTopic', () => {
    // Example for updateFavorite
    it('should toggle favorite status of a topic', async () => {
      // Execute
      const result = await topicService.updateTopic(mockTopicId, { favorite: true });

      // Assert
      expect(result[0].favorite).toBeTruthy();
    });

    it('should update the title of a topic', async () => {
      // Setup
      const newTitle = 'Updated Topic Title';

      // Execute
      const result = await topicService.updateTopic(mockTopicId, { title: newTitle });

      // Assert
      expect(result[0].title).toEqual(newTitle);
    });
  });

  describe('removeTopic', () => {
    it('should remove a topic by id', async () => {
      // Execute
      await topicService.removeTopic(mockTopicId);
      const result = await clientDB.query.topics.findFirst({ where: eq(topics.id, mockTopicId) });

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('removeTopics', () => {
    it('should remove all topics with a given session id', async () => {
      // Setup
      const sessionId = 'session-id';

      // Execute
      await topicService.removeTopics(sessionId);
      const result = await clientDB.query.topics.findMany({
        where: eq(topics.sessionId, sessionId),
      });

      expect(result.length).toEqual(0);
    });
  });

  describe('batchRemoveTopics', () => {
    it('should batch remove topics', async () => {
      await clientDB.insert(topics).values([{ id: 'topic-id-1', title: 'topic-title', userId }]);
      // Setup
      const topicIds = [mockTopicId, 'another-topic-id'];

      // Execute
      await topicService.batchRemoveTopics(topicIds);

      const count = await clientDB.$count(topics);

      // Assert
      expect(count).toBe(1);
    });
  });

  describe('removeAllTopic', () => {
    it('should clear all topics from the table', async () => {
      // Execute
      await topicService.removeAllTopic();

      const count = await clientDB.$count(topics);
      // Assert
      expect(count).toBe(0);
    });
  });

  describe('batchCreateTopics', () => {
    it('should batch create topics', async () => {
      // Execute
      const result = await topicService.batchCreateTopics([
        { id: 'topic-id-1', title: 'topic-title' },
        { id: 'topic-id-2', title: 'topic-title' },
      ] as ChatTopic[]);

      // Assert
      expect(result.success).toBeTruthy();
      expect(result.added).toBe(2);
    });
  });

  describe('getAllTopics', () => {
    it('should retrieve all topics', async () => {
      await clientDB.insert(topics).values([
        { id: 'topic-id-1', title: 'topic-title', userId },
        { id: 'topic-id-2', title: 'topic-title', userId },
      ]);
      // Execute
      const result = await topicService.getAllTopics();

      // Assert
      expect(result.length).toEqual(3);
    });
  });

  describe('searchTopics', () => {
    it('should return all topics that match the keyword', async () => {
      // Setup
      const keyword = 'Topic';

      // Execute
      const result = await topicService.searchTopics(keyword, sessionId);

      // Assert
      expect(result.length).toEqual(1);
    });
    it('should return empty topic if not match the keyword', async () => {
      // Setup
      const keyword = 'search';

      // Execute
      const result = await topicService.searchTopics(keyword, sessionId);

      // Assert
      expect(result.length).toEqual(0);
    });
  });

  describe('countTopics', () => {
    it('should return topic counts', async () => {
      // Execute
      const result = await topicService.countTopics();

      // Assert
      expect(result).toBe(1);
    });
  });
});
