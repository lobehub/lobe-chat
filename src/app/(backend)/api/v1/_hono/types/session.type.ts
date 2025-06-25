import { z } from 'zod';

import { SessionGroupItem, SessionItem } from '@/database/schemas';
import { LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';

/**
 * 创建会话请求参数
 */
export interface CreateSessionRequest {
  agentId?: string; // 关联的 Agent ID，用于创建基于 Agent 的会话
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
  keyword: string;
  page?: number;
  pageSize?: number;
}

/**
 * 获取会话列表请求参数
 */
export interface GetSessionsRequest {
  page?: number;
  pageSize?: number;
  userId?: string | null;
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
}

/**
 * 更新会话组排序请求参数
 */
export interface UpdateSessionGroupOrderRequest {
  sortMap: { id: string; sort: number }[];
}

/**
 * 更新会话分组请求参数
 */
export interface UpdateSessionGroupAssignmentRequest {
  groupId: string | null; // null 表示移除分组
}

/**
 * 扩展的会话信息类型，包含代理配置
 */
export interface SessionWithAgent extends SessionItem {
  agent?: LobeAgentConfig;
}

/**
 * 会话列表项类型
 */
export interface SessionListItem extends SessionItem {
  agentsToSessions?: Array<{
    agent: {
      avatar: string | null;
      id: string;
      title: string | null;
    };
  }>;
}

/**
 * 会话列表响应类型
 */
export type SessionListResponse = SessionListItem[];

/**
 * Agent 信息类型
 */
export interface AgentInfo {
  avatar: string | null;
  backgroundColor: string | null;
  chatConfig: any | null;
  description: string | null;
  id: string;
  model: string | null;
  provider: string | null;
  systemRole: string | null;
  title: string | null;
}

/**
 * 会话详情响应类型
 */
export interface SessionDetailResponse extends SessionItem {
  agent?: AgentInfo | null;
}

/**
 * 会话组列表响应类型
 */
export type SessionGroupListResponse = SessionGroupItem[];

/**
 * 分组会话列表响应类型
 */
export interface GroupedSessionsResponse {
  sessionGroups: SessionGroupItem[];
  sessions: SessionListItem[];
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
 * 批量查询会话请求参数
 */
export interface BatchGetSessionsRequest {
  sessionIds: string[];
}

/**
 * 批量查询会话响应类型
 */
export interface BatchGetSessionsResponse {
  found: SessionListItem[];
  notFound: string[];
  totalFound: number;
  totalRequested: number;
}

/**
 * 会话批量操作结果类型
 */
export interface SessionBatchOperationResult {
  added: number;
  failed: number;
  removed: number;
  success: boolean;
  updated: number;
}

// Zod Schemas for validation
export const CreateSessionRequestSchema = z.object({
  agentId: z.string().optional(),
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
  keyword: z.string().min(1, '搜索关键词不能为空'),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional(),
  pageSize: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional(),
});

export const GetSessionsRequestSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional(),
  pageSize: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional(),
  userId: z.string().optional(),
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

export const UpdateSessionGroupAssignmentRequestSchema = z.object({
  groupId: z.string().nullable(), // 允许 null 来移除分组
});

export const BatchGetSessionsRequestSchema = z.object({
  sessionIds: z
    .array(z.string().min(1, '会话 ID 不能为空'))
    .min(1, '至少需要提供一个会话 ID')
    .max(100, '单次最多查询 100 个会话'),
});
