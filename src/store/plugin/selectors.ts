import { PluginStoreState } from './initialState';

const enabledSchema =
  (enabledPlugins: string[] = []) =>
  (s: PluginStoreState) => {
    return Object.values(s.pluginManifestMap)
      .filter((p) => {
        // 如果不存在 enabledPlugins，那么全部不启用
        if (!enabledPlugins) return false;

        // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
        return enabledPlugins.includes(p.name);
      })
      .map((i) => i.schema);
  };

const getPluginMetaByName = (name: string) => (s: PluginStoreState) =>
  s.pluginList?.find((p) => p.name === name);

export const pluginSelectors = {
  enabledSchema,
  getPluginMetaByName,
};
