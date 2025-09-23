import { z } from 'zod';

import { TopicItem, UserItem } from '@/database/schemas';

import { IPaginationQuery, PaginationQueryResponse, PaginationQuerySchema } from '.';

// ==================== Topic Query Types ====================

export interface TopicListQuery extends IPaginationQuery {
  sessionId?: string; // 支持会话过滤
}

export const TopicListQuerySchema = z
  .object({
    sessionId: z.string().nullish(), // 支持通过查询参数过滤会话
  })
  .extend(PaginationQuerySchema.shape);

// ==================== Topic CRUD Types ====================

export interface TopicCreateRequest {
  sessionId: string;
  title: string;
}

export const TopicCreateRequestSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
  title: z.string().min(1, '标题不能为空'),
});

export interface TopicUpdateRequest {
  favorite?: boolean;
  title: string;
}

export const TopicUpdateRequestSchema = z.object({
  favorite: z.boolean().optional(),
  title: z.string().min(1, '标题不能为空'),
});

// ==================== Topic Response Types ====================

export interface TopicResponse extends TopicItem {
  messageCount: number;
  user: UserItem;
}

/**
 * Topic 列表响应类型
 */
export type TopicListResponse = PaginationQueryResponse<{
  topics: TopicResponse[];
}>;

// ==================== Common Schemas ====================

export const TopicGetParamSchema = z.object({
  id: z.string().min(1, '话题ID不能为空'),
});

export const TopicDeleteParamSchema = z.object({
  id: z.string().min(1, '话题ID不能为空'),
});

export const TopicUpdateParamSchema = z.object({
  id: z.string().min(1, '话题ID不能为空'),
});
