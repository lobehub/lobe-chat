import { PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { pluginHelpers } from '@/store/plugin/helpers';

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

const pluginList = (s: PluginStoreState) => [...s.pluginList, ...s.devPluginList];

const getPluginMetaById = (id: string) => (s: PluginStoreState) =>
  pluginHelpers.getPluginFormList(pluginList(s), id);

const getPluginManifestById = (id: string) => (s: PluginStoreState) => s.pluginManifestMap[id];
const getPluginSettingsById = (id: string) => (s: PluginStoreState) => s.pluginsSettings[id];

// 获取插件 manifest 加载状态
const getPluginManifestLoadingStatus = (id: string) => (s: PluginStoreState) => {
  const manifest = getPluginManifestById(id);

  if (s.pluginManifestLoading[id]) return 'loading';

  if (!manifest) return 'error';

  if (!!manifest) return 'success';
};

const displayPluginList = (s: PluginStoreState) =>
  pluginList(s).map((p) => ({
    author: p.author,
    avatar: p.meta?.avatar,
    createAt: p.createAt,
    desc: pluginHelpers.getPluginDesc(p.meta),
    homepage: p.homepage,
    identifier: p.identifier,
    title: pluginHelpers.getPluginTitle(p.meta),
  }));

export const pluginSelectors = {
  displayPluginList,
  enabledSchema,
  getPluginManifestById,
  getPluginManifestLoadingStatus,
  getPluginMetaById,
  getPluginSettingsById,
  pluginList,
};
