import { uniqBy } from 'lodash-es';

import { PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { ChatCompletionFunctions } from '@/types/openai/chat';

import { pluginHelpers } from '../../helpers';
import type { ToolStoreState } from '../../initialState';

const enabledSchema =
  (enabledPlugins: string[] = []) =>
  (s: ToolStoreState): ChatCompletionFunctions[] => {
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

const pluginList = (s: ToolStoreState) => [...s.pluginList, ...s.customPluginList];

const getPluginMetaById = (id: string) => (s: ToolStoreState) =>
  pluginHelpers.getPluginFormList(pluginList(s), id);

const getDevPluginById = (id: string) => (s: ToolStoreState) =>
  s.customPluginList.find((i) => i.identifier === id);

const getPluginManifestById = (id: string) => (s: ToolStoreState) => s.pluginManifestMap[id];
const getPluginSettingsById = (id: string) => (s: ToolStoreState) => s.pluginsSettings[id];

// 获取插件 manifest 加载状态
const getPluginManifestLoadingStatus = (id: string) => (s: ToolStoreState) => {
  const manifest = getPluginManifestById(id)(s);

  if (s.pluginInstallLoading[id]) return 'loading';

  if (!manifest) return 'error';

  if (!!manifest) return 'success';
};

const displayPluginList = (s: ToolStoreState) =>
  pluginList(s).map((p) => ({
    author: p.author,
    avatar: p.meta?.avatar,
    createAt: p.createAt,
    desc: pluginHelpers.getPluginDesc(p.meta),
    homepage: p.homepage,
    identifier: p.identifier,
    title: pluginHelpers.getPluginTitle(p.meta),
  }));

const hasPluginUI = (id: string) => (s: ToolStoreState) => {
  const manifest = getPluginManifestById(id)(s);

  return !!manifest?.ui;
};

const installedPlugins = (s: ToolStoreState) => Object.values(s.pluginManifestMap);
const isPluginInstalled = (id: string) => (s: ToolStoreState) => !!s.pluginManifestMap[id];

export const pluginSelectors = {
  displayPluginList,
  enabledSchema,
  getDevPluginById,
  getPluginManifestById,
  getPluginManifestLoadingStatus,
  getPluginMetaById,
  getPluginSettingsById,
  hasPluginUI,
  installedPlugins,
  isPluginInstalled,
  pluginList,
};
