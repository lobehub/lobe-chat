import { IThreadType } from './topic/thread';

/**
 * Scope types for message map key generation
 * - main: Agent main conversation (default)
 * - thread: Agent thread conversation
 * - group: Group main conversation
 * - group_agent: Agent conversation within a group
 */
export type MessageMapScope = 'main' | 'thread' | 'group' | 'group_agent';

/**
 * Context for generating message map key with scope-driven architecture
 *
 * Key format: `{scope}_{scopeId}[_{topicId}][_{subTopicId}][_new]`
 *
 * @example
 * ```ts
 * // Main mode - new topic (default scope)
 * { scopeId: 'agt_xxx' } // => 'main_agt_xxx_new'
 *
 * // Main mode - existing topic
 * { scopeId: 'agt_xxx', topicId: 'tpc_yyy' } // => 'main_agt_xxx_tpc_yyy'
 *
 * // Thread mode - new thread
 * { scope: 'thread', scopeId: 'agt_xxx', topicId: 'tpc_yyy', isNew: true }
 * // => 'thread_agt_xxx_tpc_yyy_new'
 *
 * // Thread mode - existing thread
 * { scope: 'thread', scopeId: 'agt_xxx', topicId: 'tpc_yyy', subTopicId: 'thd_zzz' }
 * // => 'thread_agt_xxx_tpc_yyy_thd_zzz'
 *
 * // Group mode - new topic
 * { scope: 'group', scopeId: 'grp_xxx' } // => 'group_grp_xxx_new'
 *
 * // Group mode - existing topic
 * { scope: 'group', scopeId: 'grp_xxx', topicId: 'tpc_yyy' }
 * // => 'group_grp_xxx_tpc_yyy'
 *
 * // Group agent mode - existing agent topic
 * { scope: 'group_agent', scopeId: 'grp_xxx', topicId: 'tpc_yyy', subTopicId: 'tpc_zzz' }
 * // => 'group_agent_grp_xxx_tpc_yyy_tpc_zzz'
 * ```
 */
export interface MessageMapContext {
  /**
   * Whether this is a new/creating state (for optimistic updates)
   */
  isNew?: boolean;
  /**
   * Scope type for the message map
   * @default 'main'
   */
  scope?: MessageMapScope;
  /**
   * Scope identifier (agentId for main/thread, groupId for group/group_agent)
   */
  scopeId: string;
  /**
   * Sub topic identifier (threadId in agent mode, agent's topicId in group mode)
   */
  subTopicId?: string | null;
  /**
   * Topic identifier
   */
  topicId?: string | null;
}

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
