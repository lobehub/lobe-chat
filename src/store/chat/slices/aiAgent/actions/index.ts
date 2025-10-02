import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { AgentAction, agentSlice } from './runAgent';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChatAIAgentAction extends AgentAction {
  /**/
}

export const chatAiAgent: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatAIAgentAction
> = (...params) => ({
  ...agentSlice(...params),
});
