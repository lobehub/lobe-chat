import { LobeAgentConfig, MetaData } from '@lobechat/types';
import { z } from 'zod';

import { AgentItem, SessionGroupItem, SessionItem, UserItem } from '@/database/schemas';

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
  agentId?: string;
  avatar?: string;
  backgroundColor?: string;
  description?: string;
  groupId?: string;
  id: string;
  pinned?: boolean;
  title?: string;
  userId?: string;
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
  agentId?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
  targetUserId?: string;
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
 * 会话列表项类型
 */
export interface SessionListItem extends SessionItem {
  agentsToSessions?: Array<{ agent: AgentItem }>;
  messageCount?: number;
}

/**
 * 会话列表响应类型
 */
export interface SessionListResponse {
  sessions: SessionListItem[];
  total: number;
}

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
  agent?: AgentItem | null;
  user?: UserItem | null;
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
 * 按Agent分组的会话响应类型
 */
export type SessionsByAgentResponse = {
  agent: AgentItem | null;
  sessions: SessionListItem[];
};

/**
 * 按Agent分组的会话数量响应类型
 */
export interface SessionCountByAgentResponse {
  agent: AgentItem | null;
  count: number;
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
 * 批量更新会话请求参数
 */
export interface BatchUpdateSessionsRequest {
  sessions: Array<{
    avatar?: string;
    backgroundColor?: string;
    description?: string;
    groupId?: string;
    id: string;
    pinned?: boolean;
    title?: string;
    userId?: string;
  }>;
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
  agentId: z.string().nullish(),
  avatar: z.string().nullish(),
  backgroundColor: z.string().nullish(),
  config: z.object({}).passthrough().nullish(),
  description: z.string().nullish(),
  groupId: z.string().nullish(),
  meta: z.object({}).passthrough().nullish(),
  pinned: z.boolean().nullish(),
  title: z.string().nullish(),
  type: z.enum(['agent', 'group']).nullish(),
});

export const UpdateSessionRequestSchema = z.object({
  agentId: z.string().nullish(),
  avatar: z.string().nullish(),
  backgroundColor: z.string().nullish(),
  description: z.string().nullish(),
  groupId: z.string().nullish(),
  pinned: z.boolean().nullish(),
  title: z.string().nullish(),
  userId: z.string().nullish(),
});

export const UpdateSessionConfigRequestSchema = z.object({
  config: z.object({}).passthrough().nullish(),
  meta: z.object({}).passthrough().nullish(),
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
    .nullish(),
  pageSize: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .nullish(),
});

export const GetSessionsRequestSchema = z.object({
  agentId: z.string().nullish(),
  keyword: z.string().nullish(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .nullish(),
  pageSize: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .nullish(),
  targetUserId: z.string().nullish(),
});

export const CountSessionsRequestSchema = z.object({
  endDate: z.string().nullish(),
  range: z.array(z.string()).length(2).nullish(),
  startDate: z.string().nullish(),
});

export const CreateSessionGroupRequestSchema = z.object({
  name: z.string().min(1, '会话组名称不能为空'),
  sort: z.number().nullish(),
});

export const UpdateSessionGroupRequestSchema = z.object({
  name: z.string().min(1, '会话组名称不能为空').nullish(),
  sort: z.number().nullish(),
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

export const BatchUpdateSessionsRequestSchema = z.object({
  sessions: z
    .array(
      z.object({
        avatar: z.string().nullish(),
        backgroundColor: z.string().nullish(),
        description: z.string().nullish(),
        groupId: z.string().nullish(),
        id: z.string().min(1, '会话 ID 不能为空'),
        pinned: z.boolean().nullish(),
        title: z.string().nullish(),
        userId: z.string().nullish(),
      }),
    )
    .min(1, '至少需要提供一个要更新的会话'),
});
