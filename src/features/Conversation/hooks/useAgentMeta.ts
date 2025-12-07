import { DEFAULT_INBOX_AVATAR } from '@lobechat/const';
import { MetaData } from '@lobechat/types';
import { useMemo } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import { contextSelectors, useConversationStore } from '../store';

const LOBE_AI_TITLE = 'Lobe AI';

/**
 * Hook to get agent meta data for the current conversation.
 * Handles special cases for builtin agents (inbox, page agent, agent builder)
 * by showing Lobe AI avatar and title instead of the agent's own meta.
 */
export const useAgentMeta = (): MetaData => {
  const agentId = useConversationStore(contextSelectors.agentId);
  const agentMeta = useAgentStore(agentSelectors.getAgentMetaById(agentId));
  const builtinAgentIdMap = useAgentStore((s) => s.builtinAgentIdMap);

  return useMemo(() => {
    // Check if the current agent is a builtin agent
    const builtinAgentIds = Object.values(builtinAgentIdMap);
    const isBuiltinAgent = builtinAgentIds.includes(agentId);

    if (isBuiltinAgent) {
      return { ...agentMeta, avatar: DEFAULT_INBOX_AVATAR, title: LOBE_AI_TITLE };
    }

    return agentMeta;
  }, [agentId, agentMeta, builtinAgentIdMap]);
};

/**
 * Hook to check if the current agent is a builtin agent
 */
export const useIsBuiltinAgent = (): boolean => {
  const agentId = useConversationStore(contextSelectors.agentId);
  const builtinAgentIdMap = useAgentStore((s) => s.builtinAgentIdMap);

  return useMemo(() => {
    const builtinAgentIds = Object.values(builtinAgentIdMap);
    return builtinAgentIds.includes(agentId);
  }, [agentId, builtinAgentIdMap]);
};
