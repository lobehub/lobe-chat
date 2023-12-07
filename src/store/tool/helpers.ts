import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

import { CustomPlugin } from '@/types/plugin';

const getPluginFormList = (pluginList: LobeChatPluginMeta[], id: string) =>
  pluginList?.find((p) => p.identifier === id);

const getPluginTitle = (meta?: LobeChatPluginMeta['meta']) => meta?.title;
const getPluginDesc = (meta?: LobeChatPluginMeta['meta']) => meta?.description;
const getPluginAvatar = (meta?: LobeChatPluginMeta['meta']) => meta?.avatar || '🧩';

const isCustomPlugin = (id: string, pluginList: CustomPlugin[]) =>
  pluginList.some((i) => i.identifier === id);

export const pluginHelpers = {
  getPluginAvatar,
  getPluginDesc,
  getPluginFormList,
  getPluginTitle,
  isCustomPlugin,
};
