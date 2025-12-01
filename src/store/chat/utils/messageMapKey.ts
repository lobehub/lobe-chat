import { ConversationContext } from '@lobechat/types';

/**
 * Generate a unique key for message map based on conversation context
 *
 * Key format:
 * - Thread mode: `{agentId}_thread_{threadId}` (highest priority)
 * - New thread mode: `{agentId}_newThread_{sourceMessageId}` (for creating new thread)
 * - Topic mode: `{agentId}_{topicId}`
 * - Session only: `{agentId}_null`
 */
export const messageMapKey = (context: ConversationContext) => {
  const { agentId, topicId, threadId, newThread } = context;

  if (threadId) return `${agentId}_thread_${threadId}`;

  // When creating a new thread, use sourceMessageId to create isolated storage
  if (newThread?.sourceMessageId) {
    return `${agentId}_newThread_${newThread.sourceMessageId}`;
  }

  const topic = topicId ?? null;

  return `${agentId}_${topic}`;
};
