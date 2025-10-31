import { SessionDefaultGroup } from '@lobechat/types';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

interface GlobalState {
  drawerOpen: boolean;
  /**
   * Session 分组展开状态
   * 默认所有分组都展开
   */
  sessionGroupKeys: string[];
  topicDrawerOpen: boolean;
}

interface GlobalActions {
  setDrawerOpen: (open: boolean) => void;
  setSessionGroupKeys: (keys: string[]) => void;
  setTopicDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  toggleTopicDrawer: () => void;
}

export const useGlobalStore = createWithEqualityFn<GlobalState & GlobalActions>()(
  (set, get) => ({
    drawerOpen: false,
    // 默认展开 Pinned 和 Default 分组
    sessionGroupKeys: [SessionDefaultGroup.Pinned, SessionDefaultGroup.Default],
    setDrawerOpen: (open: boolean) => {
      set({ drawerOpen: open });
    },
    setSessionGroupKeys: (sessionGroupKeys: string[]) => {
      set({ sessionGroupKeys });
    },
    setTopicDrawerOpen: (open: boolean) => {
      set({ topicDrawerOpen: open });
    },
    toggleDrawer: () => {
      set({ drawerOpen: !get().drawerOpen });
    },
    toggleTopicDrawer: () => {
      set({ topicDrawerOpen: !get().topicDrawerOpen });
    },
    topicDrawerOpen: false,
  }),
  shallow,
);
