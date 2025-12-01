import { IThreadType } from './topic/thread';

/**
 * Context for identifying a conversation or message list
 * This is the standard type for all conversation-related context passing
 *
 * @example
 * ```ts
 * // Basic usage
 * const context: ConversationContext = { sessionId: 'session-1' };
 *
 * // With topic
 * const topicContext: ConversationContext = {
 *   sessionId: 'session-1',
 *   topicId: 'topic-1'
 * };
 *
 * // With thread (highest priority)
 * const threadContext: ConversationContext = {
 *   sessionId: 'session-1',
 *   topicId: 'topic-1',
 *   threadId: 'thread-1'
 * };
 *
 * // Create a new thread with message
 * const newThreadContext: ConversationContext = {
 *   sessionId: 'session-1',
 *   topicId: 'topic-1',
 *   newThread: {
 *     sourceMessageId: 'msg-1',
 *     type: ThreadType.Standalone,
 *   }
 * };
 * ```
 */
export interface ConversationContext {
  agentId: string;
  /**
   * Parameters for creating a new thread along with the message.
   * If provided, a new thread will be created and the message will be added to it.
   * The threadId will be returned in the response.
   */
  newThread?: {
    /**
     * Parent thread ID (for nested threads)
     */
    parentThreadId?: string;
    /**
     * Source message ID that the thread is branched from
     */
    sourceMessageId: string;
    /**
     * Thread type
     */
    type: IThreadType;
  };
  /**
   * Session or group ID
   */
  sessionId?: string;
  /**
   * Thread ID (takes highest priority if present)
   */
  threadId?: string | null;

  /**
   * Topic ID
   */
  topicId?: string | null;
}
