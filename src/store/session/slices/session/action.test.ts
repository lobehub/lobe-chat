import { act, renderHook } from '@testing-library/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { sessionService } from '@/services/session';
import { useSessionStore } from '@/store/session';
import { LobeSessionType } from '@/types/session';

// Mock sessionService 和其他依赖项
vi.mock('@/services/session', () => ({
  sessionService: {
    removeAllSessions: vi.fn(),
    createNewSession: vi.fn(),
    duplicateSession: vi.fn(),
    updateSessionGroup: vi.fn(),
    removeSession: vi.fn(),
    getSessions: vi.fn(),
    updateSessionGroupId: vi.fn(),
    searchSessions: vi.fn(),
    updateSessionPinned: vi.fn(),
  },
}));

// Mock router
const mockRouterPush = vi.fn();

const mockRefresh = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  useSessionStore.setState({
    refreshSessions: mockRefresh,
    router: {
      push: mockRouterPush,
    } as unknown as AppRouterInstance,
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
      vi.mocked(sessionService.createNewSession).mockResolvedValue(newSessionId);

      let createdSessionId;

      await act(async () => {
        createdSessionId = await result.current.createSession({ config: { displayMode: 'docs' } });
      });

      const call = vi.mocked(sessionService.createNewSession).mock.calls[0];
      expect(call[0]).toEqual(LobeSessionType.Agent);
      expect(call[1]).toMatchObject({ config: { displayMode: 'docs' } });

      expect(createdSessionId).toBe(newSessionId);
      expect(mockRouterPush).toHaveBeenCalledWith(
        SESSION_CHAT_URL(newSessionId, result.current.isMobile),
      );
    });

    it('should create a new session but not switch to it if isSwitchSession is false', async () => {
      const { result } = renderHook(() => useSessionStore());
      const newSessionId = 'new-session-id';
      vi.mocked(sessionService.createNewSession).mockResolvedValue(newSessionId);

      let createdSessionId;

      await act(async () => {
        createdSessionId = await result.current.createSession(
          { config: { displayMode: 'docs' } },
          false,
        );
      });

      const call = vi.mocked(sessionService.createNewSession).mock.calls[0];
      expect(call[0]).toEqual(LobeSessionType.Agent);
      expect(call[1]).toMatchObject({ config: { displayMode: 'docs' } });

      expect(createdSessionId).toBe(newSessionId);
      expect(mockRouterPush).not.toHaveBeenCalledWith(
        SESSION_CHAT_URL(newSessionId, result.current.isMobile),
      );
    });
  });

  describe('duplicateSession', () => {
    it('should duplicate a session and switch to the new one', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'session-id';
      const duplicatedSessionId = 'duplicated-session-id';
      vi.mocked(sessionService.duplicateSession).mockResolvedValue(duplicatedSessionId);

      await act(async () => {
        await result.current.duplicateSession(sessionId);
      });

      expect(sessionService.duplicateSession).toHaveBeenCalledWith(sessionId, undefined);
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

  describe('switchSession', () => {
    it('should switch to the provided session id', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'session-id';

      act(() => {
        result.current.switchSession(sessionId);
      });

      expect(result.current.activeId).toBe(sessionId);
      expect(mockRouterPush).toHaveBeenCalledWith(
        SESSION_CHAT_URL(sessionId, result.current.isMobile),
      );
    });

    it('should switch to the inbox session id if none is provided', async () => {
      const { result } = renderHook(() => useSessionStore());

      act(() => {
        result.current.switchSession();
      });

      expect(result.current.activeId).toBe(INBOX_SESSION_ID);
      expect(mockRouterPush).toHaveBeenCalledWith(
        SESSION_CHAT_URL(INBOX_SESSION_ID, result.current.isMobile),
      );
    });
  });

  describe('activeSession', () => {
    it('should set the provided session id as active', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'active-session-id';

      act(() => {
        result.current.activeSession(sessionId);
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

      expect(sessionService.updateSessionPinned).toHaveBeenCalledWith(sessionId, true);
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('should unpin a session when pinned is false', async () => {
      const { result } = renderHook(() => useSessionStore());
      const sessionId = 'session-id-to-unpin';

      await act(async () => {
        await result.current.pinSession(sessionId, false);
      });

      expect(sessionService.updateSessionPinned).toHaveBeenCalledWith(sessionId, false);
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

      expect(sessionService.updateSessionGroupId).toHaveBeenCalledWith(sessionId, groupId);
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
