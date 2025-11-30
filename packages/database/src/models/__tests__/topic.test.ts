import { eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  agents,
  agentsToSessions,
  chatGroups,
  messages,
  sessions,
  topics,
  users,
} from '../../schemas';
import { LobeChatDatabase } from '../../type';
import { CreateTopicParams, TopicModel } from '../topic';
import { getTestDB } from './_util';

const userId = 'topic-user-test';
const sessionId = 'topic-session';
const serverDB: LobeChatDatabase = await getTestDB();
const topicModel = new TopicModel(serverDB, userId);

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
      const result = await topicModel.query({ containerId: sessionId });

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
      const result = await topicModel.query({ containerId: 'session1' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should query topics by group ID', async () => {
      await serverDB.transaction(async (tx) => {
        await tx.insert(chatGroups).values([
          { id: 'chat-group-1', title: 'Chat Group 1', userId },
          { id: 'chat-group-2', title: 'Chat Group 2', userId },
        ]);

        await tx.insert(topics).values([
          {
            id: 'group-topic-1',
            userId,
            groupId: 'chat-group-1',
            favorite: true,
            updatedAt: new Date('2023-05-01'),
          },
          {
            id: 'group-topic-2',
            userId,
            groupId: 'chat-group-1',
            favorite: false,
            updatedAt: new Date('2023-04-01'),
          },
          {
            id: 'group-topic-3',
            userId,
            groupId: 'chat-group-2',
            favorite: true,
            updatedAt: new Date('2023-06-01'),
          },
        ]);
      });

      const result = await topicModel.query({ containerId: 'chat-group-1' });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('group-topic-1');
      expect(result[1].id).toBe('group-topic-2');
    });

    it('should return topics based on pagination parameters', async () => {
      // 创建测试数据
      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId, userId, updatedAt: new Date('2023-01-01') },
        { id: 'topic2', sessionId, userId, updatedAt: new Date('2023-01-02') },
        { id: 'topic3', sessionId, userId, updatedAt: new Date('2023-01-03') },
      ]);

      // 调用 query 方法
      const result1 = await topicModel.query({ containerId: sessionId, current: 0, pageSize: 2 });
      const result2 = await topicModel.query({ containerId: sessionId, current: 1, pageSize: 2 });

      // 断言返回结果符合分页要求
      expect(result1).toHaveLength(2);
      expect(result1[0].id).toBe('topic3');
      expect(result1[1].id).toBe('topic2');

      expect(result2).toHaveLength(1);
      expect(result2[0].id).toBe('topic1');
    });

    describe('query with agentId filter', () => {
      // ========== Legacy data tests (topics with sessionId only) ==========
      it('should filter legacy topics by agentId through agentsToSessions lookup', async () => {
        await serverDB.transaction(async (trx) => {
          await trx.insert(sessions).values([
            { id: 'session-for-agent', userId },
            { id: 'session-other', userId },
          ]);

          await trx.insert(agents).values([{ id: 'agent1', userId, title: 'Agent 1' }]);

          await trx
            .insert(agentsToSessions)
            .values([{ agentId: 'agent1', sessionId: 'session-for-agent', userId }]);

          // Legacy topics: have sessionId but no agentId
          await trx.insert(topics).values([
            {
              id: 'topic-agent-session',
              userId,
              sessionId: 'session-for-agent',
              agentId: null,
              updatedAt: new Date('2023-01-01'),
            },
            {
              id: 'topic-other-session',
              userId,
              sessionId: 'session-other',
              agentId: null,
              updatedAt: new Date('2023-01-02'),
            },
          ]);
        });

        // Query with agentId should return legacy topics from the associated session
        const result = await topicModel.query({ agentId: 'agent1' });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('topic-agent-session');
      });

      // ========== New data tests (topics with agentId directly) ==========
      it('should filter new topics by agentId directly', async () => {
        await serverDB.transaction(async (trx) => {
          await trx.insert(agents).values([
            { id: 'new-agent-1', userId, title: 'New Agent 1' },
            { id: 'new-agent-2', userId, title: 'New Agent 2' },
          ]);

          // New topics: have agentId directly stored
          await trx.insert(topics).values([
            {
              id: 'new-topic-1',
              userId,
              agentId: 'new-agent-1',
              sessionId: null,
              updatedAt: new Date('2023-01-01'),
            },
            {
              id: 'new-topic-2',
              userId,
              agentId: 'new-agent-2',
              sessionId: null,
              updatedAt: new Date('2023-01-02'),
            },
          ]);
        });

        // Query with agentId should return topics with matching agentId
        const result = await topicModel.query({ agentId: 'new-agent-1' });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('new-topic-1');
      });

      // ========== Mixed data tests (both legacy and new topics) ==========
      it('should return both legacy and new topics when querying by agentId', async () => {
        await serverDB.transaction(async (trx) => {
          await trx.insert(sessions).values([{ id: 'mixed-session', userId }]);

          await trx.insert(agents).values([{ id: 'mixed-agent', userId, title: 'Mixed Agent' }]);

          await trx
            .insert(agentsToSessions)
            .values([{ agentId: 'mixed-agent', sessionId: 'mixed-session', userId }]);

          await trx.insert(topics).values([
            // Legacy topic: has sessionId, no agentId
            {
              id: 'legacy-topic',
              userId,
              sessionId: 'mixed-session',
              agentId: null,
              updatedAt: new Date('2023-01-01'),
            },
            // New topic: has agentId directly
            {
              id: 'new-topic',
              userId,
              sessionId: null,
              agentId: 'mixed-agent',
              updatedAt: new Date('2023-01-02'),
            },
            // Topic with both agentId and sessionId
            {
              id: 'both-topic',
              userId,
              sessionId: 'mixed-session',
              agentId: 'mixed-agent',
              updatedAt: new Date('2023-01-03'),
            },
          ]);
        });

        const result = await topicModel.query({ agentId: 'mixed-agent' });

        // Should return all 3 topics
        expect(result).toHaveLength(3);
        expect(result.map((t) => t.id).sort()).toEqual(['both-topic', 'legacy-topic', 'new-topic']);
      });

      it('should not return duplicate topics when both agentId and sessionId match', async () => {
        await serverDB.transaction(async (trx) => {
          await trx.insert(sessions).values([{ id: 'dedup-session', userId }]);

          await trx.insert(agents).values([{ id: 'dedup-agent', userId, title: 'Dedup Agent' }]);

          await trx
            .insert(agentsToSessions)
            .values([{ agentId: 'dedup-agent', sessionId: 'dedup-session', userId }]);

          // Topic with both agentId and sessionId pointing to the same agent
          await trx.insert(topics).values([
            {
              id: 'dedup-topic',
              userId,
              sessionId: 'dedup-session',
              agentId: 'dedup-agent',
              updatedAt: new Date('2023-01-01'),
            },
          ]);
        });

        const result = await topicModel.query({ agentId: 'dedup-agent' });

        // Should return exactly 1 topic (no duplicates)
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('dedup-topic');
      });

      // ========== Edge cases ==========
      it('should return empty array when agentId has no associated session and no direct agentId match', async () => {
        await serverDB.transaction(async (trx) => {
          await trx.insert(sessions).values([{ id: 'session1', userId }]);

          await trx
            .insert(agents)
            .values([{ id: 'agent-no-match', userId, title: 'Agent No Match' }]);

          await trx.insert(topics).values([
            {
              id: 'topic-session1',
              userId,
              sessionId: 'session1',
              agentId: null,
            },
          ]);
        });

        // Query with agentId that has no session association and no direct match
        const result = await topicModel.query({ agentId: 'agent-no-match' });

        expect(result).toHaveLength(0);
      });

      it('should return topics with direct agentId match even without agentsToSessions entry', async () => {
        await serverDB.transaction(async (trx) => {
          await trx.insert(agents).values([{ id: 'orphan-agent', userId, title: 'Orphan Agent' }]);

          // No agentsToSessions entry for this agent
          await trx.insert(topics).values([
            {
              id: 'orphan-topic',
              userId,
              agentId: 'orphan-agent',
              sessionId: null,
              updatedAt: new Date('2023-01-01'),
            },
          ]);
        });

        const result = await topicModel.query({ agentId: 'orphan-agent' });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('orphan-topic');
      });

      // ========== User isolation tests ==========
      it('should only return topics for current user when querying by agentId', async () => {
        const otherUserId = 'other-user-for-topic-test';

        await serverDB.transaction(async (trx) => {
          await trx.insert(users).values([{ id: otherUserId }]);

          await trx
            .insert(agents)
            .values([{ id: 'shared-agent-name', userId, title: 'User Agent' }]);

          // Create topic for current user with agentId
          await trx.insert(topics).values([
            {
              id: 'user-topic',
              userId,
              agentId: 'shared-agent-name',
            },
            {
              id: 'other-user-topic',
              userId: otherUserId,
              agentId: 'shared-agent-name', // Same agentId but different user
            },
          ]);
        });

        const result = await topicModel.query({ agentId: 'shared-agent-name' });

        // Should only return current user's topic
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('user-topic');
      });

      it('should only lookup agentsToSessions for current user', async () => {
        const otherUserId = 'other-user-for-topic-test-2';

        await serverDB.transaction(async (trx) => {
          await trx.insert(users).values([{ id: otherUserId }]);

          await trx.insert(sessions).values([
            { id: 'user-session', userId },
            { id: 'other-user-session', userId: otherUserId },
          ]);

          await trx.insert(agents).values([
            { id: 'user-agent', userId, title: 'User Agent' },
            { id: 'other-user-agent', userId: otherUserId, title: 'Other User Agent' },
          ]);

          // Only create agentsToSessions for the other user
          await trx
            .insert(agentsToSessions)
            .values([
              { agentId: 'other-user-agent', sessionId: 'other-user-session', userId: otherUserId },
            ]);

          await trx.insert(topics).values([
            {
              id: 'topic-user',
              userId,
              agentId: 'other-user-agent', // Has same agentId but won't match via session lookup
            },
            {
              id: 'topic-other-user',
              userId: otherUserId,
              sessionId: 'other-user-session',
            },
          ]);
        });

        // Query with other user's agentId
        const result = await topicModel.query({ agentId: 'other-user-agent' });

        // Should return current user's topic with matching agentId
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('topic-user');
      });

      // ========== Pagination tests ==========
      it('should work with agentId and pagination', async () => {
        await serverDB.transaction(async (trx) => {
          await trx
            .insert(agents)
            .values([{ id: 'paginate-agent', userId, title: 'Paginate Agent' }]);

          await trx.insert(topics).values([
            {
              id: 'page-topic1',
              userId,
              agentId: 'paginate-agent',
              updatedAt: new Date('2023-01-01'),
            },
            {
              id: 'page-topic2',
              userId,
              agentId: 'paginate-agent',
              updatedAt: new Date('2023-01-02'),
            },
            {
              id: 'page-topic3',
              userId,
              agentId: 'paginate-agent',
              updatedAt: new Date('2023-01-03'),
            },
          ]);
        });

        // Query with agentId and pagination
        const result = await topicModel.query({
          agentId: 'paginate-agent',
          current: 0,
          pageSize: 2,
        });

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('page-topic3'); // Most recent first
        expect(result[1].id).toBe('page-topic2');

        // Second page
        const result2 = await topicModel.query({
          agentId: 'paginate-agent',
          current: 1,
          pageSize: 2,
        });
        expect(result2).toHaveLength(1);
        expect(result2[0].id).toBe('page-topic1');
      });

      it('should work with agentId and favorite sorting', async () => {
        await serverDB.transaction(async (trx) => {
          await trx.insert(agents).values([{ id: 'fav-agent', userId, title: 'Fav Agent' }]);

          await trx.insert(topics).values([
            {
              id: 'fav-topic1',
              userId,
              agentId: 'fav-agent',
              favorite: false,
              updatedAt: new Date('2023-01-03'),
            },
            {
              id: 'fav-topic2',
              userId,
              agentId: 'fav-agent',
              favorite: true,
              updatedAt: new Date('2023-01-01'),
            },
            {
              id: 'fav-topic3',
              userId,
              agentId: 'fav-agent',
              favorite: true,
              updatedAt: new Date('2023-01-02'),
            },
          ]);
        });

        const result = await topicModel.query({ agentId: 'fav-agent' });

        expect(result).toHaveLength(3);
        // Favorites first, then by updatedAt desc
        expect(result[0].id).toBe('fav-topic3'); // favorite=true, most recent
        expect(result[1].id).toBe('fav-topic2'); // favorite=true, older
        expect(result[2].id).toBe('fav-topic1'); // favorite=false
      });

      // ========== ContainerId fallback tests (preserved from original) ==========
      it('should use containerId when agentId is not provided', async () => {
        await serverDB.transaction(async (trx) => {
          await trx.insert(sessions).values([{ id: 'container-session', userId }]);

          await trx.insert(topics).values([
            {
              id: 'container-topic',
              userId,
              sessionId: 'container-session',
              updatedAt: new Date('2023-01-01'),
            },
          ]);
        });

        // Query without agentId, only containerId
        const result = await topicModel.query({ containerId: 'container-session' });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('container-topic');
      });

      it('should ignore containerId when agentId is provided', async () => {
        await serverDB.transaction(async (trx) => {
          await trx.insert(sessions).values([
            { id: 'agent-only-session', userId },
            { id: 'container-only-session', userId },
          ]);

          await trx
            .insert(agents)
            .values([{ id: 'priority-agent', userId, title: 'Priority Agent' }]);

          await trx
            .insert(agentsToSessions)
            .values([{ agentId: 'priority-agent', sessionId: 'agent-only-session', userId }]);

          await trx.insert(topics).values([
            {
              id: 'agent-topic',
              userId,
              sessionId: 'agent-only-session',
              updatedAt: new Date('2023-01-01'),
            },
            {
              id: 'container-topic',
              userId,
              sessionId: 'container-only-session',
              updatedAt: new Date('2023-01-02'),
            },
          ]);
        });

        // Query with both agentId and containerId - agentId takes priority
        const result = await topicModel.query({
          agentId: 'priority-agent',
          containerId: 'container-only-session',
        });

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('agent-topic');
      });
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

  describe('batchDeleteByGroupId', () => {
    it('should delete all topics associated with a group', async () => {
      await serverDB.insert(chatGroups).values([
        { id: 'group1', userId, title: 'Group 1' },
        { id: 'group2', userId, title: 'Group 2' },
      ]);
      await serverDB.insert(topics).values([
        { id: 'topic1', groupId: 'group1', userId },
        { id: 'topic2', groupId: 'group1', userId },
        { id: 'topic3', groupId: 'group2', userId },
        { id: 'topic4', userId },
      ]);

      // 调用 batchDeleteByGroupId 方法
      await topicModel.batchDeleteByGroupId('group1');

      // 断言属于 group1 的 topics 都被删除了
      expect(await serverDB.select().from(topics).where(eq(topics.groupId, 'group1'))).toHaveLength(
        0,
      );
      expect(await serverDB.select().from(topics)).toHaveLength(2);
    });

    it('should delete all topics associated without groupId', async () => {
      await serverDB.insert(chatGroups).values([{ id: 'group1', userId, title: 'Group 1' }]);

      await serverDB.insert(topics).values([
        { id: 'topic1', groupId: 'group1', userId },
        { id: 'topic2', groupId: 'group1', userId },
        { id: 'topic4', userId },
      ]);

      // 调用 batchDeleteByGroupId 方法
      await topicModel.batchDeleteByGroupId();

      // 断言属于 group1 的 topics 都被删除了
      expect(await serverDB.select().from(topics).where(eq(topics.groupId, 'group1'))).toHaveLength(
        2,
      );
      expect(await serverDB.select().from(topics)).toHaveLength(2);
    });
  });

  describe('batchDeleteByAgentId', () => {
    it('should delete topics with direct agentId match (new data)', async () => {
      await serverDB.transaction(async (trx) => {
        await trx.insert(agents).values([
          { id: 'delete-agent-1', userId, title: 'Delete Agent 1' },
          { id: 'delete-agent-2', userId, title: 'Delete Agent 2' },
        ]);

        await trx.insert(topics).values([
          { id: 'topic-agent-1', userId, agentId: 'delete-agent-1' },
          { id: 'topic-agent-1-b', userId, agentId: 'delete-agent-1' },
          { id: 'topic-agent-2', userId, agentId: 'delete-agent-2' },
        ]);
      });

      // Delete topics for agent 1
      await topicModel.batchDeleteByAgentId('delete-agent-1');

      // Verify agent 1 topics are deleted
      const remainingTopics = await serverDB.select().from(topics).where(eq(topics.userId, userId));
      expect(remainingTopics).toHaveLength(1);
      expect(remainingTopics[0].id).toBe('topic-agent-2');
    });

    it('should delete legacy topics via sessionId lookup', async () => {
      await serverDB.transaction(async (trx) => {
        await trx.insert(sessions).values([
          { id: 'legacy-session-1', userId },
          { id: 'legacy-session-2', userId },
        ]);

        await trx.insert(agents).values([{ id: 'legacy-agent', userId, title: 'Legacy Agent' }]);

        await trx
          .insert(agentsToSessions)
          .values([{ agentId: 'legacy-agent', sessionId: 'legacy-session-1', userId }]);

        // Legacy topics: have sessionId but no agentId
        await trx.insert(topics).values([
          { id: 'legacy-topic-1', userId, sessionId: 'legacy-session-1', agentId: null },
          { id: 'legacy-topic-2', userId, sessionId: 'legacy-session-1', agentId: null },
          { id: 'other-session-topic', userId, sessionId: 'legacy-session-2', agentId: null },
        ]);
      });

      // Delete topics for legacy agent
      await topicModel.batchDeleteByAgentId('legacy-agent');

      // Verify legacy topics are deleted
      const remainingTopics = await serverDB.select().from(topics).where(eq(topics.userId, userId));
      expect(remainingTopics).toHaveLength(1);
      expect(remainingTopics[0].id).toBe('other-session-topic');
    });

    it('should delete both new and legacy topics', async () => {
      await serverDB.transaction(async (trx) => {
        await trx.insert(sessions).values([{ id: 'mixed-del-session', userId }]);

        await trx
          .insert(agents)
          .values([{ id: 'mixed-del-agent', userId, title: 'Mixed Delete Agent' }]);

        await trx
          .insert(agentsToSessions)
          .values([{ agentId: 'mixed-del-agent', sessionId: 'mixed-del-session', userId }]);

        await trx.insert(topics).values([
          // Legacy topic
          { id: 'mixed-legacy', userId, sessionId: 'mixed-del-session', agentId: null },
          // New topic
          { id: 'mixed-new', userId, agentId: 'mixed-del-agent', sessionId: null },
          // Topic with both
          { id: 'mixed-both', userId, sessionId: 'mixed-del-session', agentId: 'mixed-del-agent' },
        ]);
      });

      // Delete all topics for the agent
      await topicModel.batchDeleteByAgentId('mixed-del-agent');

      // All topics should be deleted
      const remainingTopics = await serverDB.select().from(topics).where(eq(topics.userId, userId));
      expect(remainingTopics).toHaveLength(0);
    });

    it('should not delete topics from other users', async () => {
      const otherUserId = 'other-user-delete-test';

      await serverDB.transaction(async (trx) => {
        await trx.insert(users).values([{ id: otherUserId }]);

        await trx
          .insert(agents)
          .values([{ id: 'shared-delete-agent', userId, title: 'Shared Agent' }]);

        await trx.insert(topics).values([
          { id: 'user-topic-del', userId, agentId: 'shared-delete-agent' },
          { id: 'other-user-topic-del', userId: otherUserId, agentId: 'shared-delete-agent' },
        ]);
      });

      // Delete topics for current user
      await topicModel.batchDeleteByAgentId('shared-delete-agent');

      // Only current user's topic should be deleted
      const allTopics = await serverDB.select().from(topics);
      expect(allTopics).toHaveLength(1);
      expect(allTopics[0].id).toBe('other-user-topic-del');
    });

    it('should handle agent with no associated session gracefully', async () => {
      await serverDB.transaction(async (trx) => {
        await trx
          .insert(agents)
          .values([{ id: 'no-session-agent', userId, title: 'No Session Agent' }]);

        // No agentsToSessions entry
        await trx
          .insert(topics)
          .values([{ id: 'orphan-del-topic', userId, agentId: 'no-session-agent' }]);
      });

      // Should still delete topics with direct agentId match
      await topicModel.batchDeleteByAgentId('no-session-agent');

      const remainingTopics = await serverDB.select().from(topics).where(eq(topics.userId, userId));
      expect(remainingTopics).toHaveLength(0);
    });

    it('should not delete any topics if agentId does not match', async () => {
      await serverDB.transaction(async (trx) => {
        await trx
          .insert(agents)
          .values([{ id: 'existing-agent', userId, title: 'Existing Agent' }]);

        await trx
          .insert(topics)
          .values([{ id: 'existing-topic', userId, agentId: 'existing-agent' }]);
      });

      // Delete with non-existent agentId
      await topicModel.batchDeleteByAgentId('non-existent-agent');

      // No topics should be deleted
      const remainingTopics = await serverDB.select().from(topics).where(eq(topics.userId, userId));
      expect(remainingTopics).toHaveLength(1);
    });

    it('should delete associated messages when topics are deleted', async () => {
      await serverDB.transaction(async (trx) => {
        await trx
          .insert(agents)
          .values([{ id: 'msg-del-agent', userId, title: 'Message Delete Agent' }]);

        await trx
          .insert(topics)
          .values([{ id: 'msg-del-topic', userId, agentId: 'msg-del-agent' }]);

        await trx.insert(messages).values([
          { id: 'msg1', userId, role: 'user', topicId: 'msg-del-topic' },
          { id: 'msg2', userId, role: 'assistant', topicId: 'msg-del-topic' },
        ]);
      });

      // Delete topic
      await topicModel.batchDeleteByAgentId('msg-del-agent');

      // Messages should be deleted via cascade
      const remainingMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.userId, userId));
      expect(remainingMessages).toHaveLength(0);
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
        historySummary: null,
        metadata: null,
        groupId: null,
        clientId: null,
        agentId: null,
        content: null,
        editorData: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        accessedAt: expect.any(Date),
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
        agentId: null,
        content: null,
        editorData: null,
        groupId: null,
        historySummary: null,
        metadata: null,
        sessionId,
        userId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        accessedAt: expect.any(Date),
      });

      // 断言 topic 已在数据库中创建
      const dbTopic = await serverDB.select().from(topics).where(eq(topics.id, topicId));
      expect(dbTopic).toHaveLength(1);
      expect(dbTopic[0]).toEqual(createdTopic);
    });

    it('should create a new topic with agentId', async () => {
      // 创建 agent
      await serverDB.insert(agents).values({ id: 'agent-for-topic', userId, title: 'Test Agent' });

      const topicData = {
        title: 'Topic with Agent',
        favorite: false,
        sessionId,
        agentId: 'agent-for-topic',
      } satisfies CreateTopicParams;

      const topicId = 'topic-with-agent';

      // 调用 create 方法
      const createdTopic = await topicModel.create(topicData, topicId);

      // 断言返回的 topic 数据正确
      expect(createdTopic.id).toBe(topicId);
      expect(createdTopic.title).toBe('Topic with Agent');
      expect(createdTopic.agentId).toBe('agent-for-topic');
      expect(createdTopic.sessionId).toBe(sessionId);

      // 断言 topic 已在数据库中创建且 agentId 正确
      const dbTopic = await serverDB.select().from(topics).where(eq(topics.id, topicId));
      expect(dbTopic).toHaveLength(1);
      expect(dbTopic[0].agentId).toBe('agent-for-topic');
    });

    it('should create a new topic with only agentId (no sessionId)', async () => {
      // 创建 agent
      await serverDB.insert(agents).values({ id: 'agent-only', userId, title: 'Agent Only' });

      const topicData = {
        title: 'Agent Only Topic',
        favorite: true,
        agentId: 'agent-only',
      } satisfies CreateTopicParams;

      const topicId = 'agent-only-topic';

      // 调用 create 方法
      const createdTopic = await topicModel.create(topicData, topicId);

      // 断言 agentId 已存储，sessionId 为 null
      expect(createdTopic.agentId).toBe('agent-only');
      expect(createdTopic.sessionId).toBeNull();
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

    it('should batch create topics with agentId', async () => {
      // 创建 agents
      await serverDB.insert(agents).values([
        { id: 'batch-agent-1', userId, title: 'Batch Agent 1' },
        { id: 'batch-agent-2', userId, title: 'Batch Agent 2' },
      ]);

      const topicParams = [
        {
          title: 'Topic with Agent 1',
          favorite: true,
          sessionId,
          agentId: 'batch-agent-1',
        },
        {
          title: 'Topic with Agent 2',
          favorite: false,
          agentId: 'batch-agent-2',
        },
      ];

      // 调用 batchCreate 方法
      const createdTopics = await topicModel.batchCreate(topicParams);

      // 断言 agentId 正确存储
      expect(createdTopics).toHaveLength(2);
      expect(createdTopics[0].agentId).toBe('batch-agent-1');
      expect(createdTopics[0].sessionId).toBe(sessionId);
      expect(createdTopics[1].agentId).toBe('batch-agent-2');
      expect(createdTopics[1].sessionId).toBeNull();

      // 验证数据库中的数据
      const dbTopics = await serverDB
        .select()
        .from(topics)
        .where(
          inArray(
            topics.id,
            createdTopics.map((t) => t.id),
          ),
        );
      expect(dbTopics).toHaveLength(2);
      expect(dbTopics.find((t) => t.id === createdTopics[0].id)?.agentId).toBe('batch-agent-1');
      expect(dbTopics.find((t) => t.id === createdTopics[1].id)?.agentId).toBe('batch-agent-2');
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

  describe('rank', () => {
    it('should return ranked topics based on message count', async () => {
      // 创建测试数据
      await serverDB.transaction(async (tx) => {
        await tx.insert(topics).values([
          { id: 'topic1', title: 'Topic 1', sessionId, userId },
          { id: 'topic2', title: 'Topic 2', sessionId, userId },
          { id: 'topic3', title: 'Topic 3', sessionId, userId },
        ]);

        // topic1 有 3 条消息
        await tx.insert(messages).values([
          { id: 'msg1', role: 'user', topicId: 'topic1', userId },
          { id: 'msg2', role: 'assistant', topicId: 'topic1', userId },
          { id: 'msg3', role: 'user', topicId: 'topic1', userId },
        ]);

        // topic2 有 2 条消息
        await tx.insert(messages).values([
          { id: 'msg4', role: 'user', topicId: 'topic2', userId },
          { id: 'msg5', role: 'assistant', topicId: 'topic2', userId },
        ]);

        // topic3 有 1 条消息
        await tx.insert(messages).values([{ id: 'msg6', role: 'user', topicId: 'topic3', userId }]);
      });

      // 调用 rank 方法
      const result = await topicModel.rank(2);

      // 断言返回结果符合预期
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'topic1',
        title: 'Topic 1',
        count: 3,
        sessionId,
      });
      expect(result[1]).toMatchObject({
        id: 'topic2',
        title: 'Topic 2',
        count: 2,
        sessionId,
      });
    });

    it('should return empty array if no topics exist', async () => {
      const result = await topicModel.rank();
      expect(result).toHaveLength(0);
    });

    it('should respect the limit parameter', async () => {
      // 创建测试数据
      await serverDB.transaction(async (tx) => {
        await tx.insert(topics).values([
          { id: 'topic1', title: 'Topic 1', sessionId, userId },
          { id: 'topic2', title: 'Topic 2', sessionId, userId },
        ]);

        await tx.insert(messages).values([
          { id: 'msg1', role: 'user', topicId: 'topic1', userId },
          { id: 'msg2', role: 'user', topicId: 'topic2', userId },
        ]);
      });

      // 使用限制为 1 调用 rank 方法
      const result = await topicModel.rank(1);

      // 断言只返回一个结果
      expect(result).toHaveLength(1);
    });
  });

  describe('count with date filters', () => {
    beforeEach(async () => {
      // 创建测试数据
      await serverDB.insert(topics).values([
        {
          id: 'topic1',
          userId,
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'topic2',
          userId,
          createdAt: new Date('2023-02-01'),
        },
        {
          id: 'topic3',
          userId,
          createdAt: new Date('2023-03-01'),
        },
      ]);
    });

    it('should count topics with start date filter', async () => {
      const result = await topicModel.count({
        startDate: '2023-02-01',
      });

      expect(result).toBe(2); // should count topics from Feb 1st onwards
    });

    it('should count topics with end date filter', async () => {
      const result = await topicModel.count({
        endDate: '2023-02-01',
      });

      expect(result).toBe(2); // should count topics up to Feb 1st
    });

    it('should count topics within date range', async () => {
      const result = await topicModel.count({
        range: ['2023-01-15', '2023-02-15'],
      });

      expect(result).toBe(1); // should only count topic2
    });

    it('should return 0 if no topics match date filters', async () => {
      const result = await topicModel.count({
        range: ['2024-01-01', '2024-12-31'],
      });

      expect(result).toBe(0);
    });

    it('should handle invalid date filters gracefully', async () => {
      const result = await topicModel.count({
        startDate: 'invalid-date',
      });

      expect(result).toBe(3); // should return all topics if date is invalid
    });
  });
});
