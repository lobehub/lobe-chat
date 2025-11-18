import { UIChatMessage } from '@lobechat/types';

import { chatHelpers } from '../../../helpers';
import type { ChatStoreState } from '../../../initialState';
import { messageMapKey } from '../../../utils/messageMapKey';

/**
 * DB Message Selectors
 *
 * These selectors access raw messages from dbMessagesMap (database source).
 * Use these selectors when you need to:
 * - Operate on raw message data (create, update, delete)
 * - Access original message structure before processing
 * - Perform data mutations or service calls
 *
 * DO NOT use these for UI rendering - use displayMessage.ts selectors instead.
 */

// ============= Basic DB Message Access ========== //

/**
 * Get the current chat key for accessing dbMessagesMap
 */
export const currentDbChatKey = (s: ChatStoreState) => messageMapKey(s.activeId, s.activeTopicId);

/**
 * Get raw messages from database by key
 */
const getDbMessagesByKey =
  (key: string) =>
  (s: ChatStoreState): UIChatMessage[] => {
    return s.dbMessagesMap[key] || [];
  };

/**
 * Get current active session's raw messages from database
 */
const activeDbMessages = (s: ChatStoreState): UIChatMessage[] => {
  if (!s.activeId) return [];
  return getDbMessagesByKey(currentDbChatKey(s))(s);
};

// ============= DB Message Queries ========== //

/**
 * Get raw message by ID from database (searches globally across all sessions/topics)
 * This is essential for parallel topic agent runtime where background updates
 * may occur after the user has switched to another chat.
 */
const getDbMessageById = (id: string) => (s: ChatStoreState) => {
  // Search across all messages in dbMessagesMap
  for (const messages of Object.values(s.dbMessagesMap)) {
    const message = chatHelpers.getMessageById(messages, id);
    if (message) return message;
  }
  return undefined;
};

/**
 * Get raw message by tool_call_id from database
 */
export const getDbMessageByToolCallId = (id: string) => (s: ChatStoreState) => {
  const messages = activeDbMessages(s);
  return messages.find((m) => m.tool_call_id === id);
};

/**
 * Get traceId from a message by ID
 */
const getTraceIdByDbMessageId = (id: string) => (s: ChatStoreState) =>
  getDbMessageById(id)(s)?.traceId;

/**
 * Get latest raw message from database
 */
const latestDbMessage = (s: ChatStoreState) => activeDbMessages(s).at(-1);

// ============= DB Message Filtering ========== //

/**
 * Get all tool messages from database
 */
const dbToolMessages = (s: ChatStoreState) => {
  const messages = activeDbMessages(s);
  return messages.filter((m) => m.role === 'tool');
};

/**
 * Get all user messages from database
 */
const dbUserMessages = (s: ChatStoreState) => {
  const messages = activeDbMessages(s);
  return messages.filter((m) => m.role === 'user');
};

/**
 * Get all file attachments from user messages
 */
const dbUserFiles = (s: ChatStoreState) => {
  const userMessages = dbUserMessages(s);
  return userMessages
    .filter((m) => m.fileList && m.fileList.length > 0)
    .flatMap((m) => m.fileList)
    .filter(Boolean);
};

// ============= DB Message Counting ========== //

/**
 * Count messages in a specific thread
 */
const countDbMessagesByThreadId = (id: string) => (s: ChatStoreState) => {
  const messages = activeDbMessages(s).filter((m) => m.threadId === id);
  return messages.length;
};

// ============= DB Message Status ========== //

/**
 * Check if current chat is loaded in dbMessagesMap
 */
const isCurrentDbChatLoaded = (s: ChatStoreState) => !!s.dbMessagesMap[currentDbChatKey(s)];

/**
 * Get inbox active topic raw messages from database
 */
const inboxActiveTopicDbMessages = (state: ChatStoreState) => {
  const activeTopicId = state.activeTopicId;
  const key = messageMapKey('inbox', activeTopicId);
  return state.dbMessagesMap[key] || [];
};

export const dbMessageSelectors = {
  activeDbMessages,
  countDbMessagesByThreadId,
  currentDbChatKey,
  dbToolMessages,
  dbUserFiles,
  dbUserMessages,
  getDbMessageById,
  getDbMessageByToolCallId,
  getDbMessagesByKey,
  getTraceIdByDbMessageId,
  inboxActiveTopicDbMessages,
  isCurrentDbChatLoaded,
  latestDbMessage,
};
