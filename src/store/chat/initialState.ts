import { ChatToolState, initialToolState } from './slices/builtinTool/initialState';
import { ChatMessageState, initialMessageState } from './slices/message/initialState';
import { ChatShareState, initialShareState } from './slices/share/initialState';
import { ChatTopicState, initialTopicState } from './slices/topic/initialState';

export type ChatStoreState = ChatTopicState & ChatMessageState & ChatToolState & ChatShareState;

export const initialState: ChatStoreState = {
  ...initialMessageState,
  ...initialTopicState,
  ...initialToolState,
  ...initialShareState,
};
