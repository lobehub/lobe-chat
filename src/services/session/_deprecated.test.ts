import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { SessionModel } from '@/database/_deprecated/models/session';
import { SessionGroupModel } from '@/database/_deprecated/models/sessionGroup';
import { UserModel } from '@/database/_deprecated/models/user';
import { LobeAgentConfig } from '@/types/agent';
import { LobeAgentSession, LobeSessionType, SessionGroups } from '@/types/session';

import { ClientService } from './_deprecated';

const sessionService = new ClientService();

vi.mock('@/database/_deprecated/models/session', () => {
  return {
    SessionModel: {
      create: vi.fn(),
      query: vi.fn(),
      delete: vi.fn(),
      clearTable: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      batchCreate: vi.fn(),
      findById: vi.fn(),
      isEmpty: vi.fn(),
      queryByKeyword: vi.fn(),
      updateConfig: vi.fn(),
      queryByGroupIds: vi.fn(),
      updatePinned: vi.fn(),
      duplicate: vi.fn(),
      queryWithGroups: vi.fn(),
    },
  };
});

vi.mock('@/database/_deprecated/models/sessionGroup', () => {
  return {
    SessionGroupModel: {
      create: vi.fn(),
      query: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      update: vi.fn(),
      batchCreate: vi.fn(),
      isEmpty: vi.fn(),
      updateOrder: vi.fn(),
      queryByKeyword: vi.fn(),
      updateConfig: vi.fn(),
      queryByGroupIds: vi.fn(),
    },
  };
});

vi.mock('@/database/_deprecated/models/user', () => {
  return {
    UserModel: {
      getAgentConfig: vi.fn(),
    },
  };
});

