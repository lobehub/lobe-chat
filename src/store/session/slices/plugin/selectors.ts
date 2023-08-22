import { PluginState } from './initialState';

export const enabledSchema =
  (enabledPlugins: string[] = []) =>
  (s: PluginState) => {
    return Object.values(s.pluginManifestMap)
      .filter((p) => {
        // 如果不存在 enabledPlugins，那么全部不启用
        if (!enabledPlugins) return false;

        // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
        return enabledPlugins.includes(p.name);
      })
      .map((i) => i.schema);
  };

export const pluginSelectors = {
  enabledSchema,
};
