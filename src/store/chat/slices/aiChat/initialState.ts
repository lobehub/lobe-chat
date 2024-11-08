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
  toolCallingStreamIds: {},
};
