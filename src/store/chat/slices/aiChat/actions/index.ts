import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { AIGenerateAction, generateAIChat } from './generateAIChat';
import { ChatRAGAction, chatRag } from './rag';

export interface ChatAIChatAction extends ChatRAGAction, AIGenerateAction {
  /**/
}

export const chatAiChat: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatAIChatAction
> = (...params) => ({
  ...chatRag(...params),
  ...generateAIChat(...params),
});
