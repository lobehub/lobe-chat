import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { AIGenerateAction, generateAIChat } from './generateAIChat';
import { AIGenerateV2Action, generateAIChatV2 } from './generateAIChatV2';

export interface ChatAIChatAction extends AIGenerateAction, AIGenerateV2Action {
  /**/
}

export const chatAiChat: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatAIChatAction
> = (...params) => ({
  ...generateAIChat(...params),
  ...generateAIChatV2(...params),
});
