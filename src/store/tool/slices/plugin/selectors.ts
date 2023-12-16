import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { uniq, uniqBy } from 'lodash-es';
import { Md5 } from 'ts-md5';

import { PLUGIN_SCHEMA_API_MD5_PREFIX, PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { ChatCompletionFunctions } from '@/types/openai/chat';
import { InstallPluginMeta, LobeToolCustomPlugin } from '@/types/tool/plugin';

import { pluginHelpers } from '../../helpers';
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
  installedPlugins(s).map<InstallPluginMeta>((p) => ({
    author: p.manifest?.author,
    createdAt: p.manifest?.createdAt || (p.manifest as any)?.createAt,
    homepage: p.manifest?.homepage,
    identifier: p.identifier,
    meta: getPluginMetaById(p.identifier)(s),
    type: p.type,
  }));
const installedCustomPluginMetaList = (s: ToolStoreState) =>
  installedPluginMetaList(s).filter((p) => p.type === 'customPlugin');

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
          const pluginType =
            manifest.type && manifest.type !== 'default'
              ? `${PLUGIN_SCHEMA_SEPARATOR + manifest.type}`
              : '';

          // 将插件的 identifier 作为前缀，避免重复
          let apiName = manifest.identifier + PLUGIN_SCHEMA_SEPARATOR + m.name + pluginType;

          // OpenAI GPT function_call name can't be longer than 64 characters
          // So we need to use md5 to shorten the name
          // and then find the correct apiName in response by md5
          if (apiName.length >= 64) {
            const md5Content = PLUGIN_SCHEMA_API_MD5_PREFIX + Md5.hashStr(m.name).toString();

            apiName = manifest.identifier + PLUGIN_SCHEMA_SEPARATOR + md5Content + pluginType;
          }

          return {
            ...m,
            name: apiName,
          };
        }),
      );

    return uniqBy(list, 'name');
  };

const enabledPluginsSystemRoles =
  (enabledPlugins: string[] = []) =>
  (s: ToolStoreState) => {
    const toolsSystemRole = enabledPlugins
      .map((id) => {
        const manifest = getPluginManifestById(id)(s);
        if (!manifest) return '';
        const meta = getPluginMetaById(id)(s);

        const title = pluginHelpers.getPluginTitle(meta);
        const desc = pluginHelpers.getPluginDesc(meta);

        return [`### ${title}`, manifest.systemRole || desc].join('\n\n');
      })
      .filter(Boolean);

    if (toolsSystemRole.length > 0) {
      return ['## Tools', 'You can use these tools below:', ...toolsSystemRole]
        .filter(Boolean)
        .join('\n\n');
    }

    return '';
  };

export const pluginSelectors = {
  enabledPluginsSystemRoles,
  enabledSchema,
  getCustomPluginById,
  getInstalledPluginById,
  getPluginManifestById,
  getPluginManifestLoadingStatus,
  getPluginMetaById,
  getPluginSettingsById,
  installedCustomPluginMetaList,
  installedPluginManifestList,
  installedPluginMetaList,
  installedPlugins,
  isPluginHasUI,
  isPluginInstalled,
  storeAndInstallPluginsIdList,
};
