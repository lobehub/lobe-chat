import { StateCreator } from 'zustand/vanilla';

import { promptPickEmoji } from '@/prompts/agent';
import { promptSummaryDescription, promptSummaryTitle } from '@/prompts/chat';
import { SessionStore, chatSelectors, sessionSelectors } from '@/store/session';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig } from '@/types/session';
import { fetchPresetTaskResult } from '@/utils/fetch';

import { SessionLoadingState } from './initialState';

/**
 * 代理行为接口
 */
export interface AgentAction {
  /**
   * 自动选择表情
   * @param id - 表情的 ID
   */
  autoPickEmoji: (id: string) => void;
  /**
   * 自动完成代理描述
   * @param id - 代理的 ID
   * @returns 一个 Promise，用于异步操作完成后的处理
   */
  autocompleteAgentDescription: (id: string) => Promise<void>;

  /**
   * 自动完成代理标题
   * @param id - 代理的 ID
   * @returns 一个 Promise，用于异步操作完成后的处理
   */
  autocompleteAgentTitle: (id: string) => Promise<void>;
  /**
   * 自动完成会话代理元数据
   * @param id - 代理的 ID
   */
  autocompleteSessionAgentMeta: (id: string) => void;

  /**
   * 内部更新代理元数据
   * @param id - 代理的 ID
   * @returns 任意类型的返回值
   */
  internalUpdateAgentMeta: (id: string) => any;
  /**
   * 切换配置
   * @param showPanel - 是否显示面板，默认为 true
   */
  toggleConfig: (showPanel?: boolean) => void;

  /**
   * 更新代理配置
   * @param config - 部分 LobeAgentConfig 的配置
   */
  updateAgentConfig: (config: Partial<LobeAgentConfig>) => void;
  /**
   * 更新加载状态
   * @param key - SessionLoadingState 的键
   * @param value - 加载状态的值
   */
  updateLoadingState: (key: keyof SessionLoadingState, value: boolean) => void;
}

export const createAgentSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
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

  autocompleteAgentDescription: async (id) => {
    const { dispatchSession, updateLoadingState, internalUpdateAgentMeta } = get();
    const session = sessionSelectors.getSessionById(id)(get());
    if (!session) return;

    const chats = chatSelectors.currentChats(get());

    if (chats.length <= 0) return;

    const preValue = session.meta.description;

    // 替换为 ...
    dispatchSession({ id, key: 'description', type: 'updateSessionMeta', value: '...' });

    fetchPresetTaskResult({
      onError: () => {
        dispatchSession({
          id,
          key: 'description',
          type: 'updateSessionMeta',
          value: preValue,
        });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('summarizingDescription', loading);
      },
      onMessageHandle: internalUpdateAgentMeta(id)('description'),
      params: promptSummaryDescription(chats),
    });
  },

  autocompleteAgentTitle: async (id) => {
    const { dispatchSession, updateLoadingState, internalUpdateAgentMeta } = get();
    const session = sessionSelectors.getSessionById(id)(get());
    if (!session) return;

    const chats = chatSelectors.currentChats(get());

    if (chats.length <= 0) return;

    const previousTitle = session.meta.title;

    // 替换为 ...
    dispatchSession({ id, key: 'title', type: 'updateSessionMeta', value: '...' });

    fetchPresetTaskResult({
      onError: () => {
        dispatchSession({ id, key: 'title', type: 'updateSessionMeta', value: previousTitle });
      },
      onLoadingChange: (loading) => {
        updateLoadingState('summarizingTitle', loading);
      },
      onMessageHandle: internalUpdateAgentMeta(id)('title'),
      params: promptSummaryTitle(chats),
    });
  },

  autocompleteSessionAgentMeta: (id) => {
    const session = sessionSelectors.getSessionById(id)(get());

    if (!session) return;
    if (!session.meta.title) {
      get().autocompleteAgentTitle(id);
    }

    if (!session.meta.description) {
      get().autocompleteAgentDescription(id);
    }

    if (!session.meta.avatar) {
      get().autoPickEmoji(id);
    }
  },

  internalUpdateAgentMeta: (id: string) => (key: keyof MetaData) => {
    let value = '';
    return (text: string) => {
      value += text;
      get().dispatchSession({ id, key, type: 'updateSessionMeta', value });
    };
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
