import type { PartialDeep } from 'type-fest';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings/agent';
import { LobeAgentConfig } from '@/types/agent';

/**
 * Agent 设置实例类型 (移动端简化版)
 */
export type AgentSettingsInstance = any; // 移动端暂时使用简化类型

/**
 * Agent 状态接口
 */
export interface AgentState {
  /**
   * 当前活动的 Agent ID
   */
  activeAgentId?: string;

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
   * Agent 设置实例
   */
  agentSettingInstance?: AgentSettingsInstance | null;

  /**
   * 默认 Agent 配置
   */
  defaultAgentConfig: LobeAgentConfig;

  /**
   * Inbox Agent 配置是否已初始化
   */
  isInboxAgentConfigInit: boolean;

  /**
   * 是否显示 Agent 设置
   */
  showAgentSetting: boolean;

  /**
   * 更新 Agent 聊天配置的信号控制器
   */
  updateAgentChatConfigSignal?: AbortController;

  /**
   * 更新 Agent 配置的信号控制器
   */
  updateAgentConfigSignal?: AbortController;
}

/**
 * Agent 初始状态
 */
export const initialAgentChatState: AgentState = {
  activeId: 'inbox',
  agentConfigInitMap: {},
  agentMap: {},
  defaultAgentConfig: DEFAULT_AGENT_CONFIG,
  isInboxAgentConfigInit: false,
  showAgentSetting: false,
};
