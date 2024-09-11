export interface PortalFile {
  chunkId?: string;
  chunkText?: string;
  fileId: string;
}

export interface ChatPortalState {
  portalFile?: PortalFile;
  portalMessageDetail?: string;
  portalToolMessage?: { id: string; identifier: string };
  showPortal: boolean;
}

export const initialChatPortalState: ChatPortalState = {
  showPortal: false,
};
