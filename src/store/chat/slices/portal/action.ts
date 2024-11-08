import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';
import { PortalArtifact } from '@/types/artifact';

import { PortalFile } from './initialState';

export interface ChatPortalAction {
  closeArtifact: () => void;
  closeFilePreview: () => void;
  closeMessageDetail: () => void;
  closeToolUI: () => void;
  openArtifact: (artifact: PortalArtifact) => void;
  openFilePreview: (portal: PortalFile) => void;
  openMessageDetail: (messageId: string) => void;
  openToolUI: (messageId: string, identifier: string) => void;
  togglePortal: (open?: boolean) => void;
}

export const chatPortalSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPortalAction
> = (set, get) => ({
  closeArtifact: () => {
    get().togglePortal(false);
    set({ portalArtifact: undefined }, false, 'closeArtifact');
  },
  closeFilePreview: () => {
    set({ portalFile: undefined }, false, 'closeFilePreview');
  },
  closeMessageDetail: () => {
    set({ portalMessageDetail: undefined }, false, 'openMessageDetail');
  },
  closeToolUI: () => {
    set({ portalToolMessage: undefined }, false, 'closeToolUI');
  },
  openArtifact: (artifact) => {
    get().togglePortal(true);

    set({ portalArtifact: artifact }, false, 'openArtifact');
  },
  openFilePreview: (portal) => {
    get().togglePortal(true);

    set({ portalFile: portal }, false, 'openFilePreview');
  },
  openMessageDetail: (messageId) => {
    get().togglePortal(true);

    set({ portalMessageDetail: messageId }, false, 'openMessageDetail');
  },
  openToolUI: (id, identifier) => {
    get().togglePortal(true);

    set({ portalToolMessage: { id, identifier } }, false, 'openToolUI');
  },
  togglePortal: (open) => {
    const showInspector = open === undefined ? !get().showPortal : open;
    set({ showPortal: showInspector }, false, 'toggleInspector');
  },
  // updateArtifactContent: (content) => {
  //   set({ portalArtifact: content }, false, 'updateArtifactContent');
  // },
});
