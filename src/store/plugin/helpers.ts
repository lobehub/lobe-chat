import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';
import i18n from 'i18next';

import { CustomPlugin } from '@/types/plugin';

const getI18nValue = (value: string | Record<string, string> | undefined) => {
  if (!value) return;

  if (typeof value === 'string') return value;

  if (value[i18n.language]) return value[i18n.language];

  return Object.values(value)[0];
};

const getPluginFormList = (pluginList: LobeChatPluginMeta[], id: string) =>
  pluginList?.find((p) => p.identifier === id);

const getPluginTitle = (meta?: LobeChatPluginMeta['meta']) => getI18nValue(meta?.title);
const getPluginDesc = (meta?: LobeChatPluginMeta['meta']) => getI18nValue(meta?.description);
const getPluginAvatar = (meta?: LobeChatPluginMeta['meta']) => meta?.avatar;

const isCustomPlugin = (id: string, pluginList: CustomPlugin[]) =>
  pluginList.some((i) => i.identifier === id);

export const pluginHelpers = {
  getPluginAvatar,
  getPluginDesc,
  getPluginFormList,
  getPluginTitle,
  isCustomPlugin,
};
