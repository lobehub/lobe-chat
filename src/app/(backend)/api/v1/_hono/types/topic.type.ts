import { z } from 'zod';

// Request schemas
export const TopicListRequestSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
});

export const TopicCreateRequestSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
  title: z.string().min(1, '标题不能为空'),
});

export const TopicSummaryRequestSchema = z.object({
  topicId: z.string().min(1, '话题ID不能为空'),
});

// TypeScript types
export interface TopicListRequest {
  sessionId: string;
}

export interface TopicCreateRequest {
  sessionId: string;
  title: string;
}

export interface TopicSummaryRequest {
  topicId: string;
}

// Response type (represents the topic table structure)
export interface TopicResponse {
  clientId: string | null;
  createdAt: string;
  favorite: boolean;
  historySummary: string | null;
  id: string;
  metadata: any | null;
  sessionId: string | null;
  title: string | null;
  updatedAt: string;
  userId: string;
}
