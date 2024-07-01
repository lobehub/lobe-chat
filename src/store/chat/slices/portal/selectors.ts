import type { ChatStoreState } from '@/store/chat';

const toolUIMessageId = (s: ChatStoreState) => s.dockToolMessage?.id;
const showDock = (s: ChatStoreState) => s.showDock;

const isMessageToolUIOpen = (id: string) => (s: ChatStoreState) =>
  toolUIMessageId(s) === id && showDock(s);

export const chatPortalSelectors = {
  isMessageToolUIOpen,
  showDock,
  showToolUI: (state: ChatStoreState) => !!state.dockToolMessage,
  toolUIIdentifier: (state: ChatStoreState) => state.dockToolMessage?.identifier,
  toolUIMessageId,
};
