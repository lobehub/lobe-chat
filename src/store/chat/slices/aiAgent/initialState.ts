export interface AgentOperationInfo {
  error?: string;
  eventSource?: AbortController;
  lastEventId?: string;
  needsHumanInput?: boolean;
  operationId: string;
  pendingApproval?: any[];
  pendingPrompt?: any;
  pendingSelect?: any;
  status: string;
  stepCount: number;
  totalCost?: number;
}

export interface ChatAIAgentState {
  activeGroupId?: string;
  /**
   * Agent operations map, keyed by messageId (assistantMessageId)
   */
  agentOperations: Record<string, AgentOperationInfo>;
}

export const initialAiAgentState: ChatAIAgentState = {
  agentOperations: {},
};
