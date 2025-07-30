import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

interface GlobalState {
  drawerOpen: boolean;
}

interface GlobalActions {
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
}

export const useGlobalStore = createWithEqualityFn<GlobalState & GlobalActions>()(
  (set, get) => ({
    drawerOpen: false,
    setDrawerOpen: (open: boolean) => {
      set({ drawerOpen: open });
    },
    toggleDrawer: () => {
      set({ drawerOpen: !get().drawerOpen });
    },
  }),
  shallow,
);
