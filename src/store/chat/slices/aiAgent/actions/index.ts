import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { ChatGroupChatAction, agentGroupSlice } from './agentGroup';
import { GroupOrchestrationAction, groupOrchestrationSlice } from './groupOrchestration';
import { AgentAction, agentSlice } from './runAgent';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChatAIAgentAction extends AgentAction, ChatGroupChatAction, GroupOrchestrationAction {
  /**/
}

export const chatAiAgent: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatAIAgentAction
> = (...params) => ({
  ...agentSlice(...params),
  ...agentGroupSlice(...params),
  ...groupOrchestrationSlice(...params),
});
