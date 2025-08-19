// sort-imports-ignore
import { ChatMessageState, initialMessageState } from './slices/message/initialState';
import { ChatAIChatState, initialAiChatState } from './slices/aiChat/initialState';
import { ChatTopicState, initialTopicState } from './slices/topic/initialState';
import { ChatThreadState, initialThreadState } from './slices/thread/initialState';

export type ChatStoreState = ChatTopicState & ChatMessageState & ChatAIChatState & ChatThreadState;

export const initialState: ChatStoreState = {
  ...initialMessageState,
  ...initialAiChatState,
  ...initialTopicState,
  ...initialThreadState,

  // cloud
};
