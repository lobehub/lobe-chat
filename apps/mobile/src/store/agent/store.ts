import AsyncStorage from '@react-native-async-storage/async-storage';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { createJSONStorage, persist } from 'zustand/middleware';
import { StateCreator } from 'zustand/vanilla';

import { AgentStoreState, initialState } from './initialState';
import { AgentChatAction, createChatSlice } from './slices/chat/action';

/**
 * Agent Store 完整接口
 */
export interface AgentStore extends AgentChatAction, AgentStoreState {}

/**
 * 创建 Agent Store
 */
const createStore: StateCreator<AgentStore> = (...parameters) => ({
  ...initialState,
  ...createChatSlice(...parameters),
});

/**
 * Agent Store Hook
 */
export const useAgentStore = createWithEqualityFn<AgentStore>()(
  persist(createStore, {
    name: 'lobe-chat-agent',
    // 只持久化 agentMap 和 agentConfigInitMap
    partialize: (state) => ({
      agentConfigInitMap: state.agentConfigInitMap,
      agentMap: state.agentMap,
    }),

    storage: createJSONStorage(() => AsyncStorage),
  }),
  shallow,
);

/**
 * 获取 Agent Store 状态
 */
export const getAgentStoreState = () => useAgentStore.getState();
