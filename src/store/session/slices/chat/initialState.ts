export interface ChatState {
  editingMessageId?: string;
  chatLoading: boolean;
}

export const initialChatState: ChatState = {
  chatLoading: false,

  // activeId: null,
  // searchKeywords: '',
  //
  // // loading 中间态
  // loading: {
  //   summarizingTitle: false,
  //   summarizingDescription: false,
  //   pickingEmojiAvatar: false,
  // },
};
