import { eq, not } from 'drizzle-orm/expressions';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { clientDB } from '@/database/client/db';
import { migrate } from '@/database/client/migrate';
import {
  NewSession,
  SessionItem,
  agents,
  agentsToSessions,
  sessionGroups,
  sessions,
  users,
} from '@/database/schemas';
import { LobeAgentConfig } from '@/types/agent';
import { LobeAgentSession, LobeSessionType, SessionGroups } from '@/types/session';

import { ClientService } from './client';

const userId = 'message-db';
const sessionService = new ClientService(userId);

const mockSessionId = 'mock-session-id';

// Mock data
beforeEach(async () => {
  await migrate();

  // 在每个测试用例之前，清空表
  await clientDB.transaction(async (trx) => {
    await trx.insert(users).values([{ id: userId }, { id: '456' }]);
    await trx.insert(sessions).values([{ id: mockSessionId, userId: userId }]);
    await trx.insert(sessionGroups).values([
      { id: 'group-1', name: 'group-A', sort: 2, userId },
      { id: 'group-2', name: 'group-B', sort: 1, userId },
      { id: 'group-4', name: 'group-C', sort: 1, userId: '456' },
    ]);
  });
});

afterEach(async () => {
  // 在每个测试用例之后，清空表
  await clientDB.delete(users);
});

