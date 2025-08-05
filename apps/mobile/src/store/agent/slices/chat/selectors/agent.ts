import type { AgentState } from '../initialState';
import { LobeAgentConfig } from '@/types/agent';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings/agent';
import { merge } from '@/utils/merge';

/**
 * 根据 ID 获取 Agent 配置
 */
const getAgentConfigById =
  (id: string) =>
  (s: AgentState): LobeAgentConfig =>
    merge(s.defaultAgentConfig, s.agentMap[id]);

/**
 * 获取当前 Agent 配置
 */
export const currentAgentConfig = (s: AgentState): LobeAgentConfig =>
  getAgentConfigById(s.activeId)(s);

/**
 * 获取当前 Agent 模型
 */
const currentAgentModel = (s: AgentState): string => {
  const config = currentAgentConfig(s);
  return config?.model || DEFAULT_AGENT_CONFIG.model;
};

/**
 * 获取当前 Agent 模型提供商
 */
const currentAgentModelProvider = (s: AgentState): string => {
  const config = currentAgentConfig(s);
  return config?.provider || DEFAULT_AGENT_CONFIG.provider || 'openai';
};

/**
 * 获取当前 Agent 系统角色
 */
const currentAgentSystemRole = (s: AgentState): string => {
  const config = currentAgentConfig(s);
  return config?.systemRole || DEFAULT_AGENT_CONFIG.systemRole;
};

/**
 * 检查 Agent 配置是否正在加载
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isAgentConfigLoading = (s: AgentState): boolean => {
  // 简化版本，移动端暂不实现复杂的加载状态
  return false;
};

/**
 * Agent 选择器聚合
 */
export const agentSelectors = {
  currentAgentConfig,
  currentAgentModel,
  currentAgentModelProvider,
  currentAgentSystemRole,
  getAgentConfigById,
  isAgentConfigLoading,
};
