export interface ChatState {
  activeTopicId?: string;
  chatLoadingId?: string;
  topicLoadingId?: string;
}

export const initialChatState: ChatState = {};
