// sort-imports-ignore
import { ChatToolState, initialToolState } from './slices/builtinTool/initialState';
import { ChatPortalState, initialChatPortalState } from './slices/portal/initialState';
import { ChatMessageState, initialMessageState } from './slices/message/initialState';
import { ChatShareState, initialShareState } from './slices/share/initialState';
import { ChatTopicState, initialTopicState } from './slices/topic/initialState';
import { ChatAIChatState, initialAiChatState } from './slices/aiChat/initialState';
import { ChatThreadState, initialThreadState } from './slices/thread/initialState';

export type ChatStoreState = ChatTopicState &
  ChatMessageState &
  ChatAIChatState &
  ChatToolState &
  ChatShareState &
  ChatThreadState &
  ChatPortalState;

export const initialState: ChatStoreState = {
  ...initialMessageState,
  ...initialAiChatState,
  ...initialTopicState,
  ...initialToolState,
  ...initialShareState,
  ...initialThreadState,
  ...initialChatPortalState,

  // cloud
};
