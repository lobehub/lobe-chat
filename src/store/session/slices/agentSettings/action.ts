import { StateCreator } from 'zustand/vanilla';

import { promptPickEmoji, promptSummaryAgentName } from '@/prompts/agent';
import { promptSummaryDescription, promptSummaryTitle } from '@/prompts/chat';
import { SessionStore, sessionSelectors } from '@/store/session';
import { fetchPresetTaskResult } from '@/utils/fetch';

import { AgentDispatch, agentsReducer } from './reducers/agents';

export interface AgentAction {
  /**
   * 自动添加智能体名称
   * @param agentId - 智能体 ID
   */
  autoAddAgentName: (agentId: string) => Promise<void>;

  autoAddChatBasicInfo: (chatId: string) => void;
  autoPickEmoji: (id: string) => void;
  autocompleteAgentMetaInfo: (agentId: string) => Promise<void>;
  /**
   * 分发智能体信息
   * @param payload - 智能体信息
   */
  dispatchAgent: (payload: AgentDispatch) => void;
}

export const createAgentSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  // 使用 AI 自动补齐 Agent 元信息
  autoAddAgentName: async (id) => {
    const { dispatchAgent } = get();

    const { content } = get().agents[id] || {};
    if (!content) return;

    // 替换为 ...
    dispatchAgent({ id, key: 'title', type: 'updateAgentData', value: '...' });

    let title = '';

    await fetchPresetTaskResult({
      onError: () => {
        dispatchAgent({ id, key: 'title', type: 'updateAgentData', value: content });
      },
      onLoadingChange: (loading) => {
        set({ addingAgentName: loading });
      },
      onMessageHandle: (text) => {
        title += text;
        dispatchAgent({ id, key: 'title', type: 'updateAgentData', value: title });
      },
      params: promptSummaryAgentName(content),
    });
  },

  autoAddChatBasicInfo: (chatId) => {
    const chat = sessionSelectors.getSessionById(chatId)(get());
    const updateMeta = (key: 'title' | 'description') => {
      let value = '';
      return (text: string) => {
        value += text;
        get().dispatchSession({
          id: chatId,
          key,
          type: 'updateSessionMeta',
          value,
        });
      };
    };

    if (!chat) return;
    if (!chat.meta.title) {
      fetchPresetTaskResult({
        onLoadingChange: (loading) => {
          get().updateLoadingState('summarizingTitle', loading);
        },
        onMessageHandle: updateMeta('title'),
        params: promptSummaryTitle(chat.chats),
      });
    }

    if (!chat.meta.description) {
      fetchPresetTaskResult({
        onLoadingChange: (loading) => {
          get().updateLoadingState('summarizingTitle', loading);
        },
        onMessageHandle: updateMeta('description'),
        params: promptSummaryDescription(chat.chats),
      });
    }
  },
  autoPickEmoji: async (id) => {
    const agent = get().agents[id];
    if (!agent) return;
    const emoji = await fetchPresetTaskResult({
      onLoadingChange: (loading) => {
        set({ pickingEmojiAvatar: loading });
      },
      params: promptPickEmoji(agent.content),
    });

    if (emoji) {
      get().dispatchAgent({
        id,
        key: 'avatar',
        type: 'updateAgentData',
        value: emoji,
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
  dispatchAgent: (payload) => {
    const { type, ...res } = payload;

    set({ agents: agentsReducer(get().agents, payload) }, false, {
      payload: res,
      type: `dispatchAgent/${type}`,
    });
  },
});
