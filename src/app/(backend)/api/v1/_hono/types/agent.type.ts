import { AgentItem } from '@/database/schemas';
import { LobeAgentChatConfig } from '@/types/agent';

/**
 * 模型参数接口
 */
export interface ModelParams {
  frequency_penalty: number;
  presence_penalty: number;
  temperature: number;
  top_p: number;
}

/**
 * 创建 Agent 请求参数
 */
export interface CreateAgentRequest {
  avatar?: string;
  chatConfig?: LobeAgentChatConfig;
  description?: string;
  model?: string;
  params?: Record<string, unknown>;
  provider?: string;
  slug: string;
  systemRole?: string;
  title: string;
}

/**
 * 更新 Agent 请求参数
 */
export interface UpdateAgentRequest extends CreateAgentRequest {
  id: string;
}

/**
 * 删除 Agent 请求参数
 */
export interface AgentDeleteRequest {
  agentId: string;
  migrateTo?: string;
}

/**
 * Agent 列表响应类型
 */
export type AgentListResponse = AgentItem[];

/**
 * Agent 详情响应类型
 */
export type AgentDetailResponse = AgentItem;
