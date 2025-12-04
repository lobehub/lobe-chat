import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { ChatCodeInterpreterAction, codeInterpreterSlice } from './interpreter';
import { KnowledgeBaseAction, knowledgeBaseSlice } from './knowledgeBase';
import { LocalFileAction, localSystemSlice } from './localSystem';
import { SearchAction, searchSlice } from './search';

export interface ChatBuiltinToolAction
  extends SearchAction,
    LocalFileAction,
    ChatCodeInterpreterAction,
    KnowledgeBaseAction {}

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
});
