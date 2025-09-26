import { agentSelectors, useAgentStore } from '@/store/agent';
import { useSessionStore } from '@/store/session';

/**
 * 获取当前会话的 Agent 配置的便捷 Hook
 */
export const useCurrentAgent = () => {
  // 获取当前活动会话ID
  const currentSessionId = useSessionStore((state) => state.activeId);

  // 获取Agent Store的actions
  const { updateAgentConfig } = useAgentStore();

  // 获取当前会话的Agent配置信息
  const currentModel = useAgentStore((state) => agentSelectors.currentAgentModel(state));

  const currentProvider = useAgentStore((state) => agentSelectors.currentAgentModelProvider(state));

  const currentSystemRole = useAgentStore((state) => agentSelectors.currentAgentSystemRole(state));

  const currentConfig = useAgentStore((state) => agentSelectors.currentAgentConfig(state));

  return {
    currentConfig,
    currentModel,
    currentProvider,
    currentSessionId,
    currentSystemRole,
    updateAgentConfig,
  };
};
