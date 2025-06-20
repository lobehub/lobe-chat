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
 * 会话排行请求参数
 */
export interface RankSessionsRequest {
  limit?: number;
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
