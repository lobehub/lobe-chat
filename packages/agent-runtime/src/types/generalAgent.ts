import { ChatToolPayload, MessageToolCall } from '@lobechat/types';

export interface GeneralAgentCallLLMInstructionPayload {
  isFirstMessage?: boolean;
  messages: any[];
  model: string;
  parentMessageId?: string;
  provider: string;
  tools: any[];
}

export interface GeneralAgentCallLLMResultPayload {
  hasToolsCalling: boolean;
  parentMessageId: string;
  result: { content: string; tool_calls: MessageToolCall[] };
  toolsCalling: ChatToolPayload[];
}

export interface GeneralAgentCallingToolInstructionPayload {
  parentMessageId: string;
  skipCreateToolMessage?: boolean;
  toolCalling: ChatToolPayload;
}

export interface GeneralAgentCallToolResultPayload {
  data: any;
  executionTime: number;
  isSuccess: boolean;
  parentMessageId: string;
  toolCall: ChatToolPayload;
  toolCallId: string;
}

export interface GeneralAgentCallToolsBatchInstructionPayload {
  parentMessageId: string;
  toolsCalling: ChatToolPayload[];
}

export interface GeneralAgentCallToolsBatchResultPayload {
  parentMessageId: string;
  toolCount: number;
  toolResults: GeneralAgentCallToolResultPayload[];
}

export interface GeneralAgentHumanAbortPayload {
  /** Whether there are pending tool calls */
  hasToolsCalling?: boolean;
  /** Parent message ID (assistant message) */
  parentMessageId: string;
  /** Reason for the abort */
  reason: string;
  /** LLM result including content and tool_calls */
  result?: {
    content: string;
    tool_calls?: any[];
  };
  /** Pending tool calls that need to be cancelled */
  toolsCalling?: ChatToolPayload[];
}

export interface GeneralAgentConfig {
  agentConfig?: {
    [key: string]: any;
    maxSteps?: number;
  };
  modelRuntimeConfig?: {
    model: string;
    provider: string;
  };
  sessionId: string;
  userId?: string;
}
