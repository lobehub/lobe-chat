export interface SessionLoadingState {
  pickingEmojiAvatar: boolean;
  summarizingDescription: boolean;
  summarizingTitle: boolean;
}
export interface AgentConfigState {
  loading: SessionLoadingState;

  showAgentSettings: boolean;
}

export const initialAgentConfigState: AgentConfigState = {
  // // loading 中间态
  loading: {
    pickingEmojiAvatar: false,
    summarizingDescription: false,
    summarizingTitle: false,
  },

  showAgentSettings: false,
};
