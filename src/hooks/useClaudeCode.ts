import {
  ClaudeCodeMessage,
  ClaudeCodeOptions,
  ClaudeCodeQueryResult,
  ClaudeCodeSessionInfo,
  MainBroadcastEventKey,
  dispatch,
  useWatchBroadcast,
} from '@lobechat/electron-client-ipc';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseClaudeCodeOptions {
  onStreamComplete?: (sessionId: string) => void;
  onStreamError?: (error: string) => void;
  onStreamMessage?: (message: ClaudeCodeMessage) => void;
}

export const useClaudeCode = (options?: UseClaudeCodeOptions) => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<ClaudeCodeSessionInfo[]>([]);
  const [apiKeySource, setApiKeySource] = useState<string>('');
  const [version, setVersion] = useState<string>('');

  const streamIdRef = useRef<string | null>(null);
  const abortSignalIdRef = useRef<string | null>(null);

  // 检查是否在 Electron 环境中
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  // 检查 Claude Code 可用性
  const checkAvailability = useCallback(async () => {
    if (!isElectron) {
      setIsAvailable(false);
      setError('Not running in Electron environment');
      return;
    }

    try {
      const result = await dispatch('claudeCodeCheckAvailability');
      setIsAvailable(result.available);
      setApiKeySource(result.apiKeySource || '');
      setVersion(result.version || '');
      if (!result.available) {
        setError(result.error || 'Claude Code is not available');
      }
    } catch (err) {
      setIsAvailable(false);
      setError(err.message);
    }
  }, [isElectron]);

  // 执行查询
  const query = useCallback(
    async (prompt: string, queryOptions?: ClaudeCodeOptions): Promise<ClaudeCodeQueryResult> => {
      if (!isElectron) {
        throw new Error('Not running in Electron environment');
      }

      setIsLoading(true);
      setError(null);

      try {
        // 创建 abort controller
        const { signalId } = await dispatch('claudeCodeCreateAbortController');
        abortSignalIdRef.current = signalId;

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
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
        abortSignalIdRef.current = null;
      }
    },
    [isElectron],
  );

  // 开始流式查询
  const startStreamingQuery = useCallback(
    async (prompt: string, queryOptions?: ClaudeCodeOptions): Promise<void> => {
      if (!isElectron) {
        throw new Error('Not running in Electron environment');
      }

      setIsLoading(true);
      setError(null);

      try {
        // 生成唯一的 stream ID
        const streamId = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        streamIdRef.current = streamId;

        // 创建 abort controller
        const { signalId } = await dispatch('claudeCodeCreateAbortController');
        abortSignalIdRef.current = signalId;

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
        setError(err.message);
        setIsLoading(false);
        throw err;
      }
    },
    [isElectron],
  );

  // 停止流式查询
  const stopStreaming = useCallback(async () => {
    if (!isElectron || !streamIdRef.current) return;

    try {
      await dispatch('claudeCodeStreamStop', streamIdRef.current);

      if (abortSignalIdRef.current) {
        await dispatch('claudeCodeAbort', abortSignalIdRef.current);
      }
    } catch (err) {
      console.error('Error stopping stream:', err);
    } finally {
      streamIdRef.current = null;
      abortSignalIdRef.current = null;
      setIsLoading(false);
    }
  }, [isElectron]);

  // 中止当前操作
  const abort = useCallback(async () => {
    if (!isElectron) return;

    if (streamIdRef.current) {
      await stopStreaming();
    } else if (abortSignalIdRef.current) {
      try {
        await dispatch('claudeCodeAbort', abortSignalIdRef.current);
      } catch (err) {
        console.error('Error aborting:', err);
      } finally {
        abortSignalIdRef.current = null;
        setIsLoading(false);
      }
    }
  }, [isElectron, stopStreaming]);

  // 获取最近的会话
  const fetchRecentSessions = useCallback(async () => {
    if (!isElectron) return;

    try {
      const sessions = await dispatch('claudeCodeGetRecentSessions');
      setRecentSessions(sessions);
    } catch (err) {
      console.error('Error fetching recent sessions:', err);
    }
  }, [isElectron]);

  // 清除会话
  const clearSession = useCallback(
    async (sessionId: string) => {
      if (!isElectron) return;

      try {
        await dispatch('claudeCodeClearSession', sessionId);
        // 重新获取会话列表
        await fetchRecentSessions();
      } catch (err) {
        console.error('Error clearing session:', err);
      }
    },
    [isElectron, fetchRecentSessions],
  );

  const handleStreamMessage = (e: any, data: { message: ClaudeCodeMessage; streamId: string }) => {
    if (data.streamId === streamIdRef.current && options.onStreamMessage) {
      options.onStreamMessage(data.message);
    }
  };

  const handleStreamComplete = (e: any, data: { sessionId: string; streamId: string }) => {
    if (data.streamId === streamIdRef.current) {
      streamIdRef.current = null;
      abortSignalIdRef.current = null;
      setIsLoading(false);
      if (options.onStreamComplete) {
        options.onStreamComplete(data.sessionId);
      }
    }
  };

  const handleStreamError = (e: any, data: { error: string; streamId: string }) => {
    if (data.streamId === streamIdRef.current) {
      streamIdRef.current = null;
      abortSignalIdRef.current = null;
      setIsLoading(false);
      setError(data.error);
      if (options.onStreamError) {
        options.onStreamError(data.error);
      }
    }
  };

  // 注册事件监听器

  useWatchBroadcast('claudeCodeStreamMessage', handleStreamMessage);
  useWatchBroadcast('claudeCodeStreamComplete', handleStreamComplete);
  useWatchBroadcast('claudeCodeStreamError', handleStreamError);

  // 初始化时检查可用性
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    abort,

    apiKeySource,

    checkAvailability,

    clearSession,

    error,

    fetchRecentSessions,

    // 状态
    isAvailable,

    isLoading,
    // 方法
    query,
    recentSessions,
    startStreamingQuery,
    stopStreaming,
    version,
  };
};
