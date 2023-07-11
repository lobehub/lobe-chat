import { StateCreator } from 'zustand/vanilla';

import { promptPickEmoji, promptSummaryAgentName } from '@/prompts/agent';
import { promptSummaryDescription, promptSummaryTitle } from '@/prompts/chat';
import { SessionStore, chatSelectors, sessionSelectors } from '@/store/session';
import { LobeAgentConfig } from '@/types/session';
import { fetchPresetTaskResult } from '@/utils/fetch';

import { SessionLoadingState } from './initialState';

export interface AgentAction {
  /**
   * 自动添加智能体名称
   * @param agentId - 智能体 ID
   */
  autoAddAgentName: (agentId: string) => Promise<void>;

  autoAddChatBasicInfo: (chatId: string) => void;
  autoPickEmoji: (id: string) => void;
  autocompleteAgentMeta: (agentId: string) => Promise<void>;
  /**
   * 切换配置
   * @param showPanel - 是否显示面板
   */
  toggleConfig: (showPanel?: boolean) => void;

  /**
   * 分发智能体信息
   * @param payload - 智能体信息
   */
  updateAgentConfig: (config: Partial<LobeAgentConfig>) => void;
  updateLoadingState: (key: keyof SessionLoadingState, value: boolean) => void;
}

export const createAgentSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  // 使用 AI 自动补齐 Agent 元信息
  autoAddAgentName: async (id) => {
    const { dispatchSession, updateLoadingState } = get();
    const session = sessionSelectors.getSessionById(id)(get());
    if (!session) return;

    const previousTitle = session.meta.title;
    const systemRole = session.config.systemRole;

    // 替换为 ...
    dispatchSession({ id, key: 'title', type: 'updateSessionMeta', value: '...' });

    let title = '';

    await fetchPresetTaskResult({
      onError: () => {
        dispatchSession({
          id,
          key: 'title',
          type: 'updateSessionMeta',
          value: previousTitle || systemRole,
        });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('summarizingTitle', loading);
      },
      onMessageHandle: (text) => {
        title += text;
        dispatchSession({ id, key: 'title', type: 'updateSessionMeta', value: title });
      },
      params: promptSummaryAgentName(systemRole),
    });
  },

  autoAddChatBasicInfo: (chatId) => {
    const session = sessionSelectors.getSessionById(chatId)(get());
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

    const chats = chatSelectors.currentChats(get());

    if (!session) return;
    if (!session.meta.title) {
      fetchPresetTaskResult({
        onLoadingChange: (loading) => {
          get().updateLoadingState('summarizingTitle', loading);
        },
        onMessageHandle: updateMeta('title'),
        params: promptSummaryTitle(chats),
      });
    }

    if (!session.meta.description) {
      fetchPresetTaskResult({
        onLoadingChange: (loading) => {
          get().updateLoadingState('summarizingTitle', loading);
        },
        onMessageHandle: updateMeta('description'),
        params: promptSummaryDescription(chats),
      });
    }
  },

  autoPickEmoji: async (id) => {
    const { dispatchSession } = get();
    const session = sessionSelectors.getSessionById(id)(get());
    if (!session) return;

    const systemRole = session.config.systemRole;

    const emoji = await fetchPresetTaskResult({
      onLoadingChange: (loading) => {
        get().updateLoadingState('pickingEmojiAvatar', loading);
      },
      params: promptPickEmoji(systemRole),
    });

    if (emoji) {
      dispatchSession({ id, key: 'avatar', type: 'updateSessionMeta', value: emoji });
    }
  },
  autocompleteAgentMeta: async (id) => {
    const session = sessionSelectors.getSessionById(id)(get());
    if (!session) return;

    // 没有title 就补充 title
    if (!session.meta.title) {
      get().autoAddAgentName(id);
    }

    // 没有 avatar 就自动挑选 emoji
    if (!session.meta.avatar) {
      get().autoPickEmoji(id);
    }
  },

  toggleConfig: (newValue) => {
    const showAgentSettings = typeof newValue === 'boolean' ? newValue : !get().showAgentSettings;

    set({ showAgentSettings });
  },

  updateAgentConfig: (config) => {
    const { activeId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!activeId || !session) return;

    get().dispatchSession({ config, id: activeId, type: 'updateSessionConfig' });
  },
  updateLoadingState: (key, value) => {
    set({ loading: { ...get().loading, [key]: value } });
  },
});
