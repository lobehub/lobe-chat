import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { AgentBuilderAction, agentBuilderSlice } from './agentBuilder';
import { ChatCodeInterpreterAction, codeInterpreterSlice } from './interpreter';
import { KnowledgeBaseAction, knowledgeBaseSlice } from './knowledgeBase';
import { LocalFileAction, localSystemSlice } from './localSystem';
import { SearchAction, searchSlice } from './search';
import { UserMemoryAction, userMemorySlice } from './userMemory';

export interface ChatBuiltinToolAction
  extends SearchAction,
    LocalFileAction,
    ChatCodeInterpreterAction,
    KnowledgeBaseAction,
    UserMemoryAction,
    AgentBuilderAction {}

export const chatToolSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatBuiltinToolAction
> = (...params) => ({
  ...searchSlice(...params),
  ...localSystemSlice(...params),
  ...codeInterpreterSlice(...params),
  ...knowledgeBaseSlice(...params),
  ...userMemorySlice(...params),
  ...agentBuilderSlice(...params),
});
