import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { uniqBy } from 'lodash-es';

import { MetaData } from '@/types/meta';
import { ChatCompletionTool } from '@/types/openai/chat';
import { LobeToolMeta } from '@/types/tool/tool';
import { genToolCallingName } from '@/utils/toolCall';

import { pluginHelpers } from '../helpers';
import { ToolStoreState } from '../initialState';
import { builtinToolSelectors } from '../slices/builtin/selectors';
import { pluginSelectors } from '../slices/plugin/selectors';

const enabledSchema =
  (tools: string[] = []) =>
  (s: ToolStoreState): ChatCompletionTool[] => {
    const list = pluginSelectors
      .installedPluginManifestList(s)
      .concat(s.builtinTools.map((b) => b.manifest as LobeChatPluginManifest))
      // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
      .filter((m) => tools.includes(m?.identifier))
      .flatMap((manifest) =>
        manifest.api.map((m) => ({
          description: m.description,
          name: genToolCallingName(manifest.identifier, m.name, manifest.type),
          parameters: m.parameters,
        })),
      );

    return uniqBy(list, 'name').map((i) => ({ function: i, type: 'function' }));
  };

const enabledSystemRoles =
  (tools: string[] = []) =>
  (s: ToolStoreState) => {
    const toolsSystemRole = pluginSelectors
      .installedPluginManifestList(s)
      .concat(s.builtinTools.map((b) => b.manifest as LobeChatPluginManifest))
      // 如果存在 enabledPlugins，那么只启用 enabledPlugins 中的插件
      .filter((m) => tools.includes(m?.identifier))
      .map((manifest) => {
        if (!manifest) return '';

        const meta = manifest.meta || {};

        const title = pluginHelpers.getPluginTitle(meta) || manifest.identifier;
        const systemRole = manifest.systemRole || pluginHelpers.getPluginDesc(meta);

        const methods = manifest.api
          .map((m) =>
            [
              `#### ${genToolCallingName(manifest.identifier, m.name, manifest.type)}`,
              m.description,
            ].join('\n\n'),
          )
          .join('\n\n');

        return [`### ${title}`, systemRole, 'The APIs you can use:', methods].join('\n\n');
      })
      .filter(Boolean);

    if (toolsSystemRole.length > 0) {
      return ['## Tools', 'You can use these tools below:', ...toolsSystemRole]
        .filter(Boolean)
        .join('\n\n');
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

export const toolSelectors = {
  enabledSchema,
  enabledSystemRoles,
  getManifestById,
  getManifestLoadingStatus,
  getMetaById,
  metaList,
};
