import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { ChatCodeInterpreterAction, codeInterpreterSlice } from './interpreter';
import { LocalFileAction, localSystemSlice } from './localSystem';
import { SearchAction, searchSlice } from './search';
import { UserMemoryAction, userMemorySlice } from './userMemory';

export interface ChatBuiltinToolAction
  extends SearchAction,
    LocalFileAction,
    ChatCodeInterpreterAction,
    UserMemoryAction {}

export const chatToolSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatBuiltinToolAction
> = (...params) => ({
  ...searchSlice(...params),
  ...localSystemSlice(...params),
  ...codeInterpreterSlice(...params),
  ...userMemorySlice(...params),
});
