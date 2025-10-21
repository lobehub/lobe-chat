import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { ChatAutoSuggestionAction, chatAutoSuggestion } from './autoSuggestion';
import { AIGenerateAction, generateAIChat } from './generateAIChat';
import { AIGenerateV2Action, generateAIChatV2 } from './generateAIChatV2';
import { ChatMemoryAction, chatMemory } from './memory';
import { ChatRAGAction, chatRag } from './rag';

export interface ChatAIChatAction
  extends ChatRAGAction,
    ChatMemoryAction,
    AIGenerateAction,
    AIGenerateV2Action,
    ChatAutoSuggestionAction {
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
  ...chatMemory(...params),
  ...generateAIChatV2(...params),
  ...chatAutoSuggestion(...params),
});
