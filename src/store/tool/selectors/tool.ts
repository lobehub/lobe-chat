import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { uniqBy } from 'lodash-es';
import { Md5 } from 'ts-md5';

import { PLUGIN_SCHEMA_API_MD5_PREFIX, PLUGIN_SCHEMA_SEPARATOR } from '@/const/plugin';
import { MetaData } from '@/types/meta';
import { ChatCompletionTool } from '@/types/openai/chat';
import { LobeToolMeta } from '@/types/tool/tool';

import { pluginHelpers } from '../helpers';
import { ToolStoreState } from '../initialState';
import { builtinToolSelectors } from '../slices/builtin/selectors';
import { pluginSelectors } from '../slices/plugin/selectors';

const getAPIName = (identifier: string, name: string, type?: string) => {
  const pluginType = type && type !== 'default' ? `${PLUGIN_SCHEMA_SEPARATOR + type}` : '';

  // 将插件的 identifier 作为前缀，避免重复
  let apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + name + pluginType;

  // OpenAI GPT function_call name can't be longer than 64 characters
  // So we need to use md5 to shorten the name
  // and then find the correct apiName in response by md5
  if (apiName.length >= 64) {
    const md5Content = PLUGIN_SCHEMA_API_MD5_PREFIX + Md5.hashStr(name).toString();

    apiName = identifier + PLUGIN_SCHEMA_SEPARATOR + md5Content + pluginType;
  }

  return apiName;
};

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
          name: getAPIName(manifest.identifier, m.name, manifest.type),
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
            [`#### ${getAPIName(manifest.identifier, m.name, manifest.type)}`, m.description].join(
              '\n\n',
            ),
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

const metaList = (s: ToolStoreState): LobeToolMeta[] => {
  const pluginList = pluginSelectors.installedPluginMetaList(s) as LobeToolMeta[];

  return builtinToolSelectors.metaList(s).concat(pluginList);
};

const getMetaById =
  (id: string) =>
  (s: ToolStoreState): MetaData | undefined =>
    metaList(s).find((m) => m.identifier === id)?.meta;

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
