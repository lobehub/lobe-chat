import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { uniq, uniqBy } from 'lodash-es';

import { PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { ChatCompletionFunctions } from '@/types/openai/chat';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import type { ToolStoreState } from '../../initialState';

const installedPlugins = (s: ToolStoreState) => s.installedPlugins;

const isPluginInstalled = (id: string) => (s: ToolStoreState) =>
  installedPlugins(s).some((i) => i.identifier === id);

const getInstalledPluginById = (id: string) => (s: ToolStoreState) =>
  installedPlugins(s).find((p) => p.identifier === id);

const getPluginMetaById = (id: string) => (s: ToolStoreState) => {
  // first try to find meta from store
  const storeMeta = s.pluginStoreList.find((i) => i.identifier === id)?.meta;
  if (storeMeta) return storeMeta;

  // then use installed meta
  return getInstalledPluginById(id)(s)?.manifest?.meta;
};

const getCustomPluginById = (id: string) => (s: ToolStoreState) =>
  installedPlugins(s).find((i) => i.identifier === id && i.type === 'customPlugin') as
    | LobeToolCustomPlugin
    | undefined;

const getPluginManifestById = (id: string) => (s: ToolStoreState) =>
  getInstalledPluginById(id)(s)?.manifest;

const getPluginSettingsById = (id: string) => (s: ToolStoreState) =>
  getInstalledPluginById(id)(s)?.settings || {};

// 获取插件 manifest 加载状态
const getPluginManifestLoadingStatus = (id: string) => (s: ToolStoreState) => {
  const manifest = getPluginManifestById(id)(s);

  if (s.pluginInstallLoading[id]) return 'loading';

  if (!manifest) return 'error';

  if (!!manifest) return 'success';
};

const storeAndInstallPluginsIdList = (s: ToolStoreState) =>
  uniq(
    [
      s.installedPlugins.map((i) => i.identifier),
      s.pluginStoreList.map((i) => i.identifier),
    ].flat(),
  );

const installedPluginManifestList = (s: ToolStoreState) =>
  installedPlugins(s)
    .map((i) => i.manifest as LobeChatPluginManifest)
    .filter((i) => !!i);

const installedPluginMetaList = (s: ToolStoreState) =>
  installedPlugins(s).map((p) => ({
    identifier: p.identifier,
    meta: getPluginMetaById(p.identifier)(s),
    type: p.type,
  }));

const isPluginHasUI = (id: string) => (s: ToolStoreState) => {
  const plugin = getPluginManifestById(id)(s);

  return !!plugin?.ui;
};

const enabledSchema =
  (enabledPlugins: string[] = []) =>
  (s: ToolStoreState): ChatCompletionFunctions[] => {
    // 如果不存在 enabledPlugins，那么全部不启用
    if (!enabledPlugins) return [];

    const list = installedPluginManifestList(s)
      .filter((m) =>
        // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
        enabledPlugins.includes(m?.identifier),
      )
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

export const pluginSelectors = {
  enabledSchema,
  getCustomPluginById,
  getInstalledPluginById,
  getPluginManifestById,
  getPluginManifestLoadingStatus,
  getPluginMetaById,
  getPluginSettingsById,
  installedPluginManifestList,
  installedPluginMetaList,
  installedPlugins,
  isPluginHasUI,
  isPluginInstalled,
  storeAndInstallPluginsIdList,
};
