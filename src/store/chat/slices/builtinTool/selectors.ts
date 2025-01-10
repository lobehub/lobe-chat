import { ChatStoreState } from '@/store/chat';

const isDallEImageGenerating = (id: string) => (s: ChatStoreState) => s.dalleImageLoading[id];

const isGeneratingDallEImage = (s: ChatStoreState) =>
  Object.values(s.dalleImageLoading).some(Boolean);

const isSearXNGSearching = (id: string) => (s: ChatStoreState) => s.searchLoading[id];

export const chatToolSelectors = {
  isDallEImageGenerating,
  isGeneratingDallEImage,
  isSearXNGSearching,
};
