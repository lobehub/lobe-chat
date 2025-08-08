import { ChatAIChatState, initialAiChatState } from './slices/aiChat/initialState';
import { ChatMessageState, initialMessageState } from './slices/message/initialState';
import { ChatTopicState, initialTopicState } from './slices/topic/initialState';
import { ChatPortalState, initialChatPortalState } from './slices/portal/initialState';
import { ChatShareState, initialShareState } from './slices/share/initialState';
import { ChatThreadState, initialThreadState } from './slices/thread/initialState';
import { ChatToolState, initialToolState } from './slices/builtinTool/initialState';

export interface ChatStoreState
  extends ChatAIChatState,
    ChatMessageState,
    ChatTopicState,
    ChatPortalState,
    ChatShareState,
    ChatThreadState,
    ChatToolState {
  // 所有slice的state接口已集成
}

export const initialState: ChatStoreState = {
  // 从各个slice导入初始状态
  ...initialAiChatState,
  ...initialMessageState,
  ...initialTopicState,
  ...initialChatPortalState,
  ...initialShareState,
  ...initialThreadState,
  ...initialToolState,
};
