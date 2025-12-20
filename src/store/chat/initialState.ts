// sort-imports-ignore
import { ChatToolState, initialToolState } from './slices/builtinTool/initialState';
import { ChatPortalState, initialChatPortalState } from './slices/portal/initialState';
import { ChatMessageState, initialMessageState } from './slices/message/initialState';
import { ChatTopicState, initialTopicState } from './slices/topic/initialState';
import { ChatAIChatState, initialAiChatState } from './slices/aiChat/initialState';
import { ChatThreadState, initialThreadState } from './slices/thread/initialState';
import { ChatOperationState, initialOperationState } from './slices/operation/initialState';
import { initialAiAgentState, ChatAIAgentState } from './slices/aiAgent/initialState';

export type ChatStoreState = ChatTopicState &
  ChatMessageState &
  ChatAIChatState &
  ChatToolState &
  ChatThreadState &
  ChatPortalState &
  ChatAIAgentState &
  ChatOperationState;

export const initialState: ChatStoreState = {
  ...initialMessageState,
  ...initialAiChatState,
  ...initialTopicState,
  ...initialToolState,
  ...initialThreadState,
  ...initialChatPortalState,
  ...initialOperationState,
  ...initialAiAgentState,

  // cloud
};
