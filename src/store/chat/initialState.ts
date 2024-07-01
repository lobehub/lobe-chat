// sort-imports-ignore
import { ChatToolState, initialToolState } from './slices/builtinTool/initialState';
import { ChatPortalState, initialChatPortalState } from './slices/portal/initialState';
import { ChatMessageState, initialMessageState } from './slices/message/initialState';
import { ChatShareState, initialShareState } from './slices/share/initialState';
import { ChatTopicState, initialTopicState } from './slices/topic/initialState';

export type ChatStoreState = ChatTopicState &
  ChatMessageState &
  ChatToolState &
  ChatShareState &
  ChatPortalState;

export const initialState: ChatStoreState = {
  ...initialMessageState,
  ...initialTopicState,
  ...initialToolState,
  ...initialShareState,
  ...initialChatPortalState,

  // cloud
};
