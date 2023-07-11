export interface ChatState {
  editingMessageId?: string;
  chatLoading: boolean;
}

export const initialChatState: ChatState = {
  chatLoading: false,

  // activeId: null,
  // searchKeywords: '',
  //
};
