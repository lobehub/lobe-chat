import {
  ClaudeCodeMessage,
  ClaudeCodeOptions,
  ClaudeCodeQueryResult,
  dispatch,
  useWatchBroadcast,
} from '@lobechat/electron-client-ipc';
import { useCallback } from 'react';
import type { StateCreator } from 'zustand/vanilla';

import { isDesktop } from '@/const/version';

import { ElectronStore } from '../store';
import { ClaudeCodeState } from './initialState';

// Global variables to store stream and abort signal references
let streamIdRef: string | null = null;
let abortSignalIdRef: string | null = null;

// ======== Action Interface ======== //

export interface ClaudeCodeAction {
  abort: () => Promise<void>;
  checkAvailability: () => Promise<void>;
  clearSession: (sessionId: string) => Promise<void>;
  fetchRecentSessions: () => Promise<void>;
  query: (prompt: string, queryOptions?: ClaudeCodeOptions) => Promise<ClaudeCodeQueryResult>;
  setClaudeCodeError: (error: string | null) => void;
  setClaudeCodeLoading: (isLoading: boolean) => void;
  startStreamingQuery: (prompt: string, queryOptions?: ClaudeCodeOptions) => Promise<void>;
  stopStreaming: () => Promise<void>;
  updateClaudeCodeState: (state: Partial<ClaudeCodeState>) => void;
  useClaudeCodeListeners: (options: {
    onStreamComplete?: (sessionId: string) => void;
    onStreamError?: (error: string) => void;
    onStreamMessage?: (message: ClaudeCodeMessage) => void;
  }) => void;
}

// ======== Action Implementation ======== //

export const createClaudeCodeSlice: StateCreator<
  ElectronStore,
  [['zustand/devtools', never]],
  [],
  ClaudeCodeAction
