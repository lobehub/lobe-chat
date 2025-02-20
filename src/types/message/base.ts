export interface ModelReasoning {
  content?: string;
  duration?: number;
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
  model: string | null;
  observationId: string | null;
  parentId: string | null;
  provider: string | null;
  quotaId: string | null;
  reasoning: ModelReasoning | null;
  role: string;
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
