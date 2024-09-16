export interface PortalFile {
  chunkId?: string;
  chunkText?: string;
  fileId: string;
}

export interface PortalArtifact {
  children?: string;
  id: string;
  identifier?: string;
  title?: string;
  type?: string;
}

export interface ChatPortalState {
  portalArtifact?: PortalArtifact;
  portalFile?: PortalFile;
  portalMessageDetail?: string;
  portalToolMessage?: { id: string; identifier: string };
  showPortal: boolean;
}

export const initialChatPortalState: ChatPortalState = {
  showPortal: false,
};
