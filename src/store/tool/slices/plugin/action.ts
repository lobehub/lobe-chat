import { produce } from 'immer';
import { merge, uniq } from 'lodash-es';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { pluginStoreSelectors } from '@/store/tool/selectors';
import { LobeSessions } from '@/types/session';
import { setNamespace } from '@/utils/storeDebug';

import { ToolStore } from '../../store';
import { PluginDispatch, pluginManifestReducer } from './reducers/manifest';

const n = setNamespace('plugin');

/**
 * 插件接口
 */
export interface PluginAction {
  checkLocalEnabledPlugins: (sessions: LobeSessions) => Promise<void>;
  checkPluginsIsInstalled: (plugins: string[]) => Promise<void>;
  deletePluginSettings: (id: string) => void;
  dispatchPluginManifest: (payload: PluginDispatch) => void;
  resetPluginSettings: () => void;
  updatePluginSettings: <T>(id: string, settings: Partial<T>) => void;
  useCheckPluginsIsInstalled: (plugins: string[]) => SWRResponse;
}

export const createPluginSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  PluginAction
> = (set, get) => ({
  checkLocalEnabledPlugins: async (sessions) => {
    const { checkPluginsIsInstalled } = get();

    let enabledPlugins: string[] = [];

    for (const session of sessions) {
      const plugins = session.config.plugins;
      if (!plugins || plugins.length === 0) continue;

      enabledPlugins = [...enabledPlugins, ...plugins];
    }

    const plugins = uniq(enabledPlugins);

    if (plugins.length === 0) return;
    await checkPluginsIsInstalled(plugins);
  },
  checkPluginsIsInstalled: async (plugins) => {
    // if there is no plugins, just skip.
    if (plugins.length === 0) return;

    const { loadPluginStore, installPlugins } = get();

    // check if the store is empty
    // if it is, we need to load the plugin store
    if (pluginStoreSelectors.onlinePluginStore(get()).length === 0) {
      await loadPluginStore();
    }

    await installPlugins(plugins);

    set({ manifestPrepared: true }, false, n('checkPluginsIsInstalled'));
  },
  deletePluginSettings: (id) => {
    set(
      produce((draft) => {
        draft.pluginsSettings[id] = undefined;
      }),
      false,
      n('deletePluginSettings'),
    );
  },
  dispatchPluginManifest: (payload) => {
    const { pluginManifestMap } = get();
    const nextManifest = pluginManifestReducer(pluginManifestMap, payload);

    set({ pluginManifestMap: nextManifest }, false, n('dispatchPluginManifest', payload));
  },
  resetPluginSettings: () => {
    set({ pluginsSettings: {} }, false, n('resetPluginSettings'));
  },
  updatePluginSettings: (id, settings) => {
    set(
      produce((draft) => {
        draft.pluginsSettings[id] = merge({}, draft.pluginsSettings[id], settings);
      }),
      false,
      n('updatePluginSettings'),
    );
  },
  useCheckPluginsIsInstalled: (plugins) => useSWR(plugins, get().checkPluginsIsInstalled),
});
