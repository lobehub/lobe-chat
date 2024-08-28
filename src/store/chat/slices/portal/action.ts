import { StateCreator } from 'zustand/vanilla';

import { PortalFile } from '@/store/chat/slices/portal/initialState';
import { ChatStore } from '@/store/chat/store';

export interface ChatPortalAction {
  closeFilePreview: () => void;
  closeToolUI: () => void;
  openFilePreview: (portal: PortalFile) => void;
  openToolUI: (messageId: string, identifier: string) => void;
  togglePortal: (open?: boolean) => void;
}

export const chatPortalSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPortalAction
> = (set, get) => ({
  closeFilePreview: () => {
    set({ portalFile: undefined }, false, 'closeFilePreview');
  },
  closeToolUI: () => {
    set({ portalToolMessage: undefined }, false, 'closeToolUI');
  },
  openFilePreview: (portal) => {
    if (!get().showPortal) {
      get().togglePortal(true);
    }

    set({ portalFile: portal }, false, 'openFilePreview');
  },
  openToolUI: (id, identifier) => {
    if (!get().showPortal) {
      get().togglePortal(true);
    }

    set({ portalToolMessage: { id, identifier } }, false, 'openToolUI');
  },
  togglePortal: (open) => {
    const showInspector = open === undefined ? !get().showPortal : open;
    set({ showPortal: showInspector }, false, 'toggleInspector');
  },
});
