import { z } from 'zod';

// Request schemas
export const TopicListParamSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
});

export const TopicListQuerySchema = z.object({
  keyword: z.string().optional(),
});

export const TopicCreateRequestSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
  title: z.string().min(1, '标题不能为空'),
});

export const TopicSummaryParamSchema = z.object({
  id: z.string().min(1, '话题ID不能为空'),
  lang: z.string().optional(),
});

export const TopicDeleteParamSchema = z.object({
  id: z.string().min(1, '话题ID不能为空'),
});

// TypeScript types
export interface TopicListParam {
  sessionId: string;
}

export interface TopicListQuery {
  keyword?: string;
}

export interface TopicCreateRequest {
  sessionId: string;
  title: string;
}

export interface TopicSummaryRequest {
  id: string;
  lang?: string;
}

// User info for topic response
export interface TopicUserInfo {
  avatar: string | null;
  email: string | null;
  fullName: string | null;
  id: string;
  username: string | null;
}

// Response type (represents the topic table structure)
export interface TopicResponse {
  clientId: string | null;
  createdAt: string;
  favorite: boolean;
  historySummary: string | null;
  id: string;
  messageCount: number;
  metadata: any | null;
  sessionId: string | null;
  title: string | null;
  updatedAt: string;
  user: TopicUserInfo;
}
