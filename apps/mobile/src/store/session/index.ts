import AsyncStorage from '@react-native-async-storage/async-storage';
import { createWithEqualityFn } from 'zustand/traditional';
import { createJSONStorage, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

import { trpcClient } from '@/services/_auth/trpc';
import { LobeAgentSession } from '@/types/session';

/**
 * 会话 Store 接口定义
 */
export interface SessionStore {
  /**
   * 当前活动的会话 ID
   */
  activeId: string;
  /**
   * 添加新会话
   */
  addSession: (session: LobeAgentSession) => void;

  /**
   * 清空所有会话
   */
  clearSessions: () => void;
  /**
   * 从服务器获取会话列表
   */
  fetchSessions: () => Promise<void>;
  /**
   * 删除会话
   */
  removeSession: (id: string) => void;
  /**
   * 所有会话列表
   */
  sessions: LobeAgentSession[];
  // Actions
  /**
   * 设置当前活动会话
   */
  setActiveSession: (id: string) => void;
  /**
   * 切换当前活动会话并更新访问时间
   */
  switchSession: (id: string) => void;
  /**
   * 更新会话信息
   */
  updateSession: (id: string, updates: Partial<LobeAgentSession>) => void;
}

/**
 * 创建会话管理 Store
 */
export const useSessionStore = createWithEqualityFn<SessionStore>()(
  persist(
    (set) => ({
      activeId: 'inbox',

      addSession: (session) =>
        set((state) => ({
          activeId: session.id,
          sessions: [...state.sessions, session], // 添加新会话时自动设置为活动会话
        })),

      clearSessions: () =>
        set({
          activeId: '',
          sessions: [],
        }),

      fetchSessions: async () => {
        try {
          const result = await trpcClient.session.getGroupedSessions.query();
          set({ sessions: result?.sessions || [] });
        } catch (error) {
          console.error('Failed to fetch sessions:', error);
          throw error;
        }
      },

      removeSession: (id) =>
        set((state) => ({
          // 如果删除的是当前活动会话，则将活动会话设置为剩余会话中的第一个
          activeId:
            state.activeId === id
              ? state.sessions.find((s) => s.id !== id)?.id || ''
              : state.activeId,

          sessions: state.sessions.filter((session) => session.id !== id),
        })),

      // 初始状态
      sessions: [],

      // Actions 实现
      setActiveSession: (id) => set({ activeId: id }),

      // 修改 switchSession 方法
      switchSession: (id) =>
        set(() => ({
          activeId: id,
        })),

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id
              ? {
                  ...session,
                  ...updates,
                  updateAt: Date.now(),
                }
              : session,
          ),
        })),
    }),
    {
      name: 'lobe-chat-sessions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
  shallow,
);
