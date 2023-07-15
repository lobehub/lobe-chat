export interface ChatState {
  chatLoading: boolean;
  editingMessageId?: string;
}

export const initialChatState: ChatState = {
  chatLoading: false,

  // activeId: null,
  // searchKeywords: '',
  //
};
