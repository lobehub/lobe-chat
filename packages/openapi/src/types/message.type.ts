/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable typescript-sort-keys/interface */
import { MessageItem } from '@lobechat/types';
import { z } from 'zod';

import { SessionItem, TopicItem, UserItem } from '@/database/schemas';

// Request schemas
export const MessagesQueryByTopicRequestSchema = z.object({
  topicId: z.string().min(1, '话题ID不能为空'),
});

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

// TypeScript types
export interface MessagesQueryByTopicRequest {
  topicId: string;
}

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

// 消息查询时的返回类型，包含关联的 session 和 user 信息
export interface MessageResponse extends MessageItem {
  session: SessionItem | null;
  user: UserItem;
  topic: TopicItem | null;
}

// Additional schemas for message routes
export const CountByTopicsRequestSchema = z.object({
  topicIds: z.array(z.string()).min(1, '话题ID数组不能为空'),
});

export const CountByUserRequestSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
});

export interface CountByTopicsRequest {
  topicIds: string[];
}

export interface CountByUserRequest {
  userId: string;
}

// 更新消息请求Schema
export const MessagesUpdateRequestSchema = z.object({
  content: z.string().min(1, '消息内容不能为空').nullish(),
  favorite: z.boolean().nullish(),
  metadata: z.any().nullish(),
  reasoning: z.any().nullish(),
  search: z.any().nullish(),
  tools: z.any().nullish(),
  error: z.any().nullish(),
});

// 删除消息路径参数Schema
export const MessageIdParamSchema = z.object({
  id: z.string().min(1, '消息ID不能为空'),
});

// 批量删除消息请求Schema
export const MessagesDeleteBatchRequestSchema = z.object({
  messageIds: z.array(z.string().min(1, '消息ID不能为空')).min(1, '消息ID数组不能为空'),
});

// TypeScript接口
export interface MessagesUpdateRequest {
  content?: string;
  favorite?: boolean;
  metadata?: any;
  reasoning?: any;
  search?: any;
  tools?: any;
  error?: any;
}

export interface MessageIdParam {
  id: string;
}

export interface MessagesDeleteBatchRequest {
  messageIds: string[];
}

// Search messages by keyword request schema
export const SearchMessagesByKeywordRequestSchema = z.object({
  keyword: z.string().min(1, '搜索关键词不能为空'),
  limit: z.number().min(1).max(100).nullish().default(20),
  offset: z.number().min(0).nullish().default(0),
  sessionId: z.string().min(1, '会话ID不能为空'),
});

export interface SearchMessagesByKeywordRequest {
  keyword: string;
  limit?: number;
  offset?: number;
  sessionId: string;
}
