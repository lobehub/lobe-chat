import type { ChatStoreState } from '@/store/chat';

const artifactMessageId = (s: ChatStoreState) => s.portalToolMessage?.id;
const showPortal = (s: ChatStoreState) => s.showPortal;

const isArtifactMessageUIOpen = (id: string) => (s: ChatStoreState) =>
  artifactMessageId(s) === id && showPortal(s);

export const chatPortalSelectors = {
  artifactMessageId,
  isArtifactMessageUIOpen,
  showArtifactUI: (state: ChatStoreState) => !!state.portalToolMessage,
  showPortal,
  toolUIIdentifier: (state: ChatStoreState) => state.portalToolMessage?.identifier,
};
