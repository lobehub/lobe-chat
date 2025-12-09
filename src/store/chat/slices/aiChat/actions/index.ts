import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { ConversationControlAction, conversationControl } from './conversationControl';
import { ConversationLifecycleAction, conversationLifecycle } from './conversationLifecycle';
import { ChatMemoryAction, chatMemory } from './memory';
import { ChatRAGAction, chatRag } from './rag';
import { StreamingExecutorAction, streamingExecutor } from './streamingExecutor';
import { StreamingStatesAction, streamingStates } from './streamingStates';

export interface ChatAIChatAction
  extends ChatRAGAction,
    ChatMemoryAction,
    ConversationLifecycleAction,
    ConversationControlAction,
    StreamingExecutorAction,
    StreamingStatesAction {
  /**/
}

export const chatAiChat: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatAIChatAction
> = (...params) => ({
  ...chatRag(...params),
  ...chatMemory(...params),
  ...conversationLifecycle(...params),
  ...conversationControl(...params),
  ...streamingExecutor(...params),
  ...streamingStates(...params),
});
