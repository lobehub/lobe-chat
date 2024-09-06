import { ChatMessage } from '@/types/message';

export interface ChatMessageState {
  abortController?: AbortController;
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string;
  /**
   * is the AI message is generating
   */
  chatLoadingIds: string[];
  inputFiles: File[];
  inputMessage: string;
  isCreatingMessage: boolean;
  /**
   * is the message is editing
   */
  messageEditingIds: string[];
  /**
   * is the message is creating or updating in the service
   */
  messageLoadingIds: string[];
  /**
   * is the message is in RAG flow
   */
  messageRAGLoadingIds: string[];
  /**
   * whether messages have fetched
   */
  messagesInit: boolean;
  messagesMap: Record<string, ChatMessage[]>;
  pluginApiLoadingIds: string[];
  /**
   * the tool calling stream ids
   */
  toolCallingStreamIds: Record<string, boolean[]>;
}

export const initialMessageState: ChatMessageState = {
  activeId: 'inbox',
  chatLoadingIds: [],
  inputFiles: [],
  inputMessage: '',
  isCreatingMessage: false,
  messageEditingIds: [],
  messageLoadingIds: [],
  messageRAGLoadingIds: [],
  messagesInit: false,
  messagesMap: {},
  pluginApiLoadingIds: [],
  toolCallingStreamIds: {},
};
