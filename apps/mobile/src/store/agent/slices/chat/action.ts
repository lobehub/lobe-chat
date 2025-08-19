import { SWRResponse } from 'swr';
import type { PartialDeep } from 'type-fest';
import { StateCreator } from 'zustand/vanilla';

import { merge } from '@/utils/merge';
import { AgentState } from './initialState';
import { LobeAgentChatConfig, LobeAgentConfig } from '@/types/agent';
import { KnowledgeItem } from '@/types/knowledgeBase';

/**
 * Agent Store 类型定义（完整的 store 接口）
 */
export interface AgentStore extends AgentState, AgentChatAction {}

/**
 * Agent 聊天相关 Actions (与 web 端完全一致)
 */
export interface AgentChatAction {
  /**
   * 添加文件到 Agent
   */
  addFilesToAgent: (fileIds: string[], enabled?: boolean) => Promise<void>;

  /**
   * 添加知识库到 Agent
   */
  addKnowledgeBaseToAgent: (knowledgeBaseId: string) => Promise<void>;

  /**
   * 获取指定会话的 Agent 配置
   * @param sessionId - 会话 ID
   */
  getAgentConfigById: (sessionId: string) => LobeAgentConfig;

  /**
   * 内部方法：创建中止控制器
   */
  internal_createAbortController: (key: keyof AgentState) => AbortController;

  /**
   * 内部方法：分发 AgentMap 更新
   */
  internal_dispatchAgentMap: (
    id: string,
    config: PartialDeep<LobeAgentConfig>,
    actions?: string,
  ) => void;

  /**
   * 内部方法：刷新 Agent 配置
   */
  internal_refreshAgentConfig: (id: string) => Promise<void>;

  /**
   * 内部方法：刷新 Agent 知识库
   */
  internal_refreshAgentKnowledge: () => Promise<void>;

  /**
   * 内部方法：更新 Agent 配置
   */
  internal_updateAgentConfig: (
    id: string,
    data: PartialDeep<LobeAgentConfig>,
    signal?: AbortSignal,
  ) => Promise<void>;

  /**
   * 内部方法：直接更新 agentMap (移动端兼容)
   * @param sessionId - 会话 ID
   * @param config - 配置
   */
  internal_updateAgentMap: (sessionId: string, config: PartialDeep<LobeAgentConfig>) => void;

  /**
   * 从 Agent 移除文件
   */
  removeFileFromAgent: (fileId: string) => Promise<void>;

  /**
   * 从 Agent 移除知识库
   */
  removeKnowledgeBaseFromAgent: (knowledgeBaseId: string) => Promise<void>;

  /**
   * 移除插件
   */
  removePlugin: (id: string) => void;

  /**
   * 重置 Agent 配置为默认值
   * @param sessionId - 会话 ID（可选，不传则重置当前会话）
   */
  resetAgentConfig: (sessionId?: string) => void;

  /**
   * 切换文件状态
   */
  toggleFile: (id: string, open?: boolean) => Promise<void>;

  /**
   * 切换知识库状态
   */
  toggleKnowledgeBase: (id: string, open?: boolean) => Promise<void>;

  /**
   * 切换插件状态
   */
  togglePlugin: (id: string, open?: boolean) => Promise<void>;

  /**
   * 更新 Agent 聊天配置
   */
  updateAgentChatConfig: (config: Partial<LobeAgentChatConfig>) => Promise<void>;

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

  /**
   * 使用 SWR 获取 Agent 配置
   */
  useFetchAgentConfig: (isLogin: boolean | undefined, id: string) => SWRResponse<LobeAgentConfig>;

  /**
   * 使用 SWR 获取文件和知识库
   */
  useFetchFilesAndKnowledgeBases: () => SWRResponse<KnowledgeItem[]>;

  /**
   * 使用 SWR 初始化 Inbox Agent Store
   */
  useInitInboxAgentStore: (
    isLogin: boolean | undefined,
    defaultAgentConfig?: PartialDeep<LobeAgentConfig>,
  ) => SWRResponse<PartialDeep<LobeAgentConfig>>;
}

/**
 * 创建 Agent 聊天 Slice
 */
