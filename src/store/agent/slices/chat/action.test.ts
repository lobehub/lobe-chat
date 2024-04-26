import { act, renderHook } from '@testing-library/react';
import * as immer from 'immer';
import { describe, expect, it, vi } from 'vitest';

import { sessionService } from '@/services/session';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';

describe('AgentSlice', () => {
  describe('removePlugin', () => {
    it('should call togglePlugin with the provided id and false', async () => {
      const { result } = renderHook(() => useAgentStore());
      const pluginId = 'plugin-id';
      const togglePluginMock = vi.spyOn(result.current, 'togglePlugin');

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
      const updateAgentConfigMock = vi.spyOn(result.current, 'updateAgentConfig');

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
      const updateAgentConfigMock = vi.spyOn(result.current, 'updateAgentConfig');

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
      const updateAgentConfigMock = vi.spyOn(result.current, 'updateAgentConfig');

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
    it('should update global config if current session is inbox session', async () => {
      const { result } = renderHook(() => useAgentStore());
      const config = { model: 'gpt-3.5-turbo' };
      const updateSessionConfigMock = vi.spyOn(sessionService, 'updateSessionConfig');
      const refreshMock = vi.spyOn(result.current, 'internal_refreshAgentConfig');

      await act(async () => {
        await result.current.updateAgentConfig(config);
      });

      expect(updateSessionConfigMock).toHaveBeenCalledWith('inbox', config);
      expect(refreshMock).toHaveBeenCalled();
      updateSessionConfigMock.mockRestore();
      refreshMock.mockRestore();
    });

    it('should update session config if current session is not inbox session', async () => {
      const { result } = renderHook(() => useAgentStore());
      const config = { model: 'gpt-3.5-turbo' };
      const updateSessionConfigMock = vi.spyOn(sessionService, 'updateSessionConfig');
      const refreshMock = vi.spyOn(result.current, 'internal_refreshAgentConfig');

      // 模拟当前会话不是收件箱会话
      act(() => {
        useAgentStore.setState({
          activeId: 'session-id',
        });
      });

      await act(async () => {
        await result.current.updateAgentConfig(config);
      });

      expect(updateSessionConfigMock).toHaveBeenCalledWith('session-id', config);
      expect(refreshMock).toHaveBeenCalled();
      updateSessionConfigMock.mockRestore();
      refreshMock.mockRestore();
    });

    it('should not update config if there is no current session', async () => {
      const { result } = renderHook(() => useAgentStore());
      const config = { model: 'gpt-3.5-turbo' };
      const updateSessionConfigMock = vi.spyOn(sessionService, 'updateSessionConfig');

      // 模拟没有当前会话
      act(() => {
        useAgentStore.setState({ activeId: null as any });
      });

      await act(async () => {
        await result.current.updateAgentConfig(config);
      });

      expect(updateSessionConfigMock).not.toHaveBeenCalled();
      updateSessionConfigMock.mockRestore();
    });
  });
});
