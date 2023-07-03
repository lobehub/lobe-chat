import { StateCreator } from 'zustand/vanilla';

import { promptPickEmoji, promptSummaryAgentName } from '@/prompts/agent';
import { SessionStore, sessionSelectors } from '@/store/session';
import { fetchPresetTaskResult } from '@/utils/fetch';

import { promptSummaryDescription, promptSummaryTitle } from '@/prompts/chat';
import { AgentDispatch, agentsReducer } from './reducers/agents';

export interface AgentAction {
  /**
   * 分发智能体信息
   * @param payload - 智能体信息
   */
  dispatchAgent: (payload: AgentDispatch) => void;

  /**
   * 自动添加智能体名称
   * @param agentId - 智能体 ID
   */
  autoAddAgentName: (agentId: string) => Promise<void>;
  autocompleteAgentMetaInfo: (agentId: string) => Promise<void>;
  autoPickEmoji: (id: string) => void;
  autoAddChatBasicInfo: (chatId: string) => void;
}

export const createAgentSlice: StateCreator<SessionStore, [['zustand/devtools', never]], [], AgentAction> = (
  set,
  get,
) => ({
  dispatchAgent: (payload) => {
    const { type, ...res } = payload;

    set({ agents: agentsReducer(get().agents, payload) }, false, {
      type: `dispatchAgent/${type}`,
      payload: res,
    });
  },

  // 使用 AI 自动补齐 Agent 元信息

  autoAddAgentName: async (id) => {
    const { dispatchAgent } = get();

    const { content } = get().agents[id] || {};
    if (!content) return;

    // 替换为 ...
    dispatchAgent({ type: 'updateAgentData', id, key: 'title', value: '...' });

    let title = '';

    await fetchPresetTaskResult({
      params: promptSummaryAgentName(content),
      onLoadingChange: (loading) => {
        set({ addingAgentName: loading });
      },
      onMessageHandle: (text) => {
        title += text;
        dispatchAgent({ type: 'updateAgentData', id, key: 'title', value: title });
      },
      onError: () => {
        dispatchAgent({ type: 'updateAgentData', id, key: 'title', value: content });
      },
    });
  },
  autoPickEmoji: async (id) => {
    const agent = get().agents[id];
    if (!agent) return;
    const emoji = await fetchPresetTaskResult({
      params: promptPickEmoji(agent.content),
      onLoadingChange: (loading) => {
        set({ pickingEmojiAvatar: loading });
      },
    });

    if (emoji) {
      get().dispatchAgent({
        type: 'updateAgentData',
        id,
        value: emoji,
        key: 'avatar',
      });
    }
  },
  autocompleteAgentMetaInfo: async (id) => {
    const agent = get().agents[id];
    if (!agent) return;

    // 没有title 就补充 title
    if (!agent.title) {
      get().autoAddAgentName(agent.id);
    }

    // 没有 avatar 就自动挑选 emoji
    if (!agent.avatar) {
      get().autoPickEmoji(agent.id);
    }
  },
  autoAddChatBasicInfo: (chatId) => {
    const chat = sessionSelectors.getSessionById(chatId)(get());
    const updateMeta = (key: 'title' | 'description') => {
      let value = '';
      return (text: string) => {
        value += text;
        get().dispatchSession({
          type: 'updateSessionMeta',
          id: chatId,
          key,
          value,
        });
      };
    };

    if (!chat) return;
    if (!chat.meta.title) {
      fetchPresetTaskResult({
        params: promptSummaryTitle(chat.chats),
        onLoadingChange: (loading) => {
          get().updateLoadingState('summarizingTitle', loading);
        },
        onMessageHandle: updateMeta('title'),
      });
    }

    if (!chat.meta.description) {
      fetchPresetTaskResult({
        params: promptSummaryDescription(chat.chats),
        onLoadingChange: (loading) => {
          get().updateLoadingState('summarizingTitle', loading);
        },
        onMessageHandle: updateMeta('description'),
      });
    }
  },
});