export const createChatSlice: StateCreator<AgentStore, [], [], AgentChatAction> = (set, get) => ({
  // 文件相关方法 (移动端简化实现)
  addFilesToAgent: async (fileIds, enabled) => {
    // TODO: 移动端暂不实现文件功能，提供占位实现
    console.log('addFilesToAgent not implemented in mobile', { enabled, fileIds });
  },

  addKnowledgeBaseToAgent: async (knowledgeBaseId) => {
    // TODO: 移动端暂不实现知识库功能，提供占位实现
    console.log('addKnowledgeBaseToAgent not implemented in mobile', { knowledgeBaseId });
  },

  getAgentConfigById: (sessionId) => {
    const state = get();
    const agentConfig = state.agentMap[sessionId];

    // 使用merge函数合并默认配置和会话特定配置
    return merge(state.defaultAgentConfig, agentConfig || {}) as LobeAgentConfig;
  },

  internal_createAbortController: (key) => {
    const abortController = get()[key] as AbortController;
    if (abortController) abortController.abort('新请求取消之前的请求');
    const controller = new AbortController();
    set({ [key]: controller }, false);

    return controller;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  internal_dispatchAgentMap: (id, config, _actions) => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    const currentAgentMap = get().agentMap;
    const existingConfig = currentAgentMap[id];

    const newConfig = existingConfig ? merge(existingConfig, config) : config;

    // 检查是否有实际变化
    if (JSON.stringify(existingConfig) === JSON.stringify(newConfig)) return;

    set((state) => ({
      agentMap: {
        ...state.agentMap,
        [id]: newConfig,
      },
    }));
  },

  internal_refreshAgentConfig: async (id) => {
    // TODO: 移动端暂不实现服务器刷新，提供占位实现
    console.log('internal_refreshAgentConfig not implemented in mobile', { id });
  },

  internal_refreshAgentKnowledge: async () => {
    // TODO: 移动端暂不实现知识库刷新，提供占位实现
    console.log('internal_refreshAgentKnowledge not implemented in mobile');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  internal_updateAgentConfig: async (id, data, _signal) => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    // 移动端简化实现：乐观更新，暂不同步服务器
    get().internal_dispatchAgentMap(id, data, 'optimistic_updateAgentConfig');

    // TODO: 如果需要，这里可以添加持久化到服务器的逻辑
    console.log('internal_updateAgentConfig simplified for mobile', { data, id });
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

  removeFileFromAgent: async (fileId) => {
    // TODO: 移动端暂不实现文件功能，提供占位实现
    console.log('removeFileFromAgent not implemented in mobile', { fileId });
  },

  removeKnowledgeBaseFromAgent: async (knowledgeBaseId) => {
    // TODO: 移动端暂不实现知识库功能，提供占位实现
    console.log('removeKnowledgeBaseFromAgent not implemented in mobile', { knowledgeBaseId });
  },

  removePlugin: (id) => {
    // TODO: 移动端暂不实现插件功能，提供占位实现
    console.log('removePlugin not implemented in mobile', { id });
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

  toggleFile: async (id, open) => {
    // TODO: 移动端暂不实现文件功能，提供占位实现
    console.log('toggleFile not implemented in mobile', { id, open });
  },

  toggleKnowledgeBase: async (id, open) => {
    // TODO: 移动端暂不实现知识库功能，提供占位实现
    console.log('toggleKnowledgeBase not implemented in mobile', { id, open });
  },

  togglePlugin: async (id, open) => {
    // TODO: 移动端暂不实现插件功能，提供占位实现
    console.log('togglePlugin not implemented in mobile', { id, open });
  },

  updateAgentChatConfig: async (config) => {
    const { activeId } = get();
    if (!activeId) return;

    await get().updateAgentConfig({ chatConfig: config });
  },

  updateAgentConfig: async (config) => {
    const { activeId } = get();
    if (!activeId) return;

    const controller = get().internal_createAbortController('updateAgentConfigSignal');
    await get().internal_updateAgentConfig(activeId, config, controller.signal);
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

  useFetchAgentConfig: (isLogin, sessionId) => {
    // TODO: 移动端暂不实现 SWR 功能，返回 mock 对象
    return {
      data: get().getAgentConfigById(sessionId),
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: async () => {},
    } as SWRResponse<LobeAgentConfig>;
  },

  useFetchFilesAndKnowledgeBases: () => {
    // TODO: 移动端暂不实现知识库功能，返回空数组
    return {
      data: [],
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: async () => {},
    } as SWRResponse<KnowledgeItem[]>;
  },

  useInitInboxAgentStore: (isLogin, defaultAgentConfig) => {
    // TODO: 移动端暂不实现 Inbox 初始化，返回 mock 对象
    return {
      data: defaultAgentConfig || {},
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: async () => {},
    } as SWRResponse<PartialDeep<LobeAgentConfig>>;
  },
});
