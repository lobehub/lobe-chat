import { ChatMessage } from '@/types/chatMessage';
import { ChatTopic } from '@/types/topic';

export interface ChatStoreState {
  abortController?: AbortController;
  /**
   * @title 当前活动的会话
   * @description 当前正在编辑或查看的会话
   */
  activeId: string | undefined;
  activeTopicId?: string;
  /**
   * @deprecated
   */
  chatLoadingId?: string;
  fetchMessagesLoading: boolean;
  inputMessage: string;
  messageLoadingIds: [];
  messages: ChatMessage[];
  shareLoading?: boolean;
  topicSearchKeywords: string;
  topics: ChatTopic[];
  topicsInit: boolean;
}

export const initialState: ChatStoreState = {
  activeId: 'inbox',
  fetchMessagesLoading: true,
  inputMessage: '',
  messageLoadingIds: [],
  messages: [],
  topicSearchKeywords: '',
  topics: [],
  topicsInit: false,
};
