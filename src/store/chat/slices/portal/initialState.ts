export interface ChatPortalState {
  dockToolMessage?: { id: string; identifier: string };
  showDock: boolean;
}

export const initialChatPortalState: ChatPortalState = {
  showDock: false,
};
