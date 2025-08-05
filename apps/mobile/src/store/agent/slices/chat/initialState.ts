import type { PartialDeep } from 'type-fest';

import { LobeAgentConfig } from '@/types/agent';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings/agent';

/**
 * Agent 状态接口
 */
export interface AgentState {
  /**
   * 当前活动的会话 ID
   */
  activeId: string;

  /**
   * Agent 配置初始化状态映射
   * key: sessionId, value: 是否已初始化
   */
  agentConfigInitMap: Record<string, boolean>;

  /**
   * Agent 配置映射表
   * key: sessionId, value: agent config
   */
  agentMap: Record<string, PartialDeep<LobeAgentConfig>>;

  /**
   * 默认 Agent 配置
   */
  defaultAgentConfig: LobeAgentConfig;
}

/**
 * Agent 初始状态
 */
export const initialAgentChatState: AgentState = {
  activeId: 'inbox',
  agentConfigInitMap: {},
  agentMap: {},
  defaultAgentConfig: DEFAULT_AGENT_CONFIG,
};