describe('SessionService', () => {
  const mockSession = {
    id: mockSessionId,
    type: 'agent',
    meta: { title: 'Mock Session' },
  } as LobeAgentSession;

  describe('createSession', () => {
    it('should create a new session and return its id', async () => {
      // Setup
      const sessionType = LobeSessionType.Agent;
      const defaultValue = { meta: { title: 'New Session' } } as Partial<LobeAgentSession>;

      // Execute
      const sessionId = await sessionService.createSession(sessionType, defaultValue);

      // Assert
      expect(sessionId).toMatch(/^ssn_/);
    });
  });

  describe('removeSession', () => {
    it('should remove a session by its id', async () => {
      // Execute
      await sessionService.removeSession(mockSessionId);

      // Assert

      const result = await clientDB.query.sessions.findFirst({
        where: eq(sessions.id, mockSessionId),
      });
      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('removeAllSessions', () => {
    it('should clear all sessions from the table', async () => {
      // Setup
      await clientDB
        .insert(sessions)
        .values([{ userId: userId }, { userId: userId }, { userId: userId }]);

      // Execute
      await sessionService.removeAllSessions();

      // Assert
      const result = await clientDB.query.sessions.findMany({
        where: eq(sessionGroups.userId, userId),
      });

      expect(result.length).toBe(0);
    });
  });

  describe('updateSession', () => {
    it.skip('should update the group of a session', async () => {
      // Setup
      const groupId = 'new-group';

      // Execute
      await sessionService.updateSession(mockSessionId, { group: groupId });

      // Assert
      const result = await clientDB.query.sessions.findFirst({
        where: eq(sessions.id, mockSessionId),
      });
      expect(result).toMatchObject({ group: groupId });
    });

    it.skip('should update the meta of a session', async () => {
      // Setup
      const newMeta = { description: 'Updated description' };

      // Execute
      await sessionService.updateSession(mockSessionId, { meta: newMeta });

      // Assert
      const result = await clientDB.query.sessions.findFirst({
        where: eq(sessions.id, mockSessionId),
      });

      expect(result).toEqual({ ...mockSession, meta: newMeta });
    });

    it('should update the pinned status of a session', async () => {
      // Setup
      const pinned = true;

      // Execute
      await sessionService.updateSession(mockSessionId, { pinned });

      // Assert
      const result = await clientDB.query.sessions.findFirst({
        where: eq(sessions.id, mockSessionId),
      });

      expect(result!.pinned).toBeTruthy();
    });
  });

  describe.skip('updateSessionConfig', () => {
    it('should update the config of a session', async () => {
      // Setup
      const newConfig = { model: 'abc' } as LobeAgentConfig;

      // Execute
      await sessionService.updateSessionConfig(mockSessionId, newConfig);

      // Assert
      const result = await sessionService.getSessionConfig(mockSessionId);
      expect(result).toEqual({ ...mockSession, config: newConfig });
    });
  });

  describe('countSessions', () => {
    it('should return false if no sessions exist', async () => {
      await clientDB.delete(sessions);

      // Execute
      const result = await sessionService.countSessions();

      // Assert
      expect(result).toBe(0);
    });

    it('should return true if sessions exist', async () => {
      // Setup
      await clientDB.delete(sessions);
      await clientDB.insert(sessions).values([{ userId }]);

      // Execute
      const result = await sessionService.countSessions();

      // Assert
      expect(result).toBe(1);
    });
  });

  describe('searchSessions', () => {
    it('should return sessions that match the keyword', async () => {
      // Setup
      await clientDB.insert(agents).values({ userId, id: 'agent-1', title: 'Session Name' });
      await clientDB
        .insert(agentsToSessions)
        .values({ agentId: 'agent-1', sessionId: mockSessionId });

      // Execute
      const keyword = 'Name';
      const result = await sessionService.searchSessions(keyword);

      // Assert
      // TODO: 后续需要把这个搜索的标题和描述都加上，现在这个 client 搜索会有问题
      expect(result).toMatchObject([{ id: mockSessionId }]);
    });
  });

  describe.skip('cloneSession', () => {
    it('should duplicate a session and return its id', async () => {
      // Setup
      const newTitle = 'Duplicated Session';
      const session: NewSession = {
        id: 'duplicated-session-id',
        title: '123',
        userId,
      };
      await clientDB.insert(sessions).values([session]);
      await clientDB.insert(agents).values({ userId, id: 'agent-1' });
      await clientDB
        .insert(agentsToSessions)
        .values({ agentId: 'agent-1', sessionId: 'duplicated-session-id' });

      // Execute
      const duplicatedSessionId = await sessionService.cloneSession(mockSessionId, newTitle);

      // Assert

      const result = await clientDB.query.sessions.findFirst({
        where: eq(sessions.id, duplicatedSessionId!),
      });
      expect(result).toEqual({});
    });
  });

  describe('getGroupedSessions', () => {
    it('should retrieve sessions with their group', async () => {
      // Execute
      const sessionsWithGroup = await sessionService.getGroupedSessions();

      expect(sessionsWithGroup).toMatchObject({
        sessionGroups: [
          { id: 'group-2', name: 'group-B', sort: 1 },
          { id: 'group-1', name: 'group-A', sort: 2 },
        ],
        sessions: [{ id: 'mock-session-id', type: 'agent' }],
      });
    });
  });

  // SessionGroup related tests
  describe('createSessionGroup', () => {
    it('should create a new session group and return its id', async () => {
      // Setup
      const groupName = 'New Group';
      const sort = 1;

      // Execute
      const groupId = await sessionService.createSessionGroup(groupName, sort);

      // Assert
      expect(groupId).toMatch(/^sg_/);

      const result = await clientDB.query.sessionGroups.findFirst({
        where: eq(sessionGroups.id, groupId),
      });

      expect(result).toMatchObject({ id: groupId, name: groupName, sort });
    });
  });

  describe('removeSessionGroup', () => {
    it('should remove a session group by its id', async () => {
      const groupId = 'group-1';
      // Execute
      await sessionService.removeSessionGroup(groupId);

      const result = await clientDB.query.sessionGroups.findFirst({
        where: eq(sessionGroups.id, groupId),
      });
      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('clearSessionGroups', () => {
    it('should clear all session groups', async () => {
      // Execute
      await sessionService.removeSessionGroups();

      // Assert
      const result = await clientDB.query.sessionGroups.findMany({
        where: eq(sessionGroups.userId, userId),
      });

      expect(result.length).toBe(0);

      const result2 = await clientDB.query.sessionGroups.findMany({
        where: not(eq(sessionGroups.userId, userId)),
      });

      expect(result2.length).toBeGreaterThan(0);
    });
  });

  describe('getSessionGroups', () => {
    it('should retrieve all session groups', async () => {
      // Execute
      const result = await sessionService.getSessionGroups();

      // Assert
      const groups = [
        { id: 'group-2', name: 'group-B', sort: 1 },
        { id: 'group-1', name: 'group-A', sort: 2 },
      ];
      expect(result).toMatchObject(groups);
    });
  });

  describe('updateSessionGroup', () => {
    it('should update a session group', async () => {
      // Setup
      const groupId = 'group-1';
      const data = { name: 'Updated Group', sort: 2 };

      // Execute
      await sessionService.updateSessionGroup(groupId, data);

      // Assert
      const result = await clientDB.query.sessionGroups.findFirst({
        where: eq(sessionGroups.id, groupId),
      });
      expect(result).toMatchObject({ id: groupId, ...data });
    });
  });

  describe('updateSessionGroupOrder', () => {
    it('should update the order of session groups', async () => {
      // Setup
      const sortMap = [
        { id: 'group-1', sort: 2 },
        { id: 'group-2', sort: 1 },
      ];

      // Execute
      await sessionService.updateSessionGroupOrder(sortMap);

      // Assert
      const data = await clientDB.query.sessionGroups.findMany({
        where: eq(sessionGroups.userId, userId),
      });
      expect(data).toMatchObject([
        { id: 'group-1', sort: 2 },
        { id: 'group-2', sort: 1 },
      ]);
    });
  });
});
