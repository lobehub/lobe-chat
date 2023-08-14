export interface ChatState {
  abortController?: AbortController;
  activeTopicId?: string;
  chatLoadingId?: string;
  renameTopicId?: string;
  topicLoadingId?: string;
}

export const initialChatState: ChatState = {};
