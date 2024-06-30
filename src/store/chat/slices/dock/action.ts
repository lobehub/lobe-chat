import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

export interface ChatDockAction {
  closeToolUI: () => void;
  openToolUI: (messageId: string, identifier: string) => void;
  toggleDock: (open?: boolean) => void;
}

export const chatDockSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatDockAction
> = (set, get) => ({
  closeToolUI: () => {
    set({ dockToolMessage: undefined }, false, 'openToolUI');
  },
  openToolUI: (id, identifier) => {
    if (!get().showDock) {
      get().toggleDock(true);
    }

    set({ dockToolMessage: { id, identifier } }, false, 'openToolUI');
  },
  toggleDock: (open) => {
    const showInspector = open === undefined ? !get().showDock : open;
    set({ showDock: showInspector }, false, 'toggleInspector');
  },
});
