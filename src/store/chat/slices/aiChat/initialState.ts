export interface ChatAIChatState {
  /**
   * is the AI message is generating
   */
  chatLoadingIds: string[];
  chatLoadingIdsAbortController?: AbortController;
  inputFiles: File[];
  inputMessage: string;
  /**
   * is the message is in RAG flow
   */
  messageRAGLoadingIds: string[];
  pluginApiLoadingIds: string[];
  /**
   * is the AI message is reasoning
   */
  reasoningLoadingIds: string[];
  searchWorkflowLoadingIds: string[];
  /**
   * the tool calling stream ids
   */
  toolCallingStreamIds: Record<string, boolean[]>;
}

export const initialAiChatState: ChatAIChatState = {
  chatLoadingIds: [],
  inputFiles: [],
  inputMessage: '',
  messageRAGLoadingIds: [],
  pluginApiLoadingIds: [],
  reasoningLoadingIds: [],
  searchWorkflowLoadingIds: [],
  toolCallingStreamIds: {},
};
