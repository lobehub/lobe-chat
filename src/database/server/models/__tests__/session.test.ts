import { eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTestDBInstance } from '@/database/server/core/dbForTest';

import {
  NewSession,
  SessionItem,
  agents,
  agentsToSessions,
  messages,
  sessionGroups,
  sessions,
  topics,
  users,
} from '../../schemas/lobechat';
import { idGenerator } from '../../utils/idGenerator';
import { SessionModel } from '../session';

let serverDB = await getTestDBInstance();

vi.mock('@/database/server/core/db', async () => ({
  get serverDB() {
    return serverDB;
  },
}));

const userId = 'session-user';
const sessionModel = new SessionModel(userId);

beforeEach(async () => {
  await serverDB.delete(users);
  // 并创建初始用户
  await serverDB.insert(users).values({ id: userId });
});

afterEach(async () => {
  // 在每个测试用例之后, 清空用户表 (应该会自动级联删除所有数据)
  await serverDB.delete(users);
});

describe('SessionModel', () => {
  describe('query', () => {
    it('should query sessions by user ID', async () => {
      // 创建一些测试数据
      await serverDB.insert(users).values([{ id: '456' }]);

      await serverDB.insert(sessions).values([
        { id: '1', userId, updatedAt: new Date('2023-01-01') },
        { id: '2', userId, updatedAt: new Date('2023-02-01') },
        { id: '3', userId: '456', updatedAt: new Date('2023-03-01') },
      ]);

      // 调用 query 方法
      const result = await sessionModel.query();

      // 断言结果
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });

    it('should query sessions with pagination', async () => {
      // create test data
      await serverDB.insert(sessions).values([
        { id: '1', userId, updatedAt: new Date('2023-01-01') },
        { id: '2', userId, updatedAt: new Date('2023-02-01') },
        { id: '3', userId, updatedAt: new Date('2023-03-01') },
      ]);

      // should return 2 sessions
      const result1 = await sessionModel.query({ current: 0, pageSize: 2 });
      expect(result1).toHaveLength(2);

      // should return only 1 session and it's the 2nd one
      const result2 = await sessionModel.query({ current: 1, pageSize: 1 });
      expect(result2).toHaveLength(1);
      expect(result2[0].id).toBe('2');
    });
  });

  describe('queryWithGroups', () => {
    it('should return sessions grouped by group', async () => {
      // 创建测试数据
      await serverDB.transaction(async (trx) => {
        await trx.insert(users).values([{ id: '456' }]);
        await trx.insert(sessionGroups).values([
          { userId, name: 'Group 1', id: 'group1' },
          { userId, name: 'Group 2', id: 'group2' },
        ]);
        await trx.insert(sessions).values([
          { id: '1', userId, groupId: 'group1' },
          { id: '2', userId, groupId: 'group1' },
          { id: '23', userId, groupId: 'group1', pinned: true },
          { id: '3', userId, groupId: 'group2' },
          { id: '4', userId },
          { id: '5', userId, pinned: true },
          { id: '7', userId: '456' },
        ]);
      });

      // 调用 queryWithGroups 方法
      const result = await sessionModel.queryWithGroups();

      // 断言结果
      expect(result.sessions).toHaveLength(6);
      expect(result.sessionGroups).toHaveLength(2);
      expect(result.sessionGroups[0].id).toBe('group1');
      expect(result.sessionGroups[0].name).toBe('Group 1');

      expect(result.sessionGroups[1].id).toBe('group2');
    });

    it('should return empty groups if no sessions', async () => {
      // 调用 queryWithGroups 方法
      const result = await sessionModel.queryWithGroups();

      // 断言结果
      expect(result.sessions).toHaveLength(0);
      expect(result.sessionGroups).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should find session by ID', async () => {
      await serverDB.insert(sessions).values([
        { id: '1', userId },
        { id: '2', userId },
      ]);

      const result = await sessionModel.findByIdOrSlug('1');
      expect(result?.id).toBe('1');
    });

    it('should return undefined if session not found', async () => {
      await serverDB.insert(sessions).values([{ id: '1', userId }]);

      const result = await sessionModel.findByIdOrSlug('2');
      expect(result).toBeUndefined();
    });

    it('should find with agents', async () => {
      await serverDB.transaction(async (trx) => {
        await trx.insert(sessions).values([
          { id: '1', userId },
          { id: '2', userId },
        ]);
        await trx.insert(agents).values([
          { id: 'a1', title: 'Agent1', userId },
          { id: 'a2', title: 'Agent2', userId },
        ]);

        // @ts-ignore
        await trx.insert(agentsToSessions).values([
          { sessionId: '1', agentId: 'a1', userId },
          { sessionId: '2', agentId: 'a2', userId },
        ]);
      });

      const result = await sessionModel.findByIdOrSlug('2');

      expect(result?.agent).toBeDefined();
      expect(result?.agent.id).toEqual('a2');
    });
  });

  // describe('getAgentConfigById', () => {
  //   it('should return agent config by id', async () => {
  //     await serverDB.transaction(async (trx) => {
  //       await trx.insert(agents).values([
  //         { id: '1', userId, model: 'gpt-3.5-turbo' },
  //         { id: '2', userId, model: 'gpt-3.5' },
  //       ]);
  //
  //       // @ts-ignore
  //       await trx.insert(plugins).values([
  //         { id: 1, userId, identifier: 'abc', title: 'A1', locale: 'en-US', manifest: {} },
  //         { id: 2, userId, identifier: 'b2', title: 'A2', locale: 'en-US', manifest: {} },
  //       ]);
  //
  //       await trx.insert(agentsPlugins).values([
  //         { agentId: '1', pluginId: 1 },
  //         { agentId: '2', pluginId: 2 },
  //         { agentId: '1', pluginId: 2 },
  //       ]);
  //     });
  //
  //     const result = await sessionModel.getAgentConfigById('1');
  //
  //     expect(result?.id).toBe('1');
  //     expect(result?.plugins).toBe(['abc', 'b2']);
  //     expect(result?.model).toEqual('gpt-3.5-turbo');
  //     expect(result?.chatConfig).toBeDefined();
  //   });
  // });
  describe('count', () => {
    it('should return the count of sessions for the user', async () => {
      // 创建测试数据
      await serverDB.insert(users).values([{ id: '456' }]);
      await serverDB.insert(sessions).values([
        { id: '1', userId },
        { id: '2', userId },
        { id: '3', userId: '456' },
      ]);

      // 调用 count 方法
      const result = await sessionModel.count();

      // 断言结果
      expect(result).toBe(2);
    });

    it('should return 0 if no sessions exist for the user', async () => {
      // 创建测试数据
      await serverDB.insert(users).values([{ id: '456' }]);
      await serverDB.insert(sessions).values([{ id: '3', userId: '456' }]);

      // 调用 count 方法
      const result = await sessionModel.count();

      // 断言结果
      expect(result).toBe(0);
    });
  });

  describe('queryByKeyword', () => {
    it('should return an empty array if keyword is empty', async () => {
      const result = await sessionModel.queryByKeyword('');
      expect(result).toEqual([]);
    });

    it('should return sessions with matching title', async () => {
      await serverDB.insert(sessions).values([
        { id: '1', userId, title: 'Hello World', description: 'Some description' },
        { id: '2', userId, title: 'Another Session', description: 'Another description' },
      ]);

      const result = await sessionModel.queryByKeyword('hello');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return sessions with matching description', async () => {
      await serverDB.insert(sessions).values([
        { id: '1', userId, title: 'Session 1', description: 'Description with keyword' },
        { id: '2', userId, title: 'Session 2', description: 'Another description' },
      ]);

      const result = await sessionModel.queryByKeyword('keyword');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return sessions with matching title or description', async () => {
      await serverDB.insert(sessions).values([
        { id: '1', userId, title: 'Title with keyword', description: 'Some description' },
        { id: '2', userId, title: 'Another Session', description: 'Description with keyword' },
        { id: '3', userId, title: 'Third Session', description: 'Third description' },
      ]);

      const result = await sessionModel.queryByKeyword('keyword');
      expect(result).toHaveLength(2);
      expect(result.map((s) => s.id)).toEqual(['1', '2']);
    });
  });

  describe('create', () => {
    it('should create a new session', async () => {
      // 调用 create 方法
      const result = await sessionModel.create({
        type: 'agent',
        session: {
          title: 'New Session',
        },
        config: { model: 'gpt-3.5-turbo' },
      });

      // 断言结果
      const sessionId = result.id;
      expect(sessionId).toBeDefined();
      expect(sessionId.startsWith('ssn_')).toBeTruthy();
      expect(result.userId).toBe(userId);
      expect(result.type).toBe('agent');

      const session = await sessionModel.findByIdOrSlug(sessionId);
      expect(session).toBeDefined();
      expect(session?.title).toEqual('New Session');
      expect(session?.pinned).toBe(false);
      expect(session?.agent?.model).toEqual('gpt-3.5-turbo');
    });

    it('should create a new session with custom ID', async () => {
      // 调用 create 方法,传入自定义 ID
      const customId = 'custom-id';
      const result = await sessionModel.create({
        type: 'agent',
        config: { model: 'gpt-3.5-turbo' },
        session: { title: 'New Session' },
        id: customId,
      });

      // 断言结果
      expect(result.id).toBe(customId);
    });
  });

  describe.skip('batchCreate', () => {
    it('should batch create sessions', async () => {
      // 调用 batchCreate 方法
      const sessions: NewSession[] = [
        {
          id: '1',
          userId,
          type: 'agent',
          // config: { model: 'gpt-3.5-turbo' },
          title: 'Session 1',
        },
        {
          id: '2',
          userId,
          type: 'agent',
          // config: { model: 'gpt-4' },
          title: 'Session 2',
        },
      ];
      const result = await sessionModel.batchCreate(sessions);

      // 断言结果
      expect(result.rowCount).toEqual(2);
    });

    it.skip('should set group to default if group does not exist', async () => {
      // 调用 batchCreate 方法,传入不存在的 group
      const sessions: NewSession[] = [
        {
          id: '1',
          userId,
          type: 'agent',
          // config: { model: 'gpt-3.5-turbo' },
          title: 'Session 1',
          groupId: 'non-existent-group',
        },
      ];
      const result = await sessionModel.batchCreate(sessions);

      // 断言结果
      // expect(result[0].group).toBe('default');
    });
  });

  describe('duplicate', () => {
    it.skip('should duplicate a session', async () => {
      // 创建一个用户和一个 session
      await serverDB.transaction(async (trx) => {
        await trx
          .insert(sessions)
          .values({ id: '1', userId, type: 'agent', title: 'Original Session', pinned: true });
        await trx.insert(agents).values({ id: 'agent-1', userId, model: 'gpt-3.5-turbo' });
        await trx.insert(agentsToSessions).values({ agentId: 'agent-1', sessionId: '1' });
      });

      // 调用 duplicate 方法
      const result = (await sessionModel.duplicate('1', 'Duplicated Session')) as SessionItem;

      // 断言结果
      expect(result.id).not.toBe('1');
      expect(result.userId).toBe(userId);
      expect(result.type).toBe('agent');

      const session = await sessionModel.findByIdOrSlug(result.id);

      expect(session).toBeDefined();
      expect(session?.title).toEqual('Duplicated Session');
      expect(session?.pinned).toBe(true);
      expect(session?.agent?.model).toEqual('gpt-3.5-turbo');
    });

    it('should return undefined if session does not exist', async () => {
      // 调用 duplicate 方法,传入不存在的 session ID
      const result = await sessionModel.duplicate('non-existent-id');

      // 断言结果
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a session', async () => {
      // 创建一个测试 session
      const sessionId = '123';
      await serverDB.insert(sessions).values({ userId, id: sessionId, title: 'Test Session' });

      // 调用 update 方法更新 session
      const updatedSessions = await sessionModel.update(sessionId, {
        title: 'Updated Test Session',
        description: 'This is an updated test session',
      });

      // 断言更新后的结果
      expect(updatedSessions).toHaveLength(1);
      expect(updatedSessions[0].title).toBe('Updated Test Session');
      expect(updatedSessions[0].description).toBe('This is an updated test session');
    });

    it('should not update a session if user ID does not match', async () => {
      // 创建一个测试 session,但使用不同的 user ID
      await serverDB.insert(users).values([{ id: '777' }]);

      const sessionId = '123';

      await serverDB
        .insert(sessions)
        .values({ userId: '777', id: sessionId, title: 'Test Session' });

      // 尝试更新这个 session,应该不会有任何更新
      const updatedSessions = await sessionModel.update(sessionId, {
        title: 'Updated Test Session',
      });

      expect(updatedSessions).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should handle deleting a session with no associated messages or topics', async () => {
      // 创建测试数据
      await serverDB.insert(sessions).values({ id: '1', userId });

      // 调用 delete 方法
      await sessionModel.delete('1');

      // 断言删除结果
      const result = await serverDB.select({ id: sessions.id }).from(sessions);

      expect(result).toHaveLength(0);
    });

    it('should handle concurrent deletions gracefully', async () => {
      // 创建测试数据
      await serverDB.insert(sessions).values({ id: '1', userId });

      // 并发调用 delete 方法
      await Promise.all([sessionModel.delete('1'), sessionModel.delete('1')]);

      // 断言删除结果
      const result = await serverDB.select({ id: sessions.id }).from(sessions);

      expect(result).toHaveLength(0);
    });

    it('should delete a session and its associated topics and messages', async () => {
      // Create a session
      const sessionId = '1';
      await serverDB.insert(sessions).values({ id: sessionId, userId });

      // Create some topics and messages associated with the session
      await serverDB.insert(topics).values([
        { id: '1', sessionId, userId },
        { id: '2', sessionId, userId },
      ]);
      await serverDB.insert(messages).values([
        { id: '1', sessionId, userId, role: 'user' },
        { id: '2', sessionId, userId, role: 'assistant' },
      ]);

      // Delete the session
      await sessionModel.delete(sessionId);

      // Check that the session, topics, and messages are deleted
      expect(await serverDB.select().from(sessions).where(eq(sessions.id, sessionId))).toHaveLength(
        0,
      );
      expect(
        await serverDB.select().from(topics).where(eq(topics.sessionId, sessionId)),
      ).toHaveLength(0);
      expect(
        await serverDB.select().from(messages).where(eq(messages.sessionId, sessionId)),
      ).toHaveLength(0);
    });

    it('should not delete sessions belonging to other users', async () => {
      // Create two users
      const anotherUserId = idGenerator('user');
      await serverDB.insert(users).values({ id: anotherUserId });

      // Create a session for each user
      await serverDB.insert(sessions).values([
        { id: '1', userId },
        { id: '2', userId: anotherUserId },
      ]);

      // Delete the session belonging to the current user
      await sessionModel.delete('1');

      // Check that only the session belonging to the current user is deleted
      expect(await serverDB.select().from(sessions).where(eq(sessions.id, '1'))).toHaveLength(0);
      expect(await serverDB.select().from(sessions).where(eq(sessions.id, '2'))).toHaveLength(1);
    });
  });

  describe('batchDelete', () => {
    it('should handle deleting sessions with no associated messages or topics', async () => {
      // 创建测试数据
      await serverDB.insert(sessions).values([
        { id: '1', userId },
        { id: '2', userId },
      ]);

      // 调用 batchDelete 方法
      await sessionModel.batchDelete(['1', '2']);

      // 断言删除结果
      const result = await serverDB.select({ id: sessions.id }).from(sessions);

      expect(result).toHaveLength(0);
    });

    it('should handle concurrent batch deletions gracefully', async () => {
      // 创建测试数据
      await serverDB.insert(sessions).values([
        { id: '1', userId },
        { id: '2', userId },
      ]);

      // 并发调用 batchDelete 方法
      await Promise.all([
        sessionModel.batchDelete(['1', '2']),
        sessionModel.batchDelete(['1', '2']),
      ]);

      // 断言删除结果
      const result = await serverDB.select({ id: sessions.id }).from(sessions);

      expect(result).toHaveLength(0);
    });

    it('should delete multiple sessions and their associated topics and messages', async () => {
      // Create some sessions
      const sessionIds = ['1', '2', '3'];
      await serverDB.insert(sessions).values(sessionIds.map((id) => ({ id, userId })));

      // Create some topics and messages associated with the sessions
      await serverDB.insert(topics).values([
        { id: '1', sessionId: '1', userId },
        { id: '2', sessionId: '2', userId },
        { id: '3', sessionId: '3', userId },
      ]);
      await serverDB.insert(messages).values([
        { id: '1', sessionId: '1', userId, role: 'user' },
        { id: '2', sessionId: '2', userId, role: 'assistant' },
        { id: '3', sessionId: '3', userId, role: 'user' },
      ]);

      // Delete the sessions
      await sessionModel.batchDelete(sessionIds);

      // Check that the sessions, topics, and messages are deleted
      expect(
        await serverDB.select().from(sessions).where(inArray(sessions.id, sessionIds)),
      ).toHaveLength(0);
      expect(
        await serverDB.select().from(topics).where(inArray(topics.sessionId, sessionIds)),
      ).toHaveLength(0);
      expect(
        await serverDB.select().from(messages).where(inArray(messages.sessionId, sessionIds)),
      ).toHaveLength(0);
    });

    it('should not delete sessions belonging to other users', async () => {
      // Create two users
      await serverDB.insert(users).values([{ id: '456' }]);

      // Create some sessions for each user
      await serverDB.insert(sessions).values([
        { id: '1', userId },
        { id: '2', userId },
        { id: '3', userId: '456' },
      ]);

      // Delete the sessions belonging to the current user
      await sessionModel.batchDelete(['1', '2']);

      // Check that only the sessions belonging to the current user are deleted
      expect(
        await serverDB
          .select()
          .from(sessions)
          .where(inArray(sessions.id, ['1', '2'])),
      ).toHaveLength(0);
      expect(await serverDB.select().from(sessions).where(eq(sessions.id, '3'))).toHaveLength(1);
    });
  });
});
