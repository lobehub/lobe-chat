import pluginList from '@/plugins';
import { ChatMessage } from '@/types/chatMessage';
import { LobeAgentSession } from '@/types/session';

export const organizeChats = (
  session: LobeAgentSession,
  avatar: { assistant: string; user: string },
) => {
  const getMeta = (message: ChatMessage) => {
    switch (message.role) {
      case 'user': {
        return {
          avatar: avatar.user,
        };
      }

      case 'system': {
        return message.meta;
      }

      case 'assistant': {
        return {
          avatar: avatar.assistant,
          title: session.meta.title,
        };
      }

      case 'function': {
        const plugin = pluginList.find((p) => p.name === message.function_call?.name);
        return {
          avatar: plugin?.avatar || '🧩',
          title: plugin?.name || 'plugin-unknown',
        };
      }
    }
  };

  const basic = Object.values<ChatMessage>(session.chats)
    // 首先按照时间顺序排序，越早的在越前面
    .sort((pre, next) => pre.createAt - next.createAt)
    // 过滤掉包含 topicId 的消息，有主题的消息不应该出现在聊天框中
    .filter((m) => !m.topicId)
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
