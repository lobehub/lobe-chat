import { OpenAIChatMessage } from '@/types/openai/chat';

export interface StreamEvent {
  data?: any;
  sessionId?: string;
  stepIndex?: number;
  timestamp: number;
  type:
    | 'connected'
    | 'stream_start'
    | 'stream_chunk'
    | 'stream_end'
    | 'step_start'
    | 'step_complete'
    | 'error'
    | 'heartbeat';
}

export interface StreamConnectionOptions {
  includeHistory?: boolean;
  lastEventId?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onEvent?: (event: StreamEvent) => void;
}

export interface AgentSessionRequest {
  agentConfig?: {
    [key: string]: any;
    costLimit?: {
      currency: string;
      maxTotalCost: number;
      onExceeded: 'stop' | 'interrupt' | 'continue';
    };
    enableRAG?: boolean;
    enableSearch?: boolean;
    humanApprovalRequired?: boolean;
    maxSteps?: number;
  };
  autoStart?: boolean;
  messages: OpenAIChatMessage[];
  modelRuntimeConfig: {
    [key: string]: any;
    model: string;
    provider: string;
  };
  sessionId?: string;
  userMessageId: string;
}

export interface AgentSessionResponse {
  autoStart: boolean;
  createdAt: string;
  firstStep?: {
    context?: any;
    messageId?: string;
    scheduled: boolean;
  };
  sessionId: string;
  status: string;
  success: boolean;
}

export interface HumanInterventionRequest {
  action: 'approve' | 'reject' | 'input' | 'select';
  data?: any;
  reason?: string;
  sessionId: string;
}
