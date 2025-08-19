import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

interface GlobalState {
  drawerOpen: boolean;
  topicDrawerOpen: boolean;
}

interface GlobalActions {
  setDrawerOpen: (open: boolean) => void;
  setTopicDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  toggleTopicDrawer: () => void;
}

export const useGlobalStore = createWithEqualityFn<GlobalState & GlobalActions>()(
  (set, get) => ({
    drawerOpen: false,
    setDrawerOpen: (open: boolean) => {
      set({ drawerOpen: open });
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
