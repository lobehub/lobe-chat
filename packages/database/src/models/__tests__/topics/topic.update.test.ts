import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { agents, sessions, topics, users } from '../../../schemas';
import { LobeChatDatabase } from '../../../type';
import { TopicModel } from '../../topic';
import { getTestDB } from '../_util';

const userId = 'topic-update-user';
const userId2 = 'topic-update-user-2';
const sessionId = 'topic-update-session';
const serverDB: LobeChatDatabase = await getTestDB();
const topicModel = new TopicModel(serverDB, userId);
const topicModel2 = new TopicModel(serverDB, userId2);

describe('TopicModel - Update', () => {
  beforeEach(async () => {
    await serverDB.delete(users);
    await serverDB.transaction(async (tx) => {
      await tx.insert(users).values([{ id: userId }, { id: userId2 }]);
      await tx.insert(sessions).values({ id: sessionId, userId });
    });
  });

  afterEach(async () => {
    await serverDB.delete(users);
  });

  describe('update', () => {
    it('should update a topic', async () => {
      const topicId = '123';
      await serverDB.insert(topics).values({ userId, id: topicId, title: 'Test', favorite: true });

      const item = await topicModel.update(topicId, {
        title: 'Updated Test',
        favorite: false,
      });

      expect(item).toHaveLength(1);
      expect(item[0].title).toBe('Updated Test');
      expect(item[0].favorite).toBeFalsy();
    });

    it('should not update a topic if user ID does not match', async () => {
      await serverDB.insert(users).values([{ id: '456' }]);
      const topicId = '123';
      await serverDB
        .insert(topics)
        .values({ userId: '456', id: topicId, title: 'Test', favorite: true });

      const item = await topicModel.update(topicId, {
        title: 'Updated Test Session',
      });

      expect(item).toHaveLength(0);
    });
  });

  describe('migrateAgentId', () => {
    describe('inbox migration', () => {
      it('should migrate legacy inbox topics and preserve updatedAt', async () => {
        const agentId = 'inbox-agent-id';
        await serverDB.insert(agents).values({ id: agentId, userId });

        // Create legacy inbox topics (sessionId IS NULL, groupId IS NULL, agentId IS NULL)
        const originalUpdatedAt = new Date('2024-01-01T00:00:00Z');
        await serverDB.insert(topics).values([
          {
            id: 'topic-1',
            userId,
            title: 'Legacy inbox topic 1',
            sessionId: null,
            groupId: null,
            agentId: null,
            updatedAt: originalUpdatedAt,
          },
          {
            id: 'topic-2',
            userId,
            title: 'Legacy inbox topic 2',
            sessionId: null,
            groupId: null,
            agentId: null,
            updatedAt: originalUpdatedAt,
          },
        ]);

        // Run migration
        await topicModel.migrateAgentId({ agentId, isInbox: true });

        // Verify topics are migrated
        const migratedTopics = await serverDB.query.topics.findMany({
          where: eq(topics.userId, userId),
        });

        expect(migratedTopics).toHaveLength(2);
        migratedTopics.forEach((topic) => {
          expect(topic.agentId).toBe(agentId);
          // updatedAt should be preserved
          expect(topic.updatedAt.getTime()).toBe(originalUpdatedAt.getTime());
        });
      });

      it('should not migrate topics that already have agentId', async () => {
        const agentId = 'inbox-agent-id';
        const existingAgentId = 'existing-agent-id';
        await serverDB.insert(agents).values([
          { id: agentId, userId },
          { id: existingAgentId, userId },
        ]);

        // Create a topic that already has agentId
        await serverDB.insert(topics).values({
          id: 'topic-with-agent',
          userId,
          title: 'Topic with agent',
          agentId: existingAgentId,
        });

        // Run migration
        await topicModel.migrateAgentId({ agentId, isInbox: true });

        // Verify topic was not changed
        const topic = await serverDB.query.topics.findFirst({
          where: eq(topics.id, 'topic-with-agent'),
        });

        expect(topic?.agentId).toBe(existingAgentId);
      });

      it('should not migrate other user topics', async () => {
        const agentId = 'inbox-agent-id';
        await serverDB.insert(agents).values({ id: agentId, userId });

        // Create legacy inbox topic for user2
        await serverDB.insert(topics).values({
          id: 'user2-topic',
          userId: userId2,
          title: 'User2 legacy inbox topic',
          sessionId: null,
          groupId: null,
          agentId: null,
        });

        // Run migration for user1
        await topicModel.migrateAgentId({ agentId, isInbox: true });

        // Verify user2's topic was not migrated
        const topic = await serverDB.query.topics.findFirst({
          where: eq(topics.id, 'user2-topic'),
        });

        expect(topic?.agentId).toBeNull();
      });
    });

    describe('session migration', () => {
      it('should migrate topics by sessionId and preserve updatedAt', async () => {
        const agentId = 'test-agent-id';
        await serverDB.insert(agents).values({ id: agentId, userId });

        // Create legacy topics with sessionId but no agentId
        const originalUpdatedAt = new Date('2024-06-15T12:00:00Z');
        await serverDB.insert(topics).values([
          {
            id: 'session-topic-1',
            userId,
            title: 'Legacy session topic 1',
            sessionId,
            agentId: null,
            updatedAt: originalUpdatedAt,
          },
          {
            id: 'session-topic-2',
            userId,
            title: 'Legacy session topic 2',
            sessionId,
            agentId: null,
            updatedAt: originalUpdatedAt,
          },
        ]);

        // Run migration
        await topicModel.migrateAgentId({ agentId, sessionId });

        // Verify topics are migrated
        const migratedTopics = await serverDB.query.topics.findMany({
          where: eq(topics.sessionId, sessionId),
        });

        expect(migratedTopics).toHaveLength(2);
        migratedTopics.forEach((topic) => {
          expect(topic.agentId).toBe(agentId);
          // updatedAt should be preserved
          expect(topic.updatedAt.getTime()).toBe(originalUpdatedAt.getTime());
        });
      });

      it('should not migrate topics from different session', async () => {
        const agentId = 'test-agent-id';
        const otherSessionId = 'other-session-id';
        await serverDB.insert(agents).values({ id: agentId, userId });
        await serverDB.insert(sessions).values({ id: otherSessionId, userId });

        // Create topic for different session
        await serverDB.insert(topics).values({
          id: 'other-session-topic',
          userId,
          title: 'Other session topic',
          sessionId: otherSessionId,
          agentId: null,
        });

        // Run migration for sessionId
        await topicModel.migrateAgentId({ agentId, sessionId });

        // Verify other session's topic was not migrated
        const topic = await serverDB.query.topics.findFirst({
          where: eq(topics.id, 'other-session-topic'),
        });

        expect(topic?.agentId).toBeNull();
      });

      it('should not migrate topics that already have agentId', async () => {
        const agentId = 'test-agent-id';
        const existingAgentId = 'existing-agent-id';
        await serverDB.insert(agents).values([
          { id: agentId, userId },
          { id: existingAgentId, userId },
        ]);

        // Create topic that already has agentId
        await serverDB.insert(topics).values({
          id: 'topic-with-agent',
          userId,
          title: 'Topic with existing agent',
          sessionId,
          agentId: existingAgentId,
        });

        // Run migration
        await topicModel.migrateAgentId({ agentId, sessionId });

        // Verify topic was not changed
        const topic = await serverDB.query.topics.findFirst({
          where: eq(topics.id, 'topic-with-agent'),
        });

        expect(topic?.agentId).toBe(existingAgentId);
      });

      it('should not migrate other user topics', async () => {
        const agentId = 'test-agent-id';
        const user2SessionId = 'user2-session-id';
        await serverDB.insert(agents).values({ id: agentId, userId });
        await serverDB.insert(sessions).values({ id: user2SessionId, userId: userId2 });

        // Create topic for user2
        await serverDB.insert(topics).values({
          id: 'user2-session-topic',
          userId: userId2,
          title: 'User2 session topic',
          sessionId: user2SessionId,
          agentId: null,
        });

        // Run migration for user1 (even with user2's sessionId, should not affect due to userId check)
        await topicModel.migrateAgentId({ agentId, sessionId: user2SessionId });

        // Verify user2's topic was not migrated
        const topic = await serverDB.query.topics.findFirst({
          where: eq(topics.id, 'user2-session-topic'),
        });

        expect(topic?.agentId).toBeNull();
      });
    });
  });
});
