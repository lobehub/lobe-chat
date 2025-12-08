export interface AgentSessionInfo {
  error?: string;
  eventSource?: EventSource;
  lastEventId?: string;
  needsHumanInput?: boolean;
  pendingApproval?: any[];
  pendingPrompt?: any;
  pendingSelect?: any;
  sessionId: string;
  status: string;
  stepCount: number;
  totalCost?: number;
}

export interface ChatAIAgentState {
  /**
   * Agent sessions map, keyed by messageId (assistantMessageId)
   */
  agentSessions: Record<string, AgentSessionInfo>;
}

export const initialAiAgentState: ChatAIAgentState = {
  agentSessions: {},
};
