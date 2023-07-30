export interface ChatState {
  activeTopicId?: string;
  chatLoadingId?: string;
  renameTopicId?: string;
  topicLoadingId?: string;
}

export const initialChatState: ChatState = {};
