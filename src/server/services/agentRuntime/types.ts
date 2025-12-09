import { AgentRuntimeContext } from '@lobechat/agent-runtime';
import { LobeToolManifest } from '@lobechat/context-engine';

export interface AgentExecutionParams {
  approvedToolCall?: any;
  context?: AgentRuntimeContext;
  humanInput?: any;
  operationId: string;
  rejectionReason?: string;
  stepIndex: number;
}

export interface AgentExecutionResult {
  nextStepScheduled: boolean;
  state: any;
  stepResult?: any;
  success: boolean;
}

export interface OperationCreationParams {
  agentConfig?: any;
  appContext: {
    sessionId?: string;
    threadId?: string | null;
    topicId?: string | null;
  };
  autoStart?: boolean;
  initialContext: AgentRuntimeContext;
  initialMessages?: any[];
  modelRuntimeConfig?: any;
  operationId: string;
  toolManifestMap: Record<string, LobeToolManifest>;
  tools?: any[];
  userId?: string;
}

export interface OperationCreationResult {
  autoStarted: boolean;
  messageId?: string;
  operationId: string;
  success: boolean;
}

export interface OperationStatusResult {
  currentState: {
    cost?: any;
    costLimit?: any;
    error?: string;
    interruption?: any;
    lastModified: string;
    maxSteps?: number;
    pendingHumanPrompt?: any;
    pendingHumanSelect?: any;
    pendingToolsCalling?: any;
    status: string;
    stepCount: number;
    usage?: any;
  };
  executionHistory?: any[];
  hasError: boolean;
  isActive: boolean;
  isCompleted: boolean;
  metadata: any;
  needsHumanInput: boolean;
  operationId: string;
  recentEvents?: any[];
  stats: {
    lastActiveTime: number;
    totalCost: number;
    totalMessages: number;
    totalSteps: number;
    uptime: number;
  };
}

export interface PendingInterventionsResult {
  pendingInterventions: Array<{
    lastModified: string;
    modelRuntimeConfig?: any;
    operationId: string;
    pendingHumanPrompt?: any;
    pendingHumanSelect?: any;
    pendingToolsCalling?: any[];
    status: string;
    stepCount: number;
    type: 'tool_approval' | 'human_prompt' | 'human_select';
    userId?: string;
  }>;
  timestamp: string;
  totalCount: number;
}

export interface StartExecutionParams {
  context?: AgentRuntimeContext;
  delay?: number;
  operationId: string;
  priority?: 'high' | 'normal' | 'low';
}

export interface StartExecutionResult {
  messageId: string;
  operationId: string;
  scheduled: boolean;
  success: boolean;
}
