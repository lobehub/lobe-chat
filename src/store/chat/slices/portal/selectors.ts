import type { ChatStoreState } from '@/store/chat';

const artifactMessageId = (s: ChatStoreState) => s.portalToolMessage?.id;
const showPortal = (s: ChatStoreState) => s.showPortal;

const isArtifactMessageUIOpen = (id: string) => (s: ChatStoreState) =>
  artifactMessageId(s) === id && showPortal(s);

const showArtifactUI = (s: ChatStoreState) => !!s.portalToolMessage;
const showFilePreview = (s: ChatStoreState) => !!s.portalFile;
const showMessageDetail = (s: ChatStoreState) => !!s.portalMessageDetail;
const previewFileId = (s: ChatStoreState) => s.portalFile?.fileId;
const messageDetailId = (s: ChatStoreState) => s.portalMessageDetail;
const chunkText = (s: ChatStoreState) => s.portalFile?.chunkText;

export const chatPortalSelectors = {
  artifactMessageId,
  chunkText,
  isArtifactMessageUIOpen,
  messageDetailId,
  previewFileId,
  showArtifactUI,
  showFilePreview,
  showMessageDetail,
  showPortal,
  toolUIIdentifier: (s: ChatStoreState) => s.portalToolMessage?.identifier,
};
