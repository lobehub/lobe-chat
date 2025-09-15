import type { ChatInputEditor } from '@/features/ChatInput';

export interface MainSendMessageOperation {
  abortController?: AbortController | null;
  inputEditorTempState?: any | null;
  inputSendErrorMsg?: string;
  isLoading: boolean;
}

export interface ChatAIChatState {
  /**
   * is the AI message is generating
   */
  chatLoadingIds: string[];
  chatLoadingIdsAbortController?: AbortController;
  inputFiles: File[];
  inputMessage: string;
  mainInputEditor: ChatInputEditor | null;
  /**
   * sendMessageInServer operations map, keyed by sessionId|topicId
   * Contains both loading state and AbortController
   */
  mainSendMessageOperations: Record<string, MainSendMessageOperation>;
  messageInToolsCallingIds: string[];
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
  threadInputEditor: ChatInputEditor | null;
  /**
   * the tool calling stream ids
   */
  toolCallingStreamIds: Record<string, boolean[]>;
}

export const initialAiChatState: ChatAIChatState = {
  chatLoadingIds: [],
  inputFiles: [],
  inputMessage: '',
  mainInputEditor: null,
  mainSendMessageOperations: {},
  messageInToolsCallingIds: [],
  messageRAGLoadingIds: [],
  pluginApiLoadingIds: [],
  reasoningLoadingIds: [],
  searchWorkflowLoadingIds: [],
  threadInputEditor: null,
  toolCallingStreamIds: {},
};
