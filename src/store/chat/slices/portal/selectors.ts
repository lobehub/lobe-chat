import type { ChatStoreState } from '@/store/chat';

const showPortal = (s: ChatStoreState) => s.showPortal;

const showMessageDetail = (s: ChatStoreState) => !!s.portalMessageDetail;
const messageDetailId = (s: ChatStoreState) => s.portalMessageDetail;

const showPluginUI = (s: ChatStoreState) => !!s.portalToolMessage;

const toolMessageId = (s: ChatStoreState) => s.portalToolMessage?.id;
const isPluginUIOpen = (id: string) => (s: ChatStoreState) =>
  toolMessageId(s) === id && showPortal(s);
const toolUIIdentifier = (s: ChatStoreState) => s.portalToolMessage?.identifier;

const showFilePreview = (s: ChatStoreState) => !!s.portalFile;
const previewFileId = (s: ChatStoreState) => s.portalFile?.fileId;
const chunkText = (s: ChatStoreState) => s.portalFile?.chunkText;

const showArtifactUI = (s: ChatStoreState) => !!s.portalArtifact;
const artifactTitle = (s: ChatStoreState) => s.portalArtifact?.title;
const artifactIdentifier = (s: ChatStoreState) => s.portalArtifact?.identifier || '';
const artifactMessageId = (s: ChatStoreState) => s.portalArtifact?.id;
const artifactType = (s: ChatStoreState) => s.portalArtifact?.type;
const artifactContent = (s: ChatStoreState) => s.portalArtifact?.children;

/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
export const chatPortalSelectors = {
  isPluginUIOpen,

  previewFileId,
  showFilePreview,
  chunkText,

  messageDetailId,
  showMessageDetail,

  showPluginUI,
  showPortal,

  toolMessageId,
  toolUIIdentifier,

  showArtifactUI,
  artifactTitle,
  artifactIdentifier,
  artifactMessageId,
  artifactType,
  artifactContent,
};
