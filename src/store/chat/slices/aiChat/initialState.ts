export interface ChatAIChatState {
  abortController?: AbortController;
  /**
   * is the AI message is generating
   */
  chatLoadingIds: string[];
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
  toolCallingStreamIds: {},
};
