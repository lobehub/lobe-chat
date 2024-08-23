export interface ChatPortalState {
  portalFile?: {
    fileId: string;
  };
  portalToolMessage?: { id: string; identifier: string };
  showPortal: boolean;
}

export const initialChatPortalState: ChatPortalState = {
  showPortal: false,
};
