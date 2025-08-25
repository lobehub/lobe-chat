import { LobeAgentConfig, MetaData } from '@lobechat/types';
import { z } from 'zod';

import { AgentItem, SessionItem, UserItem } from '@/database/schemas';

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
  type?: 'agent' | 'group'; // 克隆源会话ID
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
 * 获取会话列表请求参数 (统一查询接口)
 */
export interface GetSessionsRequest {
  agentId?: string;
  ids?: string[];
  keyword?: string;
  page?: number;
  pageSize?: number;
  query?: string;
  sessionIds?: string[];
  userId?: string;
}

/**
 * 会话列表项类型
 */
export interface SessionListItem extends SessionItem {
  agent: AgentItem;
  user: UserItem;
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
 * 按Agent分组的会话数量响应类型
 */
export interface SessionCountByAgentResponse {
  agent: AgentItem | null;
  count: number;
}

/**
 * 分组查询请求参数
 */
export interface SessionsGroupsRequest {
  groupBy: 'agent';
}

/**
 * 分组查询响应类型
 */
export interface SessionsGroupsResponse {
  agent: AgentItem;
  sessions: SessionListItem[];
  total: number;
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
 * 批量更新请求参数格式
 */
export type NewBatchUpdateSessionsRequest = Array<{
  data: Omit<UpdateSessionRequest, 'id'>;
  id: string;
}>;

/**
 * 批量查询会话响应类型
 */
export type BatchGetSessionsResponse = {
  sessions: SessionListItem[];
  total: number;
};

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

export const GetSessionsRequestSchema = z.object({
  agentId: z.string().nullish(),
  ids: z
    .string()
    .nullish()
    .transform((val) => (val ? val.split(',') : [])),
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
  query: z.string().nullish(),
  userId: z.string().nullish(),
});

export const SessionIdParamSchema = z.object({
  id: z.string().min(1, '会话 ID 不能为空'),
});

// 新的RESTful批量更新Schema
export const NewBatchUpdateSessionsRequestSchema = z
  .array(
    z.object({
      data: UpdateSessionRequestSchema,
      id: z.string().min(1, '会话 ID 不能为空'),
    }),
  )
  .min(1, '至少需要提供一个要更新的会话');

// 分组查询Schema
export const SessionsGroupsRequestSchema = z.object({
  groupBy: z.literal('agent'),
  keyword: z.string().nullish(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .nullish(),
});
