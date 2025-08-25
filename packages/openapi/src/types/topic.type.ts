import { z } from 'zod';

import { TopicItem, UserItem } from '@/database/schemas';

export const TopicListQuerySchema = z.object({
  keyword: z.string().nullish(),
  sessionId: z.string().nullish(), // 支持通过查询参数过滤会话
});

export const TopicGetParamSchema = z.object({
  id: z.string().min(1, '话题ID不能为空'),
});

export const TopicCreateRequestSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
  title: z.string().min(1, '标题不能为空'),
});

export const TopicDeleteParamSchema = z.object({
  id: z.string().min(1, '话题ID不能为空'),
});

export const TopicUpdateParamSchema = z.object({
  id: z.string().min(1, '话题ID不能为空'),
});

export const TopicUpdateRequestSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
});

export interface TopicListQuery {
  keyword?: string;
  sessionId?: string; // 支持会话过滤
}

export interface TopicCreateRequest {
  sessionId: string;
  title: string;
}

export interface TopicUpdateRequest {
  title: string;
}

export interface TopicResponse extends TopicItem {
  messageCount: number;
  user: UserItem;
}
