/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable typescript-sort-keys/interface */
import { MessageItem } from '@lobechat/types';
import { z } from 'zod';

// ==================== Message Query Types ====================

export interface MessagesQueryByTopicRequest {
  topicId: string;
}

export const MessagesQueryByTopicRequestSchema = z.object({
  topicId: z.string().min(1, '话题ID不能为空'),
});

/**
 * 消息数量统计查询参数
 */
export interface MessagesCountQuery {
  topicIds?: string[];
  userId?: string;
}

export const MessagesCountQuerySchema = z.object({
  // 按话题ID数组统计 (comma-separated string, e.g., "topic1,topic2,topic3")
  topicIds: z.string().nullish(),
  // 按用户ID统计 (仅管理员)
  userId: z.string().nullish(),
});

export interface CountByTopicsRequest {
  topicIds: string[];
}

export const CountByTopicsRequestSchema = z.object({
  topicIds: z.array(z.string()).min(1, '话题ID数组不能为空'),
});

export interface CountByUserRequest {
  userId: string;
}

export const CountByUserRequestSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
});

// ==================== Message List Query Types ====================

/**
 * 消息列表查询参数
 */
export interface MessagesListQuery {
  page?: number;
  limit?: number;
  offset?: number;
  topicId?: string;
  sessionId?: string;
  userId?: string;
  role?: 'user' | 'system' | 'assistant' | 'tool';
  query?: string;
  sort?: 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
}

export const MessagesListQuerySchema = z.object({
  // 分页参数
  page: z.number().min(1).nullish().default(1),
  limit: z.number().min(1).max(100).nullish().default(20),
  offset: z.number().min(0).nullish(),

  // 过滤参数
  topicId: z.string().nullish(),
  sessionId: z.string().nullish(),
  userId: z.string().nullish(),
  role: z.enum(['user', 'system', 'assistant', 'tool']).nullish(),

  // 搜索参数
  query: z.string().nullish(), // 关键词搜索 (替代原来的 search 接口)

  // 排序参数
  sort: z.enum(['createdAt', 'updatedAt']).nullish().default('createdAt'),
  order: z.enum(['asc', 'desc']).nullish().default('desc'),
});

// ==================== Message Search Types ====================

export interface SearchMessagesByKeywordRequest {
  keyword: string;
  limit?: number;
  offset?: number;
  sessionId?: string;
}

export const SearchMessagesByKeywordRequestSchema = z.object({
  keyword: z.string().min(1, '搜索关键词不能为空'),
  limit: z.number().min(1).max(100).nullish().default(20),
  offset: z.number().min(0).nullish().default(0),
  sessionId: z.string().min(1, '会话ID不能为空'),
});

// ==================== Message CRUD Types ====================

export interface MessagesCreateRequest {
  content: string;
  role: 'user' | 'system' | 'assistant' | 'tool';

  // AI相关字段
  model?: string;
  provider?: string;

  // 会话关联
  sessionId?: string | null;
  topicId: string | null;
  threadId?: string | null;

  // 消息关联
  parentId?: string | null;
  quotaId?: string | null;
  agentId?: string | null;

  // 客户端标识
  clientId?: string;

  // 扩展数据
  metadata?: any;
  reasoning?: any;
  search?: any;
  tools?: any;

  // 追踪标识
  traceId?: string | null;
  observationId?: string | null;

  // 文件关联
  files?: string[];

  // 状态
  favorite?: boolean;
}

export const MessagesCreateRequestSchema = z.object({
  content: z.string().min(1, '消息内容不能为空'),
  role: z.enum(['user', 'system', 'assistant', 'tool'], { required_error: '角色类型无效' }),

  // AI相关字段
  model: z.string().nullish(), // 使用的模型，改名为model与数据库一致
  provider: z.string().nullish(), // 提供商，改名为provider与数据库一致

  // 会话关联
  sessionId: z.string().nullable().nullish(),
  topicId: z.string().nullable().nullish(), // 改为topicId与数据库一致
  threadId: z.string().nullable().nullish(), // 线程ID

  // 消息关联
  parentId: z.string().nullable().nullish(), // 父消息ID
  quotaId: z.string().nullable().nullish(), // 引用消息ID
  agentId: z.string().nullable().nullish(), // 关联的Agent ID

  // 客户端标识
  clientId: z.string().nullish(), // 客户端ID，用于跨设备同步

  // 扩展数据
  metadata: z.any().nullish(), // 元数据
  reasoning: z.any().nullish(), // 推理过程
  search: z.any().nullish(), // 搜索结果
  tools: z.any().nullish(), // 工具调用

  // 追踪标识
  traceId: z.string().nullable().nullish(), // 追踪ID
  observationId: z.string().nullable().nullish(), // 观测ID

  // 文件关联
  files: z.array(z.string()).nullish(), // 文件ID数组

  // 状态
  favorite: z.boolean().nullish().default(false), // 是否收藏
});

export interface MessagesUpdateRequest {
  content?: string;
  favorite?: boolean;
  metadata?: any;
  reasoning?: any;
  search?: any;
  tools?: any;
  error?: any;
}

export const MessagesUpdateRequestSchema = z.object({
  content: z.string().min(1, '消息内容不能为空').nullish(),
  favorite: z.boolean().nullish(),
  metadata: z.any().nullish(),
  reasoning: z.any().nullish(),
  search: z.any().nullish(),
  tools: z.any().nullish(),
  error: z.any().nullish(),
});

// ==================== Message Batch Operations ====================

export interface MessagesDeleteBatchRequest {
  messageIds: string[];
}

export const MessagesDeleteBatchRequestSchema = z.object({
  messageIds: z.array(z.string().min(1, '消息ID不能为空')).min(1, '消息ID数组不能为空'),
});

// ==================== Message Response Types ====================

/**
 * 消息查询时的返回类型，包含关联的 session 和 user 信息
 */
export type MessageResponse = MessageItem;

export interface MessageIdParam {
  id: string;
}

// ==================== Common Schemas ====================

export const MessageIdParamSchema = z.object({
  id: z.string().min(1, '消息ID不能为空'),
});
