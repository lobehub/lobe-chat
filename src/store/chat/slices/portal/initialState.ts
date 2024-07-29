export interface ChatPortalState {
  portalToolMessage?: { id: string; identifier: string };
  showPortal: boolean;
}

export const initialChatPortalState: ChatPortalState = {
  showPortal: false,
};
