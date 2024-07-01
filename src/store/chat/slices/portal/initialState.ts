export interface ChatDockState {
  dockToolMessage?: { id: string; identifier: string };
  showDock: boolean;
}

export const initialChatDockState: ChatDockState = {
  showDock: false,
};
