import { ConversationContext } from '@lobechat/types';

/**
 * Generate a unique key for message map based on conversation context
 *
 * Key format:
 * - Thread mode: `{sessionId}_thread_{threadId}` (highest priority)
 * - Topic mode: `{sessionId}_{topicId}`
 * - Session only: `{sessionId}_null`
 */
export const messageMapKey = (context: ConversationContext) => {
  const { sessionId, topicId, threadId } = context;

  if (threadId) return `${sessionId}_thread_${threadId}`;

  const topic = topicId ?? null;

  return `${sessionId}_${topic}`;
};
