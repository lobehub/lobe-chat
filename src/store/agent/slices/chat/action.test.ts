import { act, renderHook, waitFor } from '@testing-library/react';
import { mutate } from 'swr';
import { describe, expect, it, vi } from 'vitest';

import { agentService } from '@/services/agent';
import { globalService } from '@/services/global';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useSessionStore } from '@/store/session';

vi.mock('zustand/traditional');
vi.mock('swr', async (importOriginal) => {
  const origin = await importOriginal();
  return {
    ...(origin as any),
    mutate: vi.fn(),
  };
});

describe('AgentSlice', () => {
  describe('removePlugin', () => {
    it('should call togglePlugin with the provided id and false', async () => {
      const { result } = renderHook(() => useAgentStore());
      const pluginId = 'plugin-id';
      const togglePluginMock = vi
        .spyOn(result.current, 'togglePlugin')
        .mockResolvedValue(undefined);

      await act(async () => {
        await result.current.removePlugin(pluginId);
      });

      expect(togglePluginMock).toHaveBeenCalledWith(pluginId, false);
      togglePluginMock.mockRestore();
    });
  });

  describe('togglePlugin', () => {
    it('should add plugin id to plugins array if not present and open is true or undefined', async () => {
      const { result } = renderHook(() => useAgentStore());
      const pluginId = 'plugin-id';
      const updateAgentConfigMock = vi
        .spyOn(result.current, 'updateAgentConfig')
        .mockResolvedValue(undefined);
      // 模拟当前配置不包含插件 ID
      vi.spyOn(agentSelectors, 'currentAgentConfig').mockReturnValue({ plugins: [] } as any);

      await act(async () => {
        await result.current.togglePlugin(pluginId);
      });

      expect(updateAgentConfigMock).toHaveBeenCalledWith(
        expect.objectContaining({ plugins: [pluginId] }),
      );
      updateAgentConfigMock.mockRestore();
    });

    it('should remove plugin id from plugins array if present and open is false', async () => {
      const { result } = renderHook(() => useAgentStore());
      const pluginId = 'plugin-id';
      const updateAgentConfigMock = vi
        .spyOn(result.current, 'updateAgentConfig')
        .mockResolvedValue(undefined);
      // 模拟当前配置包含插件 ID
      vi.spyOn(agentSelectors, 'currentAgentConfig').mockReturnValue({
        plugins: [pluginId],
      } as any);

      await act(async () => {
        await result.current.togglePlugin(pluginId, false);
      });

      expect(updateAgentConfigMock).toHaveBeenCalledWith(expect.objectContaining({ plugins: [] }));
      updateAgentConfigMock.mockRestore();
    });

    it('should not modify plugins array if plugin id is not present and open is false', async () => {
      const { result } = renderHook(() => useAgentStore());
      const pluginId = 'plugin-id';
      const updateAgentConfigMock = vi
        .spyOn(result.current, 'updateAgentConfig')
        .mockResolvedValue(undefined);

      // 模拟当前配置不包含插件 ID
      vi.spyOn(agentSelectors, 'currentAgentConfig').mockReturnValue({ plugins: [] } as any);

      await act(async () => {
        await result.current.togglePlugin(pluginId, false);
      });

      expect(updateAgentConfigMock).toHaveBeenCalledWith(expect.objectContaining({ plugins: [] }));
      updateAgentConfigMock.mockRestore();
    });
  });

  describe('updateAgentConfig', () => {
    it('should update config when activeAgentId is set', async () => {
      const { result } = renderHook(() => useAgentStore());
      const config = { model: 'gpt-3.5-turbo' };
      const updateAgentConfigMock = vi
        .spyOn(agentService, 'updateAgentConfig')
        .mockResolvedValue(undefined);
      const refreshMock = vi.spyOn(result.current, 'internal_refreshAgentConfig');

      act(() => {
        useAgentStore.setState({ activeAgentId: 'inbox-agent-id' });
      });

      await act(async () => {
        await result.current.updateAgentConfig(config);
      });

      expect(updateAgentConfigMock).toHaveBeenCalledWith(
        'inbox-agent-id',
        config,
        expect.any(AbortSignal),
      );
      expect(refreshMock).toHaveBeenCalled();
      updateAgentConfigMock.mockRestore();
      refreshMock.mockRestore();
    });

    it('should update agent config if current agent is not inbox agent', async () => {
      const { result } = renderHook(() => useAgentStore());
      const config = { model: 'gpt-3.5-turbo' };
      const updateAgentConfigMock = vi
        .spyOn(agentService, 'updateAgentConfig')
        .mockResolvedValue(undefined);
      const refreshMock = vi.spyOn(result.current, 'internal_refreshAgentConfig');

      // 模拟当前 agent 不是收件箱 agent
      act(() => {
        useAgentStore.setState({
          activeAgentId: 'agent-id',
        });
      });

      await act(async () => {
        await result.current.updateAgentConfig(config);
      });

      expect(updateAgentConfigMock).toHaveBeenCalledWith(
        'agent-id',
        config,
        expect.any(AbortSignal),
      );
      expect(refreshMock).toHaveBeenCalled();
      updateAgentConfigMock.mockRestore();
      refreshMock.mockRestore();
    });

    it('should not update config if there is no current agent', async () => {
      const { result } = renderHook(() => useAgentStore());
      const config = { model: 'gpt-3.5-turbo' };
      const updateAgentConfigMock = vi.spyOn(agentService, 'updateAgentConfig');

      // 模拟没有当前 agent
      act(() => {
        useAgentStore.setState({ activeAgentId: undefined });
      });

      await act(async () => {
        await result.current.updateAgentConfig(config);
      });

      expect(updateAgentConfigMock).not.toHaveBeenCalled();
      updateAgentConfigMock.mockRestore();
    });
  });

  describe('useFetchAgentConfig', () => {
    it('should update agentConfig and isAgentConfigInit when data changes and isAgentConfigInit is false', async () => {
      const { result } = renderHook(() => useAgentStore());

      vi.spyOn(agentService, 'getAgentConfigById').mockResolvedValueOnce({
        id: 'test-agent-id',
        model: 'gpt-4',
      } as any);

      renderHook(() => result.current.useFetchAgentConfig(true, 'test-agent-id'));

      await waitFor(() => {
        expect(result.current.agentMap['test-agent-id']).toEqual({
          id: 'test-agent-id',
          model: 'gpt-4',
        });
      });
    });

    it('should not update state when data is the same and isAgentConfigInit is true', async () => {
      const { result } = renderHook(() => useAgentStore());

      act(() => {
        useAgentStore.setState({
          agentMap: {
            'test-agent-id': { id: 'test-agent-id', model: 'gpt-3.5-turbo' },
          },
        });
      });

      vi.spyOn(useSessionStore, 'setState');
      vi.spyOn(agentService, 'getAgentConfigById').mockResolvedValueOnce({
        id: 'test-agent-id',
        model: 'gpt-3.5-turbo',
      } as any);

      renderHook(() => result.current.useFetchAgentConfig(true, 'test-agent-id'));

      await waitFor(() => {
        expect(result.current.agentMap['test-agent-id']).toEqual({
          id: 'test-agent-id',
          model: 'gpt-3.5-turbo',
        });

        expect(useSessionStore.setState).not.toHaveBeenCalled();
      });
    });
  });

  describe('useFetchInboxAgentConfig', () => {
    it('should merge DEFAULT_AGENT_CONFIG and update defaultAgentConfig and isDefaultAgentConfigInit on success', async () => {
      const { result } = renderHook(() => useAgentStore());
      vi.spyOn(agentService, 'getSessionConfig').mockResolvedValue({
        id: 'inbox-agent-123',
        model: 'gemini-pro',
      } as any);

      renderHook(() => result.current.useInitInboxAgentStore(true));

      await waitFor(async () => {
        // agentMap key is now agentId (data.id), not INBOX_SESSION_ID
        expect(result.current.agentMap['inbox-agent-123']).toEqual({
          id: 'inbox-agent-123',
          model: 'gemini-pro',
        });
        expect(result.current.inboxAgentId).toBe('inbox-agent-123');
        expect(result.current.isInboxAgentConfigInit).toBe(true);
      });
    });

    it('should not modify state if user not logged in', async () => {
      const { result } = renderHook(() => useAgentStore());
      vi.spyOn(agentService, 'getSessionConfig').mockResolvedValue({
        id: 'inbox-agent-123',
        model: 'gemini-pro',
      } as any);

      renderHook(() => result.current.useInitInboxAgentStore(false));

      await waitFor(async () => {
        expect(result.current.agentMap['inbox-agent-123']).toBeUndefined();
        expect(result.current.isInboxAgentConfigInit).toBe(false);
      });
    });

    it('should not modify state on failure', async () => {
      const { result } = renderHook(() => useAgentStore());

      vi.spyOn(agentService, 'getSessionConfig').mockRejectedValueOnce(new Error());

      renderHook(() => result.current.useInitInboxAgentStore(true));

      await waitFor(async () => {
        expect(result.current.inboxAgentId).toBeUndefined();
        expect(result.current.isInboxAgentConfigInit).toBe(false);
      });
    });
  });

  describe('internal_updateAgentConfig', () => {
    it('should call agentService.updateAgentConfig', async () => {
      const { result } = renderHook(() => useAgentStore());

      const updateAgentConfigMock = vi
        .spyOn(agentService, 'updateAgentConfig')
        .mockResolvedValue(undefined);

      await act(async () => {
        await result.current.internal_updateAgentConfig('test-agent-id', { foo: 'bar' } as any);
      });

      expect(updateAgentConfigMock).toHaveBeenCalledWith(
        'test-agent-id',
        { foo: 'bar' },
        undefined,
      );
    });

    it('should trigger internal_refreshAgentConfig', async () => {
      const { result } = renderHook(() => useAgentStore());

      const refreshMock = vi.spyOn(result.current, 'internal_refreshAgentConfig');

      await act(async () => {
        await result.current.internal_updateAgentConfig('test-session-id', {});
      });

      expect(refreshMock).toHaveBeenCalledWith('test-session-id');
    });

    it('should trigger useSessionStore.refreshSessions when model changes', async () => {
      const { result } = renderHook(() => useAgentStore());

      vi.spyOn(agentSelectors, 'currentAgentModel').mockReturnValueOnce('gpt-3.5-turbo');

      const refreshSessionsMock = vi.spyOn(useSessionStore.getState(), 'refreshSessions');

      await act(async () => {
        await result.current.internal_updateAgentConfig('test-session-id', { model: 'gpt-4' });
      });

      expect(refreshSessionsMock).toHaveBeenCalled();
    });
  });

  describe('internal_refreshAgentConfig', () => {
    it('should call mutate with correct key', async () => {
      const { result } = renderHook(() => useAgentStore());

      await act(async () => {
        await result.current.internal_refreshAgentConfig('test-session-id');
      });

      expect(mutate).toHaveBeenCalledWith(['FETCH_AGENT_CONFIG', 'test-session-id']);
    });
  });

  describe('edge cases', () => {
    it('should not update config if activeAgentId is undefined', async () => {
      const { result } = renderHook(() => useAgentStore());

      act(() => {
        useAgentStore.setState({ activeAgentId: undefined });
      });

      const updateMock = vi.spyOn(result.current, 'internal_updateAgentConfig');

      await act(async () => {
        await result.current.updateAgentConfig({});
      });

      expect(updateMock).not.toHaveBeenCalled();
    });
  });
});
