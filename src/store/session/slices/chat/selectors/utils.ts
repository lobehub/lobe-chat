import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

import { ChatMessage } from '@/types/chatMessage';
import { MetaData } from '@/types/meta';
import { LobeAgentSession } from '@/types/session';

interface OrganizeParams {
  meta?: {
    assistant?: MetaData;
    user?: MetaData;
  };
  pluginList?: LobeChatPluginMeta[];
  topicId?: string;
}

export const organizeChats = (
  session: LobeAgentSession,
  { topicId, meta, pluginList }: OrganizeParams = {},
) => {
  const getMeta = (message: ChatMessage) => {
    switch (message.role) {
      case 'user': {
        return {
          avatar: meta?.user?.avatar,
        };
      }

      case 'system': {
        return message.meta;
      }

      case 'assistant': {
        return {
          avatar: meta?.assistant?.avatar,
          backgroundColor: meta?.assistant?.backgroundColor,
          title: meta?.assistant?.title || session.meta.title,
        };
      }

      case 'function': {
        const plugin = (pluginList || []).find((m) => m.identifier === message.name);

        return {
          avatar: '🧩',
          title: plugin?.identifier || 'plugin-unknown',
        };
      }
    }
  };

  const basic = Object.values<ChatMessage>(session.chats)
    // 首先按照时间顺序排序，越早的在越前面
    .sort((pre, next) => pre.createAt - next.createAt)
    .filter((m) => {
      // 过滤掉包含 topicId 的消息，有主题的消息不应该出现在聊天框中
      if (!topicId) return !m.topicId;

      // 或者当话题 id 一致时，再展示话题
      return m.topicId === topicId;
    })
    // 映射头像关系
    .map((m) => {
      return {
        ...m,
        meta: getMeta(m),
      };
    });

  const finalList: ChatMessage[] = [];

  const addItem = (item: ChatMessage) => {
    const isExist = finalList.findIndex((i) => item.id === i.id) > -1;
    if (!isExist) {
      finalList.push(item);
    }
  };

  // 基于添加逻辑进行重排序
  for (const item of basic) {
    // 先判存在与否，不存在就加入
    addItem(item);

    for (const another of basic) {
      if (another.parentId === item.id) {
        addItem(another);
      }
    }
  }

  return finalList;
};
