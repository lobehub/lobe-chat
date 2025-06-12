import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { message } from '@/components/AntdStaticMethods';
import { SESSION_CHAT_URL } from '@/const/url';
import { sessionService } from '@/services/session';
import { useSessionStore } from '@/store/session';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

import { sessionSelectors } from './selectors';

// Mock sessionService 和其他依赖项
vi.mock('@/services/session', () => ({
  sessionService: {
    removeAllSessions: vi.fn(),
    createSession: vi.fn(),
    cloneSession: vi.fn(),
    updateSessionGroup: vi.fn(),
    removeSession: vi.fn(),
    getAllSessions: vi.fn(),
    updateSession: vi.fn(),
    updateSessionMeta: vi.fn(),
    updateSessionGroupId: vi.fn(),
    searchSessions: vi.fn(),
    updateSessionPinned: vi.fn(),
  },
}));

vi.mock('@/components/AntdStaticMethods', () => ({
  message: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    destroy: vi.fn(),
  },
}));

const mockRefresh = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  useSessionStore.setState({
    refreshSessions: mockRefresh,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SessionAction', () => {
  describe('clearSessions', () => {
    it('should clear all sessions and refresh the list', async () => {
      const { result } = renderHook(() => useSessionStore());

      await act(async () => {
        await result.current.clearSessions();
      });

      expect(sessionService.removeAllSessions).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled(); // 假设 refreshSessions 调用了 getSessions
    });
  });

  describe('createSession', () => {
    it('should create a new session and switch to it', async () => {
      const { result } = renderHook(() => useSessionStore());
      const newSessionId = 'new-session-id';
      vi.mocked(sessionService.createSession).mockResolvedValue(newSessionId);

      let createdSessionId;

      await act(async () => {
        createdSessionId = await result.current.createSession({
          config: { chatConfig: { displayMode: 'docs' } },
        });
      });

      const call = vi.mocked(sessionService.createSession).mock.calls[0];
      expect(call[0]).toEqual(LobeSessionType.Agent);
      expect(call[1]).toMatchObject({ config: { chatConfig: { displayMode: 'docs' } } });

      expect(createdSessionId).toBe(newSessionId);
    });

    it('should create a new session but not switch to it if isSwitchSession is false', async () => {
      const { result } = renderHook(() => useSessionStore());
      const newSessionId = 'new-session-id';
      vi.mocked(sessionService.createSession).mockResolvedValue(newSessionId);

      let createdSessionId;

      await act(async () => {
        createdSessionId = await result.current.createSession(
          { config: { chatConfig: { displayMode: 'docs' } } },
          false,
        );
      });

      const call = vi.mocked(sessionService.createSession).mock.calls[0];
      expect(call[0]).toEqual(LobeSessionType.Agent);
      expect(call[1]).toMatchObject({ config: { chatConfig: { displayMode: 'docs' } } });

      expect(createdSessionId).toBe(newSessionId);
    });
  });

  describe('cloneSession', () => {
    it('should duplicate a session and switch to the new one', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'session-id';
      const duplicatedSessionId = 'duplicated-session-id';
      vi.mocked(sessionService.cloneSession).mockResolvedValue(duplicatedSessionId);
      vi.mocked(message.loading).mockResolvedValue(true);

      await act(async () => {
        await result.current.duplicateSession(sessionId);
      });

      expect(message.loading).toHaveBeenCalled();
      expect(sessionService.cloneSession).toHaveBeenCalledWith(sessionId, undefined);
    });
  });

  describe('removeSession', () => {
    it('should remove a session and refresh the list', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'session-id';

      await act(async () => {
        await result.current.removeSession(sessionId);
      });

      expect(sessionService.removeSession).toHaveBeenCalledWith(sessionId);
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('activeSession', () => {
    it('should set the provided session id as active', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'active-session-id';

      act(() => {
        result.current.switchSession(sessionId);
      });

      expect(result.current.activeId).toBe(sessionId);
    });
  });

  describe('pinSession', () => {
    it('should pin a session when pinned is true', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'session-id-to-pin';

      await act(async () => {
        await result.current.pinSession(sessionId, true);
      });

      expect(sessionService.updateSession).toHaveBeenCalledWith(sessionId, { pinned: true });
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('should unpin a session when pinned is false', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'session-id-to-unpin';

      await act(async () => {
        await result.current.pinSession(sessionId, false);
      });

      expect(sessionService.updateSession).toHaveBeenCalledWith(sessionId, { pinned: false });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('updateSessionGroupId', () => {
    it('should update the session group and refresh the list', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'session-id';
      const groupId = 'new-group-id';

      await act(async () => {
        await result.current.updateSessionGroupId(sessionId, groupId);
      });

      expect(sessionService.updateSession).toHaveBeenCalledWith(sessionId, { group: groupId });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('updateAgentMeta', () => {
    it('should not update meta if there is no current session', async () => {
      const { result } = renderHook(() => useSessionStore());
      const meta = { title: 'Test Agent' };
      const updateSessionMock = vi.spyOn(sessionService, 'updateSession');
      const refreshSessionsMock = vi.spyOn(result.current, 'refreshSessions');

      // 模拟没有当前会话
      vi.spyOn(sessionSelectors, 'currentSession').mockReturnValue(null as any);

      await act(async () => {
        await result.current.updateSessionMeta(meta as any);
      });

      expect(updateSessionMock).not.toHaveBeenCalled();
      expect(refreshSessionsMock).not.toHaveBeenCalled();
      updateSessionMock.mockRestore();
      refreshSessionsMock.mockRestore();
    });

    it('should update session meta and refresh sessions', async () => {
      const { result } = renderHook(() => useSessionStore());
      const meta = { title: 'Test Agent' };
      const updateSessionMock = vi.spyOn(sessionService, 'updateSessionMeta');
      const refreshSessionsMock = vi.spyOn(result.current, 'refreshSessions');

      // 模拟有当前会话
      vi.spyOn(sessionSelectors, 'currentSession').mockReturnValue({ id: 'session-id' } as any);
      vi.spyOn(result.current, 'activeId', 'get').mockReturnValue('session-id');

      await act(async () => {
        await result.current.updateSessionMeta(meta);
      });

      expect(updateSessionMock).toHaveBeenCalledWith('session-id', meta, expect.any(AbortSignal));
      expect(refreshSessionsMock).toHaveBeenCalled();
      updateSessionMock.mockRestore();
      refreshSessionsMock.mockRestore();
    });
  });

  describe('findNextAvailableSessionTitle', () => {
    const mockSessions = [
      { meta: { title: 'Test Session' }, group: 'default' },
      { meta: { title: 'Test Session copy' }, group: 'default' },
      { meta: { title: 'Test Session copy 1' }, group: 'default' },
      { meta: { title: 'Test Session copy 2' }, group: 'default' },
      { meta: { title: 'Another Session' }, group: 'default' },
      { meta: { title: 'Test Session copy 4' }, group: 'default' },
    ] as LobeAgentSession[];

    const sharedParams = {
      duplicateSymbol: 'copy',
      groupId: 'default',
    }

    it('should return the base title if no sessions exist', () => {
      vi.spyOn(sessionSelectors, 'getSessionsByGroupId').mockReturnValue(() => []);
      const { result } = renderHook(() => useSessionStore());
      const nextTitle = result.current.internal_findNextAvailableSessionTitle({
        baseTitle: 'Test Session',
        ...sharedParams
      });
      expect(nextTitle).toBe('Test Session');
    });

    it('should return the title with a suffix if it already exists', () => {
      vi.spyOn(sessionSelectors, 'getSessionsByGroupId').mockReturnValue(
        () => mockSessions.slice(0, 1)
      );
      const { result } = renderHook(() => useSessionStore());

      const nextTitle = result.current.internal_findNextAvailableSessionTitle({
        baseTitle: 'Test Session',
        ...sharedParams
      });
      expect(nextTitle).toBe('Test Session copy');
    });

    it('should return the title with a numeric suffix if multiple copies exist', () => {
      vi.spyOn(sessionSelectors, 'getSessionsByGroupId').mockReturnValue(
        () => mockSessions.slice(0, 2)
      );
      const { result } = renderHook(() => useSessionStore());

      const nextTitle = result.current.internal_findNextAvailableSessionTitle({
        baseTitle: 'Test Session',
        ...sharedParams
      });
      expect(nextTitle).toBe('Test Session copy 1');

      const nextTitleWithSuffix = result.current.internal_findNextAvailableSessionTitle({
        baseTitle: 'Test Session copy',
        ...sharedParams
      });
      expect(nextTitleWithSuffix).toBe('Test Session copy 1');

      const nextTitleWithNumericSuffix = result.current.internal_findNextAvailableSessionTitle({
        baseTitle: 'Test Session copy 1',
        ...sharedParams
      });
      expect(nextTitleWithNumericSuffix).toBe('Test Session copy 1');
    });

    it('should supplement missing indexes', () => {
      vi.spyOn(sessionSelectors, 'getSessionsByGroupId').mockReturnValue(() => mockSessions);
      const { result } = renderHook(() => useSessionStore());

      const nextTitle = result.current.internal_findNextAvailableSessionTitle({
        baseTitle: 'Test Session',
        ...sharedParams
      });
      expect(nextTitle).toBe('Test Session copy 3');
    });
  });
});
