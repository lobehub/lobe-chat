import { ChatMessage } from '@/types/message';

export interface ChatMessageState {
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string;

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
   * whether messages have fetched
   */
  messagesInit: boolean;
  messagesMap: Record<string, ChatMessage[]>;
}

export const initialMessageState: ChatMessageState = {
  activeId: 'inbox',
  isCreatingMessage: false,
  messageEditingIds: [],
  messageLoadingIds: [],
  messagesInit: false,
  messagesMap: {},
};
