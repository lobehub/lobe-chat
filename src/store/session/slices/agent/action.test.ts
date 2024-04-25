import { act, renderHook } from '@testing-library/react';
import * as immer from 'immer';
import { describe, expect, it, vi } from 'vitest';

import { sessionService } from '@/services/session';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';

describe('AgentSlice', () => {
  describe('removePlugin', () => {
    it('should call togglePlugin with the provided id and false', async () => {
      const { result } = renderHook(() => useSessionStore());
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
      const { result } = renderHook(() => useSessionStore());
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
      const { result } = renderHook(() => useSessionStore());
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
      const { result } = renderHook(() => useSessionStore());
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
      const { result } = renderHook(() => useSessionStore());
      const config = { model: 'gpt-3.5-turbo' };
      const updateDefaultAgentMock = vi.spyOn(useGlobalStore.getState(), 'updateDefaultAgent');

      // 模拟当前会话是收件箱会话
      vi.spyOn(sessionSelectors, 'isInboxSession').mockReturnValue(true);

      await act(async () => {
        await result.current.updateAgentConfig(config);
      });

      expect(updateDefaultAgentMock).toHaveBeenCalledWith({ config });
      updateDefaultAgentMock.mockRestore();
    });

    it('should update session config if current session is not inbox session', async () => {
      const { result } = renderHook(() => useSessionStore());
      const config = { model: 'gpt-3.5-turbo' };
      const updateSessionConfigMock = vi.spyOn(sessionService, 'updateSessionConfig');
      const refreshSessionsMock = vi.spyOn(result.current, 'refreshSessions');

      // 模拟当前会话不是收件箱会话
      vi.spyOn(sessionSelectors, 'isInboxSession').mockReturnValue(false);
      vi.spyOn(sessionSelectors, 'currentSession').mockReturnValue({ id: 'session-id' } as any);
      vi.spyOn(result.current, 'activeId', 'get').mockReturnValue('session-id');

      await act(async () => {
        await result.current.updateAgentConfig(config);
      });

      expect(updateSessionConfigMock).toHaveBeenCalledWith('session-id', config);
      expect(refreshSessionsMock).toHaveBeenCalled();
      updateSessionConfigMock.mockRestore();
      refreshSessionsMock.mockRestore();
    });

    it('should not update config if there is no current session', async () => {
      const { result } = renderHook(() => useSessionStore());
      const config = { model: 'gpt-3.5-turbo' };
      const updateSessionConfigMock = vi.spyOn(sessionService, 'updateSessionConfig');

      // 模拟没有当前会话
      vi.spyOn(sessionSelectors, 'currentSession').mockReturnValue(null as any);

      await act(async () => {
        await result.current.updateAgentConfig(config);
      });

      expect(updateSessionConfigMock).not.toHaveBeenCalled();
      updateSessionConfigMock.mockRestore();
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
        await result.current.updateAgentMeta(meta as any);
      });

      expect(updateSessionMock).not.toHaveBeenCalled();
      expect(refreshSessionsMock).not.toHaveBeenCalled();
      updateSessionMock.mockRestore();
      refreshSessionsMock.mockRestore();
    });

    it('should update session meta and refresh sessions', async () => {
      const { result } = renderHook(() => useSessionStore());
      const meta = { title: 'Test Agent' };
      const updateSessionMock = vi.spyOn(sessionService, 'updateSession');
      const refreshSessionsMock = vi.spyOn(result.current, 'refreshSessions');

      // 模拟有当前会话
      vi.spyOn(sessionSelectors, 'currentSession').mockReturnValue({ id: 'session-id' } as any);
      vi.spyOn(result.current, 'activeId', 'get').mockReturnValue('session-id');

      await act(async () => {
        await result.current.updateAgentMeta(meta);
      });

      expect(updateSessionMock).toHaveBeenCalledWith('session-id', { meta });
      expect(refreshSessionsMock).toHaveBeenCalled();
      updateSessionMock.mockRestore();
      refreshSessionsMock.mockRestore();
    });
  });
});
