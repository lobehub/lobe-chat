import type { ChatStoreState } from '@/store/chat';

const showThread = (s: ChatStoreState) => !!s.threadStartMessageId || !!s.portalThreadId;

const newThreadMode = (s: ChatStoreState) => s.newThreadMode;

const portalCurrentThread = (s: ChatStoreState) => {
  if (!s.portalThreadId || !s.activeTopicId) return;

  return (s.threadMaps[s.activeTopicId] || []).find((t) => t.id === s.portalThreadId);
};

export const portalThreadSelectors = {
  newThreadMode,
  portalCurrentThread,
  showThread,
};
