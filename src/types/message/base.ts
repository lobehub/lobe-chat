import { GroundingSearch } from '@/types/search';

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
   * user prompt input
   */
  inputTextTokens?: number;
  inputWriteCacheTokens?: number;
  outputAudioTokens?: number;
  outputReasoningTokens?: number;
  outputTextTokens?: number;
  rejectedPredictionTokens?: number;
  totalInputTokens?: number;
  totalOutputTokens?: number;
  totalTokens?: number;
}

export interface MessageMetadata extends ModelTokensUsage {
  tps?: number;
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
  // jsonb type
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
