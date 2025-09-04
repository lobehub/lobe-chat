import { IPluginErrorType } from '@lobehub/chat-plugin-sdk';

import { ILobeAgentRuntimeErrorType } from '@/libs/model-runtime';

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

export interface CitationItem {
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
  acceptedPredictionTokens?: number;
  inputAudioTokens?: number;
  inputCacheMissTokens?: number;
  inputCachedTokens?: number;
  /**
   * currently only pplx has citation_tokens
   */
  inputCitationTokens?: number;
  /**
   * user prompt image
   */
  inputImageTokens?: number;
  /**
   * user prompt input
   */
  inputTextTokens?: number;
  inputWriteCacheTokens?: number;
  outputAudioTokens?: number;
  outputImageTokens?: number;
  outputReasoningTokens?: number;
  outputTextTokens?: number;
  rejectedPredictionTokens?: number;
  totalInputTokens?: number;
  totalOutputTokens?: number;
  totalTokens?: number;
}

export interface ModelSpeed {
  // tokens per second
  tps?: number;
  // time to fist token
  ttft?: number;
}

export interface MessageMetadata extends ModelTokensUsage {
  tps?: number;
  ttft?: number;
}

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