> = (set, get) => ({
  abort: async () => {
    if (!isDesktop) return;

    const { stopStreaming } = get();

    if (streamIdRef) {
      await stopStreaming();
    } else if (abortSignalIdRef) {
      try {
        await dispatch('claudeCodeAbort', abortSignalIdRef);
      } catch (err) {
        console.error('Error aborting:', err);
      } finally {
        abortSignalIdRef = null;
        set({ claudeCode: { ...get().claudeCode, isLoading: false } });
      }
    }
  },

  checkAvailability: async () => {
    if (!isDesktop) {
      set({
        claudeCode: {
          ...get().claudeCode,
          error: 'Not running in Electron environment',
          isAvailable: false,
        },
      });
      return;
    }

    try {
      const result = await dispatch('claudeCodeCheckAvailability');
      set({
        claudeCode: {
          ...get().claudeCode,
          apiKeySource: result.apiKeySource || '',
          error: result.available ? null : result.error || 'Claude Code is not available',
          isAvailable: result.available,
          version: result.version || '',
        },
      });
    } catch (err) {
      get().updateClaudeCodeState({
        error: (err as Error).message,
        isAvailable: false,
      });
    }
  },

  clearSession: async (sessionId: string) => {
    if (!isDesktop) return;

    try {
      await dispatch('claudeCodeClearSession', sessionId);
      // 重新获取会话列表
      const { fetchRecentSessions } = get();
      await fetchRecentSessions();
    } catch (err) {
      console.error('Error clearing session:', err);
    }
  },

  fetchRecentSessions: async () => {
    if (!isDesktop) return;

    try {
      const sessions = await dispatch('claudeCodeGetRecentSessions');
      set({
        claudeCode: {
          ...get().claudeCode,
          recentSessions: sessions,
        },
      });
    } catch (err) {
      console.error('Error fetching recent sessions:', err);
    }
  },

  query: async (prompt: string, queryOptions?: ClaudeCodeOptions) => {
    if (!isDesktop) {
      throw new Error('Not running in Electron environment');
    }

    set({
      claudeCode: {
        ...get().claudeCode,
        error: null,
        isLoading: true,
      },
    });

    try {
      // 创建 abort controller
      const { signalId } = await dispatch('claudeCodeCreateAbortController');
      abortSignalIdRef = signalId;

      const result = await dispatch('claudeCodeQuery', {
        abortSignal: signalId,
        options: queryOptions,
        prompt,
      });

      if (!result.success) {
        throw new Error(result.error || 'Query failed');
      }

      return result;
    } catch (err) {
      get().updateClaudeCodeState({
        error: (err as Error).message,
      });
      throw err;
    } finally {
      set({
        claudeCode: {
          ...get().claudeCode,
          isLoading: false,
        },
      });
      abortSignalIdRef = null;
    }
  },

  setClaudeCodeError: (error: string | null) => {
    set({
      claudeCode: {
        ...get().claudeCode,
        error,
      },
    });
  },

  setClaudeCodeLoading: (isLoading: boolean) => {
    set({
      claudeCode: {
        ...get().claudeCode,
        isLoading,
      },
    });
  },

  startStreamingQuery: async (prompt: string, queryOptions?: ClaudeCodeOptions) => {
    if (!isDesktop) {
      throw new Error('Not running in Electron environment');
    }

    set({
      claudeCode: {
        ...get().claudeCode,
        error: null,
        isLoading: true,
      },
    });

    try {
      // 生成唯一的 stream ID
      const streamId = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      streamIdRef = streamId;

      // 创建 abort controller
      const { signalId } = await dispatch('claudeCodeCreateAbortController');
      abortSignalIdRef = signalId;

      const result = await dispatch('claudeCodeStreamStart', {
        abortSignal: signalId,
        options: queryOptions,
        prompt,
        streamId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to start streaming');
      }
    } catch (err) {
      get().updateClaudeCodeState({
        error: (err as Error).message,
        isLoading: false,
      });
      throw err;
    }
  },

  stopStreaming: async () => {
    if (!isDesktop || !streamIdRef) return;

    try {
      await dispatch('claudeCodeStreamStop', streamIdRef);

      if (abortSignalIdRef) {
        await dispatch('claudeCodeAbort', abortSignalIdRef);
      }
    } catch (err) {
      console.error('Error stopping stream:', err);
    } finally {
      streamIdRef = null;
      abortSignalIdRef = null;
      set({
        claudeCode: {
          ...get().claudeCode,
          isLoading: false,
        },
      });
    }
  },

  updateClaudeCodeState: (state) => {
    set({
      claudeCode: {
        ...get().claudeCode,
        ...state,
      },
    });
  },
  useClaudeCodeListeners: (options = {}) => {
    const { updateClaudeCodeState } = get();

    const handleStreamMessage = useCallback(
      (data: { message: ClaudeCodeMessage; streamId: string }) => {
        if (data.streamId === streamIdRef && options.onStreamMessage) {
          options.onStreamMessage(data.message);
        }
      },
      [options.onStreamMessage],
    );

    const handleStreamComplete = useCallback(
      (data: { sessionId: string; streamId: string }) => {
        if (data.streamId === streamIdRef) {
          streamIdRef = null;
          abortSignalIdRef = null;
          updateClaudeCodeState({ isLoading: false });
          if (options.onStreamComplete) {
            options.onStreamComplete(data.sessionId);
          }
        }
      },
      [options.onStreamComplete, updateClaudeCodeState],
    );

    const handleStreamError = useCallback(
      (data: { error: string; streamId: string }) => {
        if (data.streamId === streamIdRef) {
          streamIdRef = null;
          abortSignalIdRef = null;
          updateClaudeCodeState({ error: data.error, isLoading: false });
          if (options.onStreamError) {
            options.onStreamError(data.error);
          }
        }
      },
      [options.onStreamError, updateClaudeCodeState],
    );

    // 注册事件监听器
    useWatchBroadcast('claudeCodeStreamMessage', handleStreamMessage);
    useWatchBroadcast('claudeCodeStreamComplete', handleStreamComplete);
    useWatchBroadcast('claudeCodeStreamError', handleStreamError);
  },
});
