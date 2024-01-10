import { ChatMessage } from '@/types/message';

export interface ChatMessageState {
  abortController?: AbortController;
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string;
  chatLoadingId?: string;
  inputMessage: string;
  messageLoadingIds: [];
  messages: ChatMessage[];
  /**
   * whether messages have fetched
   */
  messagesInit: boolean;
}

export const initialMessageState: ChatMessageState = {
  activeId: 'inbox',
  inputMessage: '',
  messageLoadingIds: [],
  messages: [],
  messagesInit: false,
};
