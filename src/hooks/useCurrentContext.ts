'use client';

import { ConversationContext } from '@lobechat/types';

import { useChatStore } from '@/store/chat';

/**
 * Hook to get the current conversation context from global ChatStore
 *
 * This hook subscribes to activeId, activeTopicId, and activeThreadId
 * from the global ChatStore and returns them as a ConversationContext.
 *
 * @returns The current conversation context
 */
export function useCurrentContext(): ConversationContext {
  const [agentId, topicId, threadId] = useChatStore((s) => [
    s.activeAgentId,
    s.activeTopicId ?? null,
    s.activeThreadId ?? null,
  ]);

  return { agentId, threadId, topicId };
}
