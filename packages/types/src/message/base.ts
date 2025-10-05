/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */
import type { ILobeAgentRuntimeErrorType } from '@lobechat/model-runtime';
import type { IPluginErrorType } from '@lobehub/chat-plugin-sdk';

import { ErrorType } from '../fetch';
import { GroundingSearch } from '../search';
import { ChatImageItem } from './image';
import { ChatToolPayload, MessageToolCall } from './tools';

/**
 * 聊天消息错误对象
 */
export interface ChatMessageError {
  body?: any;
  message: string;
  type: ErrorType | IPluginErrorType | ILobeAgentRuntimeErrorType;
}

export interface ChatCitationItem {
  id?: string;
  onlyUrl?: boolean;
  title?: string;
  url: string;
}

export interface ModelReasoning {
  content?: string;
  duration?: number;
  signature?: string;
}

export interface ModelTokensUsage {
  // Input tokens breakdown
  /**
   * user prompt input
   */
  // Input cache tokens
  inputCachedTokens?: number;
  inputCacheMissTokens?: number;
  inputWriteCacheTokens?: number;

  inputTextTokens?: number;
  /**
   * user prompt image
   */
  inputImageTokens?: number;
  inputAudioTokens?: number;
  /**
   * currently only pplx has citation_tokens
   */
  inputCitationTokens?: number;

  // Output tokens breakdown
  outputTextTokens?: number;
  outputImageTokens?: number;
  outputAudioTokens?: number;
  outputReasoningTokens?: number;

  // Prediction tokens
  acceptedPredictionTokens?: number;
  rejectedPredictionTokens?: number;

  // Total tokens
  totalInputTokens?: number;
  totalOutputTokens?: number;
  totalTokens?: number;
}

export interface ModelUsage extends ModelTokensUsage {
  /**
   * dollar
   */
  cost?: number;
}

export interface ModelSpeed {
  /**
   * tokens per second
   */
  tps?: number;
  /**
   * time to first token
   */
  ttft?: number;
  /**
   * from output start to output finish
   */
  duration?: number;
  /**
   * from input start to output finish
   */
  latency?: number;
}

export interface MessageMetadata extends ModelUsage, ModelSpeed {}

export type MessageRoleType = 'user' | 'system' | 'assistant' | 'tool';

export interface MessageItem {
  agentId: string | null;
  clientId: string | null;
  content: string | null;
  createdAt: Date;
  error: any | null;
  favorite: boolean | null;
  id: string;
  metadata?: MessageMetadata | null;
  model: string | null;
  observationId: string | null;
  parentId: string | null;
  provider: string | null;
  quotaId: string | null;
  reasoning: ModelReasoning | null;
  role: string;
  search: GroundingSearch | null;
  sessionId: string | null;
  threadId: string | null;
  tools: any | null;
  topicId: string | null;
  // jsonb type
  traceId: string | null;
  updatedAt: Date;
  userId: string;
}

export interface NewMessage {
  agentId?: string | null;
  clientId?: string | null;
  content?: string | null;
  createdAt?: Date;
  // optional because it has a default value
  error?: any | null;
  favorite?: boolean;
  id?: string;
  model?: string | null;
  observationId?: string | null;
  parentId?: string | null;
  provider?: string | null;
  quotaId?: string | null;
  // optional because it has a default function
  role: 'user' | 'system' | 'assistant' | 'tool';
  // required because it's notNull
  sessionId?: string | null;
  threadId?: string | null;
  tools?: any | null;
  topicId?: string | null;
  traceId?: string | null;
  // optional because it's generated
  updatedAt?: Date;
  userId: string; // optional because it's generated
}

export interface UpdateMessageParams {
  content?: string;
  error?: ChatMessageError | null;
  imageList?: ChatImageItem[];
  metadata?: MessageMetadata;
  model?: string;
  provider?: string;
  reasoning?: ModelReasoning;
  role?: string;
  search?: GroundingSearch;
  toolCalls?: MessageToolCall[];
  tools?: ChatToolPayload[] | null;
}

export interface NewMessageQueryParams {
  embeddingsId: string;
  messageId: string;
  rewriteQuery: string;
  userQuery: string;
}
