import { uniqBy } from 'lodash-es';

import { PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { pluginHelpers } from '@/store/plugin/helpers';
import { ChatCompletionFunctions } from '@/types/openai/chat';

import { PluginStoreState } from './initialState';

const enabledSchema =
  (enabledPlugins: string[] = []) =>
  (s: PluginStoreState): ChatCompletionFunctions[] => {
    // 如果不存在 enabledPlugins，那么全部不启用
    if (!enabledPlugins) return [];

    const list = Object.values(s.pluginManifestMap)
      .filter((p) => {
        // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
        return enabledPlugins.includes(p.identifier);
      })
      .flatMap((manifest) =>
        manifest.api.map((m) => {
          const pluginType = manifest.type ? `${PLUGIN_SCHEMA_SEPARATOR + manifest.type}` : '';

          // 将插件的 identifier 作为前缀，避免重复
          const apiName = manifest.identifier + PLUGIN_SCHEMA_SEPARATOR + m.name + pluginType;

          return {
            ...m,
            name: apiName,
          };
        }),
      );

    return uniqBy(list, 'name');
  };

const pluginList = (s: PluginStoreState) => [...s.pluginList, ...s.customPluginList];

const getPluginMetaById = (id: string) => (s: PluginStoreState) =>
  pluginHelpers.getPluginFormList(pluginList(s), id);

const getDevPluginById = (id: string) => (s: PluginStoreState) =>
  s.customPluginList.find((i) => i.identifier === id);

const getPluginManifestById = (id: string) => (s: PluginStoreState) => s.pluginManifestMap[id];
const getPluginSettingsById = (id: string) => (s: PluginStoreState) => s.pluginsSettings[id];

// 获取插件 manifest 加载状态
const getPluginManifestLoadingStatus = (id: string) => (s: PluginStoreState) => {
  const manifest = getPluginManifestById(id);

  if (s.pluginManifestLoading[id]) return 'loading';

  if (!manifest) return 'error';

  if (!!manifest) return 'success';
};

const isCustomPlugin = (id: string) => (s: PluginStoreState) =>
  pluginHelpers.isCustomPlugin(id, s.customPluginList);

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

const hasPluginUI = (id: string) => (s: PluginStoreState) => {
  const manifest = getPluginManifestById(id)(s);

  return !!manifest?.ui;
};

export const pluginSelectors = {
  displayPluginList,
  enabledSchema,
  getDevPluginById,
  getPluginManifestById,
  getPluginManifestLoadingStatus,
  getPluginMetaById,
  getPluginSettingsById,
  hasPluginUI,
  isCustomPlugin,
  pluginList,
};
