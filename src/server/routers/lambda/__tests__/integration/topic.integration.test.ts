// @vitest-environment node
import { LobeChatDatabase } from '@lobechat/database';
import { sessions, topics } from '@lobechat/database/schemas';
import { getTestDB } from '@lobechat/database/test-utils';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { topicRouter } from '../../topic';
import { cleanupTestUser, createTestContext, createTestUser } from './setup';

// We need to mock getServerDB to return our test database instance
let testDB: LobeChatDatabase;
vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(() => testDB),
}));

/**
 * Topic Router 集成测试
 *
 * 测试目标：
 * 1. 验证完整的 tRPC 调用链路（Router → Model → Database）
 * 2. 确保 agentId → sessionId 解析正常工作
 * 3. 验证数据库约束和关联关系
 */
describe('Topic Router Integration Tests', () => {
  let serverDB: LobeChatDatabase;
  let userId: string;
  let testSessionId: string;
  let testAgentId: string;

  beforeEach(async () => {
    serverDB = await getTestDB();
    testDB = serverDB;
    userId = await createTestUser(serverDB);

    // 创建测试 agent
    const { agents } = await import('@/database/schemas');
    const [agent] = await serverDB
      .insert(agents)
      .values({ userId, title: 'Test Agent' })
      .returning();
    testAgentId = agent.id;

    // 创建测试 session
    const [session] = await serverDB.insert(sessions).values({ userId, type: 'agent' }).returning();
    testSessionId = session.id;

    // 创建 agent 到 session 的映射关系
    const { agentsToSessions } = await import('@/database/schemas');
    await serverDB.insert(agentsToSessions).values({
      agentId: testAgentId,
      sessionId: testSessionId,
      userId,
    });
  });

  afterEach(async () => {
    await cleanupTestUser(serverDB, userId);
  });

  describe('createTopic', () => {
    it('should create topic with sessionId', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      const topicId = await caller.createTopic({
        title: 'Test Topic',
        sessionId: testSessionId,
      });

      const [createdTopic] = await serverDB.select().from(topics).where(eq(topics.id, topicId));

      expect(createdTopic).toBeDefined();
      expect(createdTopic.title).toBe('Test Topic');
      expect(createdTopic.sessionId).toBe(testSessionId);
    });

    it('should create topic using agentId instead of sessionId', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      const topicId = await caller.createTopic({
        title: 'Topic with agentId',
        agentId: testAgentId,
      });

      const [createdTopic] = await serverDB.select().from(topics).where(eq(topics.id, topicId));

      expect(createdTopic).toBeDefined();
      expect(createdTopic.title).toBe('Topic with agentId');
      // 验证 agentId 被正确解析为 sessionId
      expect(createdTopic.sessionId).toBe(testSessionId);
    });

    it('should prefer agentId over sessionId when both provided', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 创建另一个 session
      const [anotherSession] = await serverDB
        .insert(sessions)
        .values({
          userId,
          type: 'agent',
        })
        .returning();

      const topicId = await caller.createTopic({
        title: 'Topic with both ids',
        agentId: testAgentId,
        sessionId: anotherSession.id, // 这个会被 agentId 覆盖
      });

      const [createdTopic] = await serverDB.select().from(topics).where(eq(topics.id, topicId));

      // 应该使用 agentId 解析出的 sessionId
      expect(createdTopic.sessionId).toBe(testSessionId);
    });

    it('should fall back to sessionId when agentId not found', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      const topicId = await caller.createTopic({
        title: 'Topic with non-existent agentId',
        agentId: 'non-existent-agent',
        sessionId: testSessionId,
      });

      const [createdTopic] = await serverDB.select().from(topics).where(eq(topics.id, topicId));

      expect(createdTopic.sessionId).toBe(testSessionId);
    });
  });

  describe('batchCreateTopics', () => {
    it('should batch create topics with agentId', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      const result = await caller.batchCreateTopics([
        { title: 'Batch Topic 1', agentId: testAgentId },
        { title: 'Batch Topic 2', agentId: testAgentId },
      ]);

      expect(result.success).toBe(true);
      expect(result.added).toBe(2);

      const createdTopics = await serverDB
        .select()
        .from(topics)
        .where(eq(topics.sessionId, testSessionId));

      expect(createdTopics).toHaveLength(2);
      expect(createdTopics.map((t) => t.title)).toContain('Batch Topic 1');
      expect(createdTopics.map((t) => t.title)).toContain('Batch Topic 2');
    });

    it('should batch create topics with mixed agentId and sessionId', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 创建另一个 session
      const [anotherSession] = await serverDB
        .insert(sessions)
        .values({
          userId,
          type: 'agent',
        })
        .returning();

      const result = await caller.batchCreateTopics([
        { title: 'Topic with agentId', agentId: testAgentId },
        { title: 'Topic with sessionId', sessionId: anotherSession.id },
      ]);

      expect(result.success).toBe(true);
      expect(result.added).toBe(2);

      // 验证每个 topic 关联到正确的 session
      const allTopics = await serverDB.select().from(topics).where(eq(topics.userId, userId));

      const topicWithAgent = allTopics.find((t) => t.title === 'Topic with agentId');
      const topicWithSession = allTopics.find((t) => t.title === 'Topic with sessionId');

      expect(topicWithAgent?.sessionId).toBe(testSessionId);
      expect(topicWithSession?.sessionId).toBe(anotherSession.id);
    });
  });

  describe('getTopics', () => {
    it('should get topics by agentId', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 创建测试 topic
      await caller.createTopic({
        title: 'Topic 1',
        sessionId: testSessionId,
      });

      await caller.createTopic({
        title: 'Topic 2',
        sessionId: testSessionId,
      });

      // 使用 agentId 查询
      const result = await caller.getTopics({
        agentId: testAgentId,
      });

      // result 包含 items 和 total
      expect(result.items).toHaveLength(2);
      expect(result.items.map((t) => t.title)).toContain('Topic 1');
      expect(result.items.map((t) => t.title)).toContain('Topic 2');
      expect(result.total).toBe(2);
    });

    it('should resolve sessionId to agentId when only sessionId provided', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 创建测试 topic
      await caller.createTopic({
        title: 'Topic for reverse lookup',
        sessionId: testSessionId,
      });

      // 使用 sessionId 查询（需要反向查找 agentId）
      const result = await caller.getTopics({
        sessionId: testSessionId,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Topic for reverse lookup');
      expect(result.total).toBe(1);
    });
  });

  describe('batchDeleteBySessionId', () => {
    it('should batch delete topics using agentId', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 创建测试 topics
      await caller.createTopic({
        title: 'Topic to delete 1',
        sessionId: testSessionId,
      });

      await caller.createTopic({
        title: 'Topic to delete 2',
        sessionId: testSessionId,
      });

      // 使用 agentId 批量删除
      await caller.batchDeleteBySessionId({
        agentId: testAgentId,
      });

      const remainingTopics = await serverDB
        .select()
        .from(topics)
        .where(eq(topics.sessionId, testSessionId));

      expect(remainingTopics).toHaveLength(0);
    });

    it('should batch delete topics using sessionId', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 创建测试 topics
      await caller.createTopic({
        title: 'Topic to delete',
        sessionId: testSessionId,
      });

      // 使用 sessionId 批量删除
      await caller.batchDeleteBySessionId({
        id: testSessionId,
      });

      const remainingTopics = await serverDB
        .select()
        .from(topics)
        .where(eq(topics.sessionId, testSessionId));

      expect(remainingTopics).toHaveLength(0);
    });
  });

  describe('searchTopics', () => {
    it('should search topics using agentId', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 创建测试 topics
      await caller.createTopic({
        title: 'TypeScript Discussion',
        sessionId: testSessionId,
      });

      await caller.createTopic({
        title: 'JavaScript Basics',
        sessionId: testSessionId,
      });

      // 使用 agentId 搜索
      const result = await caller.searchTopics({
        keywords: 'TypeScript',
        agentId: testAgentId,
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].title).toContain('TypeScript');
    });
  });

  describe('updateTopic', () => {
    it('should update topic with agentId in value', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 创建测试 topic
      const topicId = await caller.createTopic({
        title: 'Original Title',
        sessionId: testSessionId,
      });

      // 创建另一个 agent 和 session
      const { agents, agentsToSessions } = await import('@/database/schemas');
      const [newAgent] = await serverDB
        .insert(agents)
        .values({
          userId,
          title: 'New Agent',
        })
        .returning();

      const [newSession] = await serverDB
        .insert(sessions)
        .values({
          userId,
          type: 'agent',
        })
        .returning();

      await serverDB.insert(agentsToSessions).values({
        agentId: newAgent.id,
        sessionId: newSession.id,
        userId,
      });

      // 更新 topic，使用 agentId 指定新的关联
      await caller.updateTopic({
        id: topicId,
        value: {
          title: 'Updated Title',
          agentId: newAgent.id,
        },
      });

      const [updatedTopic] = await serverDB.select().from(topics).where(eq(topics.id, topicId));

      expect(updatedTopic.title).toBe('Updated Title');
      expect(updatedTopic.sessionId).toBe(newSession.id);
    });
  });

  describe('other topic operations', () => {
    it('should clone topic', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 创建原始 topic
      const originalId = await caller.createTopic({
        title: 'Original Topic',
        sessionId: testSessionId,
      });

      // 克隆 topic
      const clonedId = await caller.cloneTopic({
        id: originalId,
        newTitle: 'Cloned Topic',
      });

      const [clonedTopic] = await serverDB.select().from(topics).where(eq(topics.id, clonedId));

      expect(clonedTopic).toBeDefined();
      expect(clonedTopic.title).toBe('Cloned Topic');
      expect(clonedTopic.sessionId).toBe(testSessionId);
    });

    it('should batch delete topics by ids', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      const id1 = await caller.createTopic({
        title: 'Topic 1',
        sessionId: testSessionId,
      });

      const id2 = await caller.createTopic({
        title: 'Topic 2',
        sessionId: testSessionId,
      });

      await caller.createTopic({
        title: 'Topic 3',
        sessionId: testSessionId,
      });

      // 删除前两个
      await caller.batchDelete({ ids: [id1, id2] });

      const remainingTopics = await serverDB
        .select()
        .from(topics)
        .where(eq(topics.sessionId, testSessionId));

      expect(remainingTopics).toHaveLength(1);
      expect(remainingTopics[0].title).toBe('Topic 3');
    });

    it('should remove single topic', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      const topicId = await caller.createTopic({
        title: 'Topic to remove',
        sessionId: testSessionId,
      });

      await caller.removeTopic({ id: topicId });

      const deletedTopic = await serverDB.select().from(topics).where(eq(topics.id, topicId));

      expect(deletedTopic).toHaveLength(0);
    });

    it('should count topics', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      await caller.createTopic({
        title: 'Topic 1',
        sessionId: testSessionId,
      });

      await caller.createTopic({
        title: 'Topic 2',
        sessionId: testSessionId,
      });

      const count = await caller.countTopics();

      expect(count).toBe(2);
    });

    it('should get all topics', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      await caller.createTopic({
        title: 'Topic 1',
        sessionId: testSessionId,
      });

      await caller.createTopic({
        title: 'Topic 2',
        sessionId: testSessionId,
      });

      const allTopics = await caller.getAllTopics();

      expect(allTopics).toHaveLength(2);
    });

    it('should check if user has topics', async () => {
      const caller = topicRouter.createCaller(createTestContext(userId));

      // 初始应该没有 topics
      const hasNoTopics = await caller.hasTopics();
      expect(hasNoTopics).toBe(true); // 注意：hasTopics 返回 count === 0

      // 创建 topic 后
      await caller.createTopic({
        title: 'First Topic',
        sessionId: testSessionId,
      });

      const hasTopicsAfter = await caller.hasTopics();
      expect(hasTopicsAfter).toBe(false); // count !== 0
    });
  });
});
