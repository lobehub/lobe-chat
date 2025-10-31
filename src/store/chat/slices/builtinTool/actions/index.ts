import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { ChatDallEAction, dalleSlice } from './dalle';
import { ChatCodeInterpreterAction, codeInterpreterSlice } from './interpreter';
import { LocalFileAction, localSystemSlice } from './localSystem';
import { SearchAction, searchSlice } from './search';
import { UserMemoryAction, userMemorySlice } from './userMemory';

export interface ChatBuiltinToolAction
  extends ChatDallEAction,
    SearchAction,
    LocalFileAction,
    ChatCodeInterpreterAction,
    UserMemoryAction {}

export const chatToolSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatBuiltinToolAction
> = (...params) => ({
  ...dalleSlice(...params),
  ...searchSlice(...params),
  ...localSystemSlice(...params),
  ...codeInterpreterSlice(...params),
  ...userMemorySlice(...params),
});
