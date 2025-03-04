import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { pluginPrompts } from '@/prompts/plugin';
import { MetaData } from '@/types/meta';
import { ChatCompletionTool } from '@/types/openai/chat';
import { LobeToolMeta } from '@/types/tool/tool';
import { genToolCallingName } from '@/utils/toolCall';
import { convertPluginManifestToToolsCalling } from '@/utils/toolManifest';

import { pluginHelpers } from '../helpers';
import { ToolStoreState } from '../initialState';
import { builtinToolSelectors } from '../slices/builtin/selectors';
import { pluginSelectors } from '../slices/plugin/selectors';

const enabledSchema =
  (tools: string[] = []) =>
  (s: ToolStoreState): ChatCompletionTool[] => {
    const manifests = pluginSelectors
      .installedPluginManifestList(s)
      .concat(s.builtinTools.map((b) => b.manifest as LobeChatPluginManifest))
      // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
      .filter((m) => tools.includes(m?.identifier));

    return convertPluginManifestToToolsCalling(manifests);
  };

const enabledSystemRoles =
  (tools: string[] = []) =>
  (s: ToolStoreState) => {
    const toolsSystemRole = pluginSelectors
      .installedPluginManifestList(s)
      .concat(s.builtinTools.map((b) => b.manifest as LobeChatPluginManifest))
      // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
      .filter((m) => m && tools.includes(m.identifier))
      .map((manifest) => {
        const meta = manifest.meta || {};

        const title = pluginHelpers.getPluginTitle(meta) || manifest.identifier;
        const systemRole = manifest.systemRole || pluginHelpers.getPluginDesc(meta);

        return {
          apis: manifest.api.map((m) => ({
            desc: m.description,
            name: genToolCallingName(manifest.identifier, m.name, manifest.type),
          })),
          identifier: manifest.identifier,
          name: title,
          systemRole,
        };
      });

    if (toolsSystemRole.length > 0) {
      return pluginPrompts({ tools: toolsSystemRole });
    }

    return '';
  };

const metaList =
  (showDalle?: boolean) =>
  (s: ToolStoreState): LobeToolMeta[] => {
    const pluginList = pluginSelectors.installedPluginMetaList(s) as LobeToolMeta[];

    return builtinToolSelectors.metaList(showDalle)(s).concat(pluginList);
  };

const getMetaById =
  (id: string, showDalle: boolean = true) =>
  (s: ToolStoreState): MetaData | undefined =>
    metaList(showDalle)(s).find((m) => m.identifier === id)?.meta;

const getManifestById =
  (id: string) =>
  (s: ToolStoreState): LobeChatPluginManifest | undefined =>
    pluginSelectors
      .installedPluginManifestList(s)
      .concat(s.builtinTools.map((b) => b.manifest as LobeChatPluginManifest))
      .find((i) => i.identifier === id);

// 获取插件 manifest 加载状态
const getManifestLoadingStatus = (id: string) => (s: ToolStoreState) => {
  const manifest = getManifestById(id)(s);

  if (s.pluginInstallLoading[id]) return 'loading';

  if (!manifest) return 'error';

  if (!!manifest) return 'success';
};

const isToolHasUI = (id: string) => (s: ToolStoreState) => {
  const manifest = getManifestById(id)(s);
  if (!manifest) return false;
  const builtinTool = s.builtinTools.find((tool) => tool.identifier === id);

  if (builtinTool && builtinTool.type === 'builtin') {
    return true;
  }

  return !!manifest.ui;
};

export const toolSelectors = {
  enabledSchema,
  enabledSystemRoles,
  getManifestById,
  getManifestLoadingStatus,
  getMetaById,
  isToolHasUI,
  metaList,
};
