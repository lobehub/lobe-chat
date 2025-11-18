import type { ChatInputEditor } from '@/features/ChatInput';

export interface ChatAIChatState {
  inputFiles: File[];
  inputMessage: string;
  mainInputEditor: ChatInputEditor | null;
  messageInToolsCallingIds: string[];
  /**
   * is the message is in RAG flow
   */
  messageRAGLoadingIds: string[];
  pluginApiLoadingIds: string[];
  searchWorkflowLoadingIds: string[];
  threadInputEditor: ChatInputEditor | null;
  /**
   * the tool calling stream ids
   */
  toolCallingStreamIds: Record<string, boolean[]>;
}

export const initialAiChatState: ChatAIChatState = {
  inputFiles: [],
  inputMessage: '',
  mainInputEditor: null,
  messageInToolsCallingIds: [],
  messageRAGLoadingIds: [],
  pluginApiLoadingIds: [],
  searchWorkflowLoadingIds: [],
  threadInputEditor: null,
  toolCallingStreamIds: {},
};
