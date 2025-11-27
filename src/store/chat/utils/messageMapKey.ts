import { ConversationContext } from '@lobechat/types';

/**
 * Generate a unique key for message map based on conversation context
 *
 * Key format:
 * - Thread mode: `{agentId}_thread_{threadId}` (highest priority)
 * - Topic mode: `{agentId}_{topicId}`
 * - Session only: `{agentId}_null`
 */
export const messageMapKey = (context: ConversationContext) => {
  const { agentId, topicId, threadId } = context;

  if (threadId) return `${agentId}_thread_${threadId}`;

  const topic = topicId ?? null;

  return `${agentId}_${topic}`;
};