describe('SessionService', () => {
  const mockSessionId = 'mock-session-id';
  const mockSession = {
    id: mockSessionId,
    type: 'agent',
    meta: { title: 'Mock Session' },
  } as LobeAgentSession;
  const mockSessions = [mockSession];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getSessionConfig', () => {
    it('should return user agent config for inbox session', async () => {
      const mockConfig = { model: 'test-model' } as LobeAgentConfig;
      (UserModel.getAgentConfig as Mock).mockResolvedValue(mockConfig);

      const config = await sessionService.getSessionConfig(INBOX_SESSION_ID);

      expect(UserModel.getAgentConfig).toHaveBeenCalled();
      expect(config).toBe(mockConfig);
    });

    it('should return DEFAULT_AGENT_CONFIG when UserModel.getAgentConfig returns null', async () => {
      (UserModel.getAgentConfig as Mock).mockResolvedValue(null);

      const config = await sessionService.getSessionConfig(INBOX_SESSION_ID);

      expect(UserModel.getAgentConfig).toHaveBeenCalled();
      expect(config).toBe(DEFAULT_AGENT_CONFIG);
    });

    it('should return session config for non-inbox session', async () => {
      const mockConfig = { model: 'test-model' } as LobeAgentConfig;
      const mockSessionWithConfig = { ...mockSession, config: mockConfig };
      (SessionModel.findById as Mock).mockResolvedValue(mockSessionWithConfig);

      const config = await sessionService.getSessionConfig('test-session');

      expect(SessionModel.findById).toHaveBeenCalledWith('test-session');
      expect(config).toBe(mockConfig);
    });

    it('should throw error if session not found for non-inbox session', async () => {
      (SessionModel.findById as Mock).mockResolvedValue(null);

      await expect(sessionService.getSessionConfig('test-session')).rejects.toThrow(
        'Session not found',
      );
    });
  });

  describe('createSession', () => {
    it('should create a new session and return its id', async () => {
      const sessionType = LobeSessionType.Agent;
      const defaultValue = { meta: { title: 'New Session' } } as Partial<LobeAgentSession>;
      (SessionModel.create as Mock).mockResolvedValue(mockSession);

      const sessionId = await sessionService.createSession(sessionType, defaultValue);

      expect(SessionModel.create).toHaveBeenCalledWith(sessionType, defaultValue);
      expect(sessionId).toBe(mockSessionId);
    });

    it('should throw an error if session creation fails', async () => {
      const sessionType = LobeSessionType.Agent;
      const defaultValue = { meta: { title: 'New Session' } } as Partial<LobeAgentSession>;
      (SessionModel.create as Mock).mockResolvedValue(null);

      await expect(sessionService.createSession(sessionType, defaultValue)).rejects.toThrow(
        'session create Error',
      );
    });
  });

  describe('batchCreateSessions', () => {
    it('should batch create sessions', async () => {
      (SessionModel.batchCreate as Mock).mockResolvedValue(mockSessions);

      const result = await sessionService.batchCreateSessions(mockSessions);

      expect(SessionModel.batchCreate).toHaveBeenCalledWith(mockSessions);
      expect(result).toBe(mockSessions);
    });
  });

  describe('getSessionsByType', () => {
    it('should retrieve sessions with their group ids', async () => {
      (SessionModel.query as Mock).mockResolvedValue(mockSessions);

      const sessions = await sessionService.getSessionsByType();

      expect(SessionModel.query).toHaveBeenCalled();
      expect(sessions).toBe(mockSessions);
    });

    it('should retrieve all agent sessions', async () => {
      const agentSessions = mockSessions.filter((session) => session.type === 'agent');
      (SessionModel.query as Mock).mockResolvedValue(agentSessions);

      const result = await sessionService.getSessionsByType('agent');

      expect(SessionModel.query).toHaveBeenCalled();
      expect(result).toBe(agentSessions);
    });
  });

  describe('removeSession', () => {
    it('should remove a session by its id', async () => {
      (SessionModel.delete as Mock).mockResolvedValue(true);

      const result = await sessionService.removeSession(mockSessionId);

      expect(SessionModel.delete).toHaveBeenCalledWith(mockSessionId);
      expect(result).toBe(true);
    });
  });

  describe('removeAllSessions', () => {
    it('should clear all sessions from the table', async () => {
      (SessionModel.clearTable as Mock).mockResolvedValue(true);

      const result = await sessionService.removeAllSessions();

      expect(SessionModel.clearTable).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('updateSession', () => {
    it('should update the group of a session', async () => {
      const groupId = 'new-group';
      (SessionModel.update as Mock).mockResolvedValue({ ...mockSession, group: groupId });

      const result = await sessionService.updateSession(mockSessionId, { group: groupId });

      expect(SessionModel.update).toHaveBeenCalledWith(mockSessionId, { group: groupId });
      expect(result).toEqual({ ...mockSession, group: groupId });
    });

    it('should update the meta of a session', async () => {
      const newMeta = { description: 'Updated description' };
      (SessionModel.update as Mock).mockResolvedValue({ ...mockSession, meta: newMeta });

      const result = await sessionService.updateSession(mockSessionId, { meta: newMeta });

      expect(SessionModel.update).toHaveBeenCalledWith(mockSessionId, { meta: newMeta });
      expect(result).toEqual({ ...mockSession, meta: newMeta });
    });

    it('should update the pinned status of a session', async () => {
      const pinned = true;

      await sessionService.updateSession(mockSessionId, { pinned });

      expect(SessionModel.update).toHaveBeenCalledWith(mockSessionId, { pinned: 1 });
    });
  });

  describe('updateSessionConfig', () => {
    it('should update the config of a session', async () => {
      const newConfig = { model: 'abc' } as LobeAgentConfig;
      (SessionModel.updateConfig as Mock).mockResolvedValue({ ...mockSession, config: newConfig });

      const result = await sessionService.updateSessionConfig(mockSessionId, newConfig);

      expect(SessionModel.updateConfig).toHaveBeenCalledWith(mockSessionId, newConfig);
      expect(result).toEqual({ ...mockSession, config: newConfig });
    });
  });

  describe('countSessions', () => {
    it('should return false if no sessions exist', async () => {
      (SessionModel.count as Mock).mockResolvedValue(0);

      const result = await sessionService.countSessions();

      expect(SessionModel.count).toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('should return true if sessions exist', async () => {
      (SessionModel.count as Mock).mockResolvedValue(1);

      const result = await sessionService.countSessions();

      expect(SessionModel.count).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('hasSessions', () => {
    it('should return false if no sessions exist', async () => {
      (SessionModel.count as Mock).mockResolvedValue(0);

      const result = await sessionService.hasSessions();

      expect(SessionModel.count).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return true if sessions exist', async () => {
      (SessionModel.count as Mock).mockResolvedValue(1);

      const result = await sessionService.hasSessions();

      expect(SessionModel.count).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('searchSessions', () => {
    it('should return sessions that match the keyword', async () => {
      const keyword = 'search';
      (SessionModel.queryByKeyword as Mock).mockResolvedValue(mockSessions);

      const result = await sessionService.searchSessions(keyword);

      expect(SessionModel.queryByKeyword).toHaveBeenCalledWith(keyword);
      expect(result).toBe(mockSessions);
    });
  });

  describe('cloneSession', () => {
    it('should duplicate a session and return its id', async () => {
      const newTitle = 'Duplicated Session';
      (SessionModel.duplicate as Mock).mockResolvedValue({
        ...mockSession,
        id: 'duplicated-session-id',
      });

      const duplicatedSessionId = await sessionService.cloneSession(mockSessionId, newTitle);

      expect(SessionModel.duplicate).toHaveBeenCalledWith(mockSessionId, newTitle);
      expect(duplicatedSessionId).toBe('duplicated-session-id');
    });
  });

  describe('getGroupedSessions', () => {
    it('should retrieve sessions with their group', async () => {
      (SessionModel.queryWithGroups as Mock).mockResolvedValue(mockSessions);

      const sessionsWithGroup = await sessionService.getGroupedSessions();

      expect(SessionModel.queryWithGroups).toHaveBeenCalled();
      expect(sessionsWithGroup).toBe(mockSessions);
    });
  });

  describe('createSessionGroup', () => {
    it('should create a new session group and return its id', async () => {
      const groupName = 'New Group';
      const sort = 1;
      (SessionGroupModel.create as Mock).mockResolvedValue({
        id: 'new-group-id',
        name: groupName,
        sort,
      });

      const groupId = await sessionService.createSessionGroup(groupName, sort);

      expect(SessionGroupModel.create).toHaveBeenCalledWith(groupName, sort);
      expect(groupId).toBe('new-group-id');
    });
  });

  describe('batchCreateSessionGroups', () => {
    it('should batch create session groups', async () => {
      const groups = [
        { id: 'group-1', name: 'Group 1', sort: 1 },
        { id: 'group-2', name: 'Group 2', sort: 2 },
      ] as SessionGroups;

      (SessionGroupModel.batchCreate as Mock).mockResolvedValue(groups);

      const result = await sessionService.batchCreateSessionGroups(groups);

      expect(SessionGroupModel.batchCreate).toHaveBeenCalledWith(groups);
      expect(result).toBe(groups);
    });
  });

  describe('removeSessionGroup', () => {
    it('should remove a session group by its id', async () => {
      const removeChildren = true;
      (SessionGroupModel.delete as Mock).mockResolvedValue(true);

      const result = await sessionService.removeSessionGroup('group-id', removeChildren);

      expect(SessionGroupModel.delete).toHaveBeenCalledWith('group-id', removeChildren);
      expect(result).toBe(true);
    });
  });

  describe('clearSessionGroups', () => {
    it('should clear all session groups', async () => {
      (SessionGroupModel.clear as Mock).mockResolvedValue(true);

      const result = await sessionService.removeSessionGroups();

      expect(SessionGroupModel.clear).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getSessionGroups', () => {
    it('should retrieve all session groups', async () => {
      const groups = [
        { id: 'group-1', name: 'Group 1', sort: 1 },
        { id: 'group-2', name: 'Group 2', sort: 2 },
      ];
      (SessionGroupModel.query as Mock).mockResolvedValue(groups);

      const result = await sessionService.getSessionGroups();

      expect(SessionGroupModel.query).toHaveBeenCalled();
      expect(result).toBe(groups);
    });
  });

  describe('updateSessionGroup', () => {
    it('should update a session group', async () => {
      const groupId = 'group-1';
      const data = { name: 'Updated Group', sort: 2 };
      (SessionGroupModel.update as Mock).mockResolvedValue({ id: groupId, ...data });

      const result = await sessionService.updateSessionGroup(groupId, data);

      expect(SessionGroupModel.update).toHaveBeenCalledWith(groupId, data);
      expect(result).toEqual({ id: groupId, ...data });
    });
  });

  describe('updateSessionGroupOrder', () => {
    it('should update the order of session groups', async () => {
      const sortMap = [
        { id: 'group-1', sort: 2 },
        { id: 'group-2', sort: 1 },
      ];
      (SessionGroupModel.updateOrder as Mock).mockResolvedValue(true);

      const result = await sessionService.updateSessionGroupOrder(sortMap);

      expect(SessionGroupModel.updateOrder).toHaveBeenCalledWith(sortMap);
      expect(result).toBe(true);
    });
  });
});
