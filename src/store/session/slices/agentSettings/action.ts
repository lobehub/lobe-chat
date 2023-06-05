import Router from 'next/router';
import { v4 as uuid } from 'uuid';
import { StateCreator } from 'zustand/vanilla';

import { ChatAgent } from '@/types';

import { getSafeAgent, getUniqueAgent } from '@/helpers/agent';
import { promptPickEmoji, promptSummaryAgentName } from '@/prompts/agent';
import { SessionStore } from '@/store/session';
import { fetchPresetTaskResult } from '@/utils/fetch';

import { AgentDispatch, agentsReducer } from './reducers/agents';

export interface AgentAction {
  /**
   * 分发智能体信息
   * @param payload - 智能体信息
   */
  dispatchAgent: (payload: AgentDispatch) => void;

  /**
   * 切换智能体
   * @param [agentId] - 智能体 ID 或 'new'
   */
  switchAgent: (agentId?: string | 'new') => void;

  /**
   * 自动添加智能体名称
   * @param agentId - 智能体 ID
   */
  autoAddAgentName: (agentId: string) => Promise<void>;
  autocompleteAgentMetaInfo: (agentId: string) => Promise<void>;
  findOrCreateAgent: (agent: Omit<ChatAgent, 'id' | 'hash'>) => ChatAgent;
  autoPickEmoji: (id: string) => void;

  removeAgent: (agentId: string) => void;
}

export const createAgentSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  dispatchAgent: (payload) => {
    const { type, ...res } = payload;

    set({ agents: agentsReducer(get().agents, payload) }, false, {
      type: `dispatchAgent/${type}`,
      payload: res,
    });
  },

  findOrCreateAgent: (agent) => {
    let agentId: string;
    const { agent: uniqueAgent, isExist } = getUniqueAgent(get().agents, agent);

    if (isExist) agentId = uniqueAgent.id;
    else {
      agentId = uuid();
      // 只有存在，且有定义角色的时候才会添加
      if (agent.content) {
        get().dispatchAgent({ type: 'addAgent', content: agent.content, id: agentId });
      }
    }
    const safeAgent = getSafeAgent(get().agents, agentId);

    // 只有有定义角色的时候才会添加名称
    if (!!safeAgent && !safeAgent.title) {
      get().autoAddAgentName(agentId);
    }

    return safeAgent;
  },

  switchAgent: (agentId) => {
    if (get().activeId === agentId) return;

    set({ activeId: agentId });

    if (agentId) {
      Router.push(`/agent/${agentId}`);
    }
  },
  removeAgent: (id) => {
    get().dispatchAgent({ type: 'removeAgent', id });
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
});
