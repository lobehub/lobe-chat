import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CustomPlugin } from '@/types/plugin';

import { useToolStore } from '../../store';
import { defaultCustomPlugin } from './initialState';
import { CustomPluginListDispatch } from './reducers/customPluginList';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useToolStore:customPlugin', () => {
  describe('deleteCustomPlugin', () => {
    it('should delete custom plugin and related settings', async () => {
      // 设置初始状态和 mock 函数
      const deletePluginSettingsMock = vi.fn();
      act(() => {
        useToolStore.setState({
          // ...其他状态
          customPluginList: [{ identifier: 'test-plugin' } as CustomPlugin],
          deletePluginSettings: deletePluginSettingsMock,
        });
      });

      const { result } = renderHook(() => useToolStore());
      const pluginId = 'test-plugin';

      act(() => {
        result.current.deleteCustomPlugin(pluginId);
      });

      expect(deletePluginSettingsMock).toHaveBeenCalledWith(pluginId);
      expect(result.current.customPluginList).toEqual([]);
    });
  });

  describe('dispatchCustomPluginList', () => {
    it('should update the custom plugin list based on the dispatched action', () => {
      const initialState = {
        customPluginList: [],
      };
      act(() => {
        useToolStore.setState(initialState);
      });

      const payload = {
        type: 'addItem',
        plugin: { identifier: 'plugin1', meta: { title: 'Test Plugin' } },
      } as CustomPluginListDispatch;

      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.dispatchCustomPluginList(payload);
      });

      expect(useToolStore.getState().customPluginList).toEqual([
        { identifier: 'plugin1', meta: { title: 'Test Plugin' } },
      ]);
    });

    it('should return same if the type is not in dispatch', () => {
      const initialState = {
        customPluginList: [],
      };
      act(() => {
        useToolStore.setState(initialState);
      });

      const payload = {
        type: 'adddItem',
        plugin: { identifier: 'plugin1', meta: { title: 'Test Plugin' } },
      } as unknown as CustomPluginListDispatch;

      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.dispatchCustomPluginList(payload);
      });

      expect(useToolStore.getState().customPluginList).toEqual([]);
    });
  });

  describe('saveToCustomPluginList', () => {
    it('should add a plugin to the custom plugin list and reset newCustomPlugin', async () => {
      const newPlugin = { identifier: 'plugin2', meta: { title: 'New Plugin' } } as CustomPlugin;
      act(() => {
        useToolStore.setState({
          customPluginList: [],
          newCustomPlugin: newPlugin,
        });
      });

      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.saveToCustomPluginList(newPlugin);
      });

      expect(result.current.customPluginList).toEqual([newPlugin]);
      expect(result.current.newCustomPlugin).toEqual(defaultCustomPlugin);
    });
  });
  describe('updateCustomPlugin', () => {
    it('should update a specific plugin in the custom plugin list and reinstall the plugin', () => {
      const pluginId = 'test-plugin';
      const old = {
        identifier: pluginId,
        meta: { title: 'Old Plugin', avatar: '🍎' },
      } as CustomPlugin;

      const installPluginMock = vi.fn();

      act(() => {
        useToolStore.setState({
          customPluginList: [old],
          installPlugin: installPluginMock,
        });
      });

      const { result } = renderHook(() => useToolStore());

      const updatedPlugin = {
        identifier: pluginId,
        meta: { title: 'Updated Plugin', avatar: '🥒' },
      } as CustomPlugin;

      act(() => {
        result.current.updateCustomPlugin(pluginId, updatedPlugin);
      });

      expect(result.current.customPluginList).toEqual([updatedPlugin]);
      expect(installPluginMock).toHaveBeenCalledWith(pluginId);
    });
  });

  describe('updateNewCustomPlugin', () => {
    it('should update the newCustomPlugin state with the provided values', () => {
      const initialNewCustomPlugin = {
        identifier: 'plugin3',
        meta: { title: 'Initial Plugin' },
      } as CustomPlugin;
      const updates = { meta: { title: 'Updated Name' } } as Partial<CustomPlugin>;
      const expectedNewCustomPlugin = { ...initialNewCustomPlugin, ...updates };

      act(() => {
        useToolStore.setState({
          newCustomPlugin: initialNewCustomPlugin,
        });
      });

      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.updateNewCustomPlugin(updates);
      });

      expect(useToolStore.getState().newCustomPlugin).toEqual(expectedNewCustomPlugin);
    });
  });
});
