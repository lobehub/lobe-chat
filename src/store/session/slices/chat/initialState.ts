export interface ChatState {
  abortController?: AbortController;
  activeTopicId?: string;
  chatLoadingId?: string;
  renameTopicId?: string;
  shareLoading?: boolean;
  topicLoadingId?: string;
}

export const initialChatState: ChatState = {};
