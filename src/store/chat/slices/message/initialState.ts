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
  inputMessage: string;
  /**
   * is the message is editing
   */
  messageEditingIds: string[];
  /**
   * is the message is creating or updating in the service
   */
  messageLoadingIds: string[];
  messages: ChatMessage[];
  /**
   * whether messages have fetched
   */
  messagesInit: boolean;
}

export const initialMessageState: ChatMessageState = {
  activeId: 'inbox',
  chatLoadingIds: [],
  inputMessage: '',
  messageEditingIds: [],
  messageLoadingIds: [],
  messages: [],
  messagesInit: false,
};
