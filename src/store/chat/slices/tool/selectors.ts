import { ChatStoreState } from '@/store/chat';

const isDallEImageGenerating = (id: string) => (s: ChatStoreState) => s.dalleImageLoading[id];

const isGeneratingDallEImage = (s: ChatStoreState) =>
  Object.values(s.dalleImageLoading).some(Boolean);

export const chatToolSelectors = {
  isDallEImageGenerating,
  isGeneratingDallEImage,
};
