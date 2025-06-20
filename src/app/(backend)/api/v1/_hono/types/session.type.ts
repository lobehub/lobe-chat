import { z } from 'zod';

import { SessionItem } from '@/database/schemas';
import { LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';

/**
 * 创建会话请求参数
 */
export interface CreateSessionRequest {
  avatar?: string;
  backgroundColor?: string;
  config?: LobeAgentConfig;
  description?: string;
  groupId?: string;
  meta?: MetaData;
  pinned?: boolean;
  title?: string;
  type?: 'agent' | 'group';
}

/**
 * 更新会话请求参数
 */
export interface UpdateSessionRequest {
  avatar?: string;
  backgroundColor?: string;
  description?: string;
  groupId?: string;
  id: string;
  pinned?: boolean;
  title?: string;
}

/**
 * 更新会话配置请求参数
 */
export interface UpdateSessionConfigRequest {
  config?: LobeAgentConfig;
  id: string;
  meta?: MetaData;
}

/**
 * 克隆会话请求参数
 */
export interface CloneSessionRequest {
  id: string;
  newTitle: string;
}

/**
 * 搜索会话请求参数
 */
export interface SearchSessionsRequest {
  current?: number;
  keywords: string;
  pageSize?: number;
}

/**
 * 获取会话列表请求参数
 */
export interface GetSessionsRequest {
  current?: number;
  pageSize?: number;
}

/**
 * 统计会话请求参数
 */
export interface CountSessionsRequest {
  endDate?: string;
  range?: [string, string];
  startDate?: string;
}

/**
 * 创建会话组请求参数
 */
export interface CreateSessionGroupRequest {
  name: string;
  sort?: number;
}

/**
 * 更新会话组请求参数
 */
export interface UpdateSessionGroupRequest {
  id: string;
  name?: string;
  sort?: number;
}

/**
 * 删除会话组请求参数
 */
export interface DeleteSessionGroupRequest {
  id: string;
  removeChildren?: boolean;
}

/**
 * 更新会话组排序请求参数
 */
export interface UpdateSessionGroupOrderRequest {
  sortMap: { id: string; sort: number }[];
}

/**
 * 扩展的会话信息类型，包含代理配置
 */
export interface SessionWithAgent extends SessionItem {
  agent?: LobeAgentConfig;
}

/**
 * 会话列表响应类型
 */
export type SessionListResponse = any[];

/**
 * 会话详情响应类型
 */
export type SessionDetailResponse = any;

/**
 * 会话组列表响应类型
 */
export type SessionGroupListResponse = any[];

/**
 * 分组会话列表响应类型
 */
export interface GroupedSessionsResponse {
  sessionGroups: any[];
  sessions: any[];
}

/**
 * 会话排行响应类型
 */
export interface SessionRankResponse {
  avatar: string | null;
  backgroundColor: string | null;
  count: number;
  id: string;
  title: string | null;
}

/**
 * 统计响应类型
 */
export interface CountResponse {
  count: number;
}

/**
 * 批量操作结果类型
 */
export interface BatchOperationResult {
  added: number;
  failed: number;
  removed: number;
  success: boolean;
  updated: number;
}

// Zod Schemas for validation
export const CreateSessionRequestSchema = z.object({
  avatar: z.string().optional(),
  backgroundColor: z.string().optional(),
  config: z.object({}).passthrough().optional(),
  description: z.string().optional(),
  groupId: z.string().optional(),
  meta: z.object({}).passthrough().optional(),
  pinned: z.boolean().optional(),
  title: z.string().optional(),
  type: z.enum(['agent', 'group']).optional(),
});

export const UpdateSessionRequestSchema = z.object({
  avatar: z.string().optional(),
  backgroundColor: z.string().optional(),
  description: z.string().optional(),
  groupId: z.string().optional(),
  pinned: z.boolean().optional(),
  title: z.string().optional(),
});

export const UpdateSessionConfigRequestSchema = z.object({
  config: z.object({}).passthrough().optional(),
  meta: z.object({}).passthrough().optional(),
});

export const CloneSessionRequestSchema = z.object({
  newTitle: z.string().min(1, '新标题不能为空'),
});

export const SearchSessionsRequestSchema = z.object({
  current: z.number().min(1).optional(),
  keywords: z.string().min(1, '搜索关键词不能为空'),
  pageSize: z.number().min(1).max(100).optional(),
});

export const GetSessionsRequestSchema = z.object({
  current: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
});

export const CountSessionsRequestSchema = z.object({
  endDate: z.string().optional(),
  range: z.array(z.string()).length(2).optional(),
  startDate: z.string().optional(),
});

export const CreateSessionGroupRequestSchema = z.object({
  name: z.string().min(1, '会话组名称不能为空'),
  sort: z.number().optional(),
});

export const UpdateSessionGroupRequestSchema = z.object({
  name: z.string().min(1, '会话组名称不能为空').optional(),
  sort: z.number().optional(),
});

export const UpdateSessionGroupOrderRequestSchema = z.object({
  sortMap: z.array(
    z.object({
      id: z.string(),
      sort: z.number(),
    }),
  ),
});

export const SessionIdParamSchema = z.object({
  id: z.string().min(1, '会话 ID 不能为空'),
});

export const SessionGroupIdParamSchema = z.object({
  id: z.string().min(1, '会话组 ID 不能为空'),
});
