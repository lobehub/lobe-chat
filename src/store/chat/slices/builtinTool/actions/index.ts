import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { ChatDallEAction, dalleSlice } from './dalle';
import { LocalFileAction, localFileSlice } from './localFile';
import { SearchAction, searchSlice } from './search';

export interface ChatBuiltinToolAction extends ChatDallEAction, SearchAction, LocalFileAction {}

export const chatToolSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatBuiltinToolAction
> = (...params) => ({
  ...dalleSlice(...params),
  ...searchSlice(...params),
  ...localFileSlice(...params),
});
