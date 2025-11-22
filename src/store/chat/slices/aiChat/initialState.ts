import type { ChatInputEditor } from '@/features/ChatInput';

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

export interface ChatAIChatState {
  /**
   * Agent sessions map, keyed by messageId (assistantMessageId)
   */
  agentSessions: Record<string, AgentSessionInfo>;
  inputFiles: File[];
  inputMessage: string;
  mainInputEditor: ChatInputEditor | null;
  /**
   * is the message is in RAG flow
   */
  messageRAGLoadingIds: string[];
  searchWorkflowLoadingIds: string[];
  threadInputEditor: ChatInputEditor | null;
  /**
   * the tool calling stream ids
   */
  toolCallingStreamIds: Record<string, boolean[]>;
}

export const initialAiChatState: ChatAIChatState = {
  agentSessions: {},
  inputFiles: [],
  inputMessage: '',
  mainInputEditor: null,
  messageRAGLoadingIds: [],
  searchWorkflowLoadingIds: [],
  threadInputEditor: null,
  toolCallingStreamIds: {},
};
