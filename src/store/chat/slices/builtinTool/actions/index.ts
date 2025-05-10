import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { ChatDallEAction, dalleSlice } from './dalle';
import { LocalFileAction, localFileSlice } from './localFile';
import { ChatPollinationsAction, pollinationsSlice } from './pollinations';
import { SearchAction, searchSlice } from './search';

export interface ChatBuiltinToolAction extends ChatDallEAction, SearchAction, LocalFileAction, ChatPollinationsAction {}

export const chatToolSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatBuiltinToolAction
> = (...params) => ({
  ...dalleSlice(...params),
  ...pollinationsSlice(...params),
  ...searchSlice(...params),
  ...localFileSlice(...params),
});
