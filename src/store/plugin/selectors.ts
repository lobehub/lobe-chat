import { PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';

import { PluginStoreState } from './initialState';

const enabledSchema =
  (enabledPlugins: string[] = []) =>
  (s: PluginStoreState) => {
    return Object.values(s.pluginManifestMap)
      .filter((p) => {
        // 如果不存在 enabledPlugins，那么全部不启用
        if (!enabledPlugins) return false;

        // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
        return enabledPlugins.includes(p.identifier);
      })
      .flatMap((manifest) =>
        manifest.api.map((m) => ({
          ...m,
          // 将插件的 identifier 作为前缀，避免重复
          name: manifest.identifier + PLUGIN_SCHEMA_SEPARATOR + m.name,
        })),
      );
  };

const getPluginMetaById = (id: string) => (s: PluginStoreState) =>
  s.pluginList?.find((p) => p.identifier === id);

const getPluginManifestSettingsById = (id: string) => (s: PluginStoreState) =>
  s.pluginManifestMap[id];

export const pluginSelectors = {
  enabledSchema,
  getPluginManifestSettingsById,
  getPluginMetaById,
};
