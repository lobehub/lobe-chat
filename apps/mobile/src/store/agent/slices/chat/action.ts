import type { PartialDeep } from 'type-fest';
import { StateCreator } from 'zustand/vanilla';

import { LobeAgentConfig } from '@/types/agent';
import { merge } from '@/utils/merge';
import { AgentState } from './initialState';

/**
 * Agent Store 类型定义（完整的 store 接口）
 */
export interface AgentStore extends AgentState, AgentChatAction {}

/**
 * Agent 聊天相关 Actions
 */
export interface AgentChatAction {
  /**
   * 获取指定会话的 Agent 配置
   * @param sessionId - 会话 ID
   */
  getAgentConfigById: (sessionId: string) => LobeAgentConfig;

  /**
   * 内部方法：直接更新 agentMap
   * @param sessionId - 会话 ID
   * @param config - 配置
   */
  internal_updateAgentMap: (sessionId: string, config: PartialDeep<LobeAgentConfig>) => void;

  /**
   * 重置 Agent 配置为默认值
   * @param sessionId - 会话 ID（可选，不传则重置当前会话）
   */
  resetAgentConfig: (sessionId?: string) => void;

  /**
   * 更新 Agent 配置
   * @param config - 要更新的配置
   */
  updateAgentConfig: (config: PartialDeep<LobeAgentConfig>) => Promise<void>;

  /**
   * 更新指定会话的 Agent 配置
   * @param sessionId - 会话 ID
   * @param config - 要更新的配置
   */
  updateAgentConfigById: (sessionId: string, config: PartialDeep<LobeAgentConfig>) => Promise<void>;
}

/**
 * 创建 Agent 聊天 Slice
 */
export const createChatSlice: StateCreator<AgentStore, [], [], AgentChatAction> = (set, get) => ({
  getAgentConfigById: (sessionId) => {
    const state = get();
    const agentConfig = state.agentMap[sessionId];

    // 使用merge函数合并默认配置和会话特定配置
    return merge(state.defaultAgentConfig, agentConfig || {}) as LobeAgentConfig;
  },

  internal_updateAgentMap: (sessionId, config) => {
    set((state) => ({
      agentMap: {
        ...state.agentMap,
        [sessionId]: {
          ...state.agentMap[sessionId],
          ...config,
        },
      },
    }));
  },

  resetAgentConfig: (sessionId) => {
    const targetId = sessionId || get().activeId;

    set((state) => ({
      agentConfigInitMap: {
        ...state.agentConfigInitMap,
        [targetId]: true,
      },
      agentMap: {
        ...state.agentMap,
        [targetId]: {},
      },
    }));
  },

  updateAgentConfig: async (config) => {
    const { activeId } = get();
    await get().updateAgentConfigById(activeId, config);
  },

  updateAgentConfigById: async (sessionId, config) => {
    // 更新 agentMap
    get().internal_updateAgentMap(sessionId, config);

    // 标记为已初始化
    set((state) => ({
      agentConfigInitMap: {
        ...state.agentConfigInitMap,
        [sessionId]: true,
      },
    }));

    // TODO: 如果需要，这里可以添加持久化到服务器的逻辑
    // 移动端暂时只做本地存储
  },
});
