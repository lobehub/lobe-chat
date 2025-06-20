import { z } from 'zod';

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

// Zod Schemas for validation
export const CreateAgentRequestSchema = z.object({
  avatar: z.string().optional(),
  chatConfig: z
    .object({
      autoCreateTopicThreshold: z.number(),
      disableContextCaching: z.boolean().optional(),
      displayMode: z.enum(['chat', 'docs']).optional(),
      enableAutoCreateTopic: z.boolean().optional(),
      enableCompressHistory: z.boolean().optional(),
      enableHistoryCount: z.boolean().optional(),
      enableMaxTokens: z.boolean().optional(),
      enableReasoning: z.boolean().optional(),
      enableReasoningEffort: z.boolean().optional(),
      historyCount: z.number().optional(),
      reasoningBudgetToken: z.number().optional(),
      reasoningEffort: z.enum(['low', 'medium', 'high']).optional(),
      searchFCModel: z.string().optional(),
      searchMode: z.enum(['disabled', 'enabled']).optional(),
      useModelBuiltinSearch: z.boolean().optional(),
    })
    .optional(),
  description: z.string().optional(),
  model: z.string().optional(),
  params: z.record(z.unknown()).optional(),
  provider: z.string().optional(),
  slug: z.string().min(1, 'slug 不能为空'),
  systemRole: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
});

export const UpdateAgentRequestSchema = CreateAgentRequestSchema.extend({
  id: z.string().min(1, 'Agent ID 不能为空'),
});

export const AgentDeleteRequestSchema = z.object({
  agentId: z.string().min(1, 'Agent ID 不能为空'),
  migrateTo: z.string().optional(),
});

export const AgentIdParamSchema = z.object({
  id: z.string().min(1, 'Agent ID 不能为空'),
});
