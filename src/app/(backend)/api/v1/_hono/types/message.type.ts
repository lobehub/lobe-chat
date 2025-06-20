import { z } from 'zod';

// Request schemas
export const MessagesQueryByTopicRequestSchema = z.object({
  topicId: z.string().min(1, '话题ID不能为空'),
});

export const MessagesCreateRequestSchema = z.object({
  content: z.string().min(1, '消息内容不能为空'),
  files: z.array(z.string()).optional(),
  fromModel: z.string().min(1, '模型名称不能为空'),
  fromProvider: z.string().min(1, '提供商不能为空'),
  role: z.enum(['assistant', 'user'], { required_error: '角色必须为assistant或user' }),
  sessionId: z.string().nullable().optional().default(null),
  topic: z.string().nullable().optional().default(null),
});

// TypeScript types
export interface MessagesQueryByTopicRequest {
  topicId: string;
}

export interface MessagesCreateRequest {
  content: string;
  files?: string[];
  fromModel: string;
  fromProvider: string;
  role: 'assistant' | 'user';
  sessionId: string | null;
  topic: string | null;
}

// Response type (represents the message table structure)
export interface MessageResponse {
  agentId: string | null;
  clientId: string | null;
  content: string | null;
  createdAt: string;
  error: any | null;
  favorite: boolean;
  id: string;
  metadata: any | null;
  model: string | null;
  observationId: string | null;
  parentId: string | null;
  provider: string | null;
  quotaId: string | null;
  reasoning: any | null;
  role: string;
  search: any | null;
  sessionId: string | null;
  threadId: string | null;
  tools: any | null;
  topicId: string | null;
  traceId: string | null;
  updatedAt: string;
  userId: string;
}

// Create response type (only returns the ID)
export interface MessageCreateResponse {
  id: string;
}
