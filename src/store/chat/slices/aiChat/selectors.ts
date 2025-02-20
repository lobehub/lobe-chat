
import type { ChatStoreState } from '../../initialState';

const isMessageInReasoning = (id: string) => (s: ChatStoreState) =>
  s.reasoningLoadingIds.includes(id);

export const aiChatSelectors = {
  isMessageInReasoning,
};
