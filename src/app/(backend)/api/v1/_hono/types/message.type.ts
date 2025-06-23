/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable typescript-sort-keys/interface */
import { z } from 'zod';

// Request schemas
export const MessagesQueryByTopicRequestSchema = z.object({
  topicId: z.string().min(1, '话题ID不能为空'),
});

export const MessagesCreateRequestSchema = z.object({
  content: z.string().min(1, '消息内容不能为空'),
  role: z.enum(['user', 'system', 'assistant', 'tool'], { required_error: '角色类型无效' }),

  // AI相关字段
  model: z.string().optional(), // 使用的模型，改名为model与数据库一致
  provider: z.string().optional(), // 提供商，改名为provider与数据库一致

  // 会话关联
  sessionId: z.string().nullable().optional(),
  topicId: z.string().nullable().optional(), // 改为topicId与数据库一致
  threadId: z.string().nullable().optional(), // 线程ID

  // 消息关联
  parentId: z.string().nullable().optional(), // 父消息ID
  quotaId: z.string().nullable().optional(), // 引用消息ID
  agentId: z.string().nullable().optional(), // 关联的Agent ID

  // 客户端标识
  clientId: z.string().optional(), // 客户端ID，用于跨设备同步

  // 扩展数据
  metadata: z.any().optional(), // 元数据
  reasoning: z.any().optional(), // 推理过程
  search: z.any().optional(), // 搜索结果
  tools: z.any().optional(), // 工具调用

  // 追踪标识
  traceId: z.string().nullable().optional(), // 追踪ID
  observationId: z.string().nullable().optional(), // 观测ID

  // 文件关联
  files: z.array(z.string()).optional(), // 文件ID数组

  // 状态
  favorite: z.boolean().optional().default(false), // 是否收藏
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
  content: z.string().min(1, '消息内容不能为空').optional(),
  favorite: z.boolean().optional(),
  metadata: z.any().optional(),
  reasoning: z.any().optional(),
  search: z.any().optional(),
  tools: z.any().optional(),
  error: z.any().optional(),
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
