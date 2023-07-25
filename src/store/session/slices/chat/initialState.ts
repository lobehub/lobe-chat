export interface ChatState {
  activeTopicId?: string;
  chatLoading: boolean;
  topicLoadingId?: string;
}

export const initialChatState: ChatState = {
  chatLoading: false,
};
