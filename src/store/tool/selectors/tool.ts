import { ToolNameResolver } from '@lobechat/context-engine';
import { pluginPrompts } from '@lobechat/prompts';
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { MetaData } from '@/types/meta';
import { LobeToolMeta } from '@/types/tool/tool';
import { globalAgentContextManager } from '@/utils/client/GlobalAgentContextManager';
import { hydrationPrompt } from '@/utils/promptTemplate';

import { pluginHelpers } from '../helpers';
import { ToolStoreState } from '../initialState';
import { builtinToolSelectors } from '../slices/builtin/selectors';
import { pluginSelectors } from '../slices/plugin/selectors';

const toolNameResolver = new ToolNameResolver();

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
        let systemRole = manifest.systemRole || pluginHelpers.getPluginDesc(meta);

        // Use the global context manager to fill the template
        if (systemRole) {
          const context = globalAgentContextManager.getContext();

          systemRole = hydrationPrompt(systemRole, context);
        }

        return {
          apis: manifest.api.map((m) => ({
            desc: m.description,
            name: toolNameResolver.generate(manifest.identifier, m.name, manifest.type),
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

const metaList = (s: ToolStoreState): LobeToolMeta[] => {
  const pluginList = pluginSelectors.installedPluginMetaList(s) as LobeToolMeta[];

  return builtinToolSelectors.metaList(s).concat(pluginList);
};

const getMetaById =
  (id: string) =>
  (s: ToolStoreState): MetaData | undefined => {
    const item = metaList(s).find((m) => m.identifier === id);

    if (!item) return;

    if (item.meta) return item.meta;

    return {
      avatar: item?.avatar,
      backgroundColor: item?.backgroundColor,
      description: item?.description,
      title: item?.title,
    };
  };

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
  enabledSystemRoles,
  getManifestById,
  getManifestLoadingStatus,
  getMetaById,
  isToolHasUI,
  metaList,
};
