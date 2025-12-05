'use client';

import { useAgentStore } from '@/store/agent';

import { useChatInputStore } from '../store';

/**
 * Hook to get the effective agentId for ChatInput components.
 * Returns agentId from ChatInput store if provided, otherwise falls back to activeAgentId.
 */
export const useAgentId = () => {
  const agentIdFromChatInput = useChatInputStore((s) => s.agentId);
  const activeAgentId = useAgentStore((s) => s.activeAgentId);

  return agentIdFromChatInput || activeAgentId || '';
};
