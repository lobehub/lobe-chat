import { MESSAGE_THREAD_DIVIDER_ID, THREAD_DRAFT_ID } from '@/const/message';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import type { ChatStoreState } from '@/store/chat';
import { chatHelpers } from '@/store/chat/helpers';
import { ChatMessage } from '@/types/message';
import { ThreadItem } from '@/types/topic';

import { chatSelectors } from '../../message/selectors';
import { genMessage } from './util';

const currentTopicThreads = (s: ChatStoreState) => {
  if (!s.activeTopicId) return [];

  return s.threadMaps[s.activeTopicId] || [];
};

const currentPortalThread = (s: ChatStoreState): ThreadItem | undefined => {
  if (!s.portalThreadId) return undefined;

  const threads = currentTopicThreads(s);

  return threads.find((t) => t.id === s.portalThreadId);
};

const threadStartMessageId = (s: ChatStoreState) => s.threadStartMessageId;

const threadSourceMessageId = (s: ChatStoreState) => {
  if (s.startToForkThread) return threadStartMessageId(s);

  const portalThread = currentPortalThread(s);
  return portalThread?.sourceMessageId;
};

const getTheadParentMessages = (s: ChatStoreState, data: ChatMessage[]) => {
  if (s.startToForkThread) {
    const startMessageId = threadStartMessageId(s)!;

    // 存在 threadId 的消息是子消息，在创建付消息时需要忽略
    const messages = data.filter((m) => !m.threadId);
    return genMessage(messages, startMessageId, s.newThreadMode);
  }

  const portalThread = currentPortalThread(s);
  return genMessage(data, portalThread?.sourceMessageId, portalThread?.type);
};

// ======= Portal Thread Display Chats ======= //
// =========================================== //

/**
 * 获取当前 thread 的父级消息
 */
const portalDisplayParentMessages = (s: ChatStoreState): ChatMessage[] => {
  const data = chatSelectors.activeBaseChatsWithoutTool(s);

  return getTheadParentMessages(s, data);
};

const portalDisplayParentMessageIDs = (s: ChatStoreState): string[] => {
  const ids = portalDisplayParentMessages(s).map((i) => i.id);
  // 如果是独立话题模式，则只显示话题开始消息

  return [...ids, MESSAGE_THREAD_DIVIDER_ID].filter(Boolean) as string[];
};

/**
 * these messages are the messages that are in the thread
 *
 */
const portalDisplayChildChatsByThreadId =
  (id?: string) =>
  (s: ChatStoreState): ChatMessage[] => {
    // skip tool message
    const data = chatSelectors.activeBaseChatsWithoutTool(s);

    return data.filter((m) => !!id && m.threadId === id);
  };

const portalDisplayChildChatIDsByThreadId =
  (id?: string) =>
  (s: ChatStoreState): string[] => {
    return portalDisplayChildChatsByThreadId(id)(s).map((i) => i.id);
  };

const portalDisplayChats = (s: ChatStoreState) => {
  const parentMessages = portalDisplayParentMessages(s);
  const afterMessages = portalDisplayChildChatsByThreadId(s.portalThreadId)(s);
  // use for optimistic update
  const draftMessage = chatSelectors.activeBaseChats(s).find((m) => m.threadId === THREAD_DRAFT_ID);

  return [...parentMessages, draftMessage, ...afterMessages].filter(Boolean) as ChatMessage[];
};

const portalDisplayChatsString = (s: ChatStoreState) => {
  const messages = portalDisplayChats(s);

  return messages.map((m) => m.content).join('');
};

const portalDisplayChatIDs = (s: ChatStoreState): string[] => {
  const parentMessages = portalDisplayParentMessageIDs(s);
  const portalMessages = portalDisplayChildChatIDsByThreadId(s.portalThreadId)(s);

  // use for optimistic update
  const draftMessage = chatSelectors.activeBaseChats(s).find((m) => m.threadId === THREAD_DRAFT_ID);

  return [...parentMessages, draftMessage?.id, ...portalMessages].filter(Boolean) as string[];
};

// ======= Portal Thread AI Chats ======= //
// =========================================== //

const portalAIParentMessages = (s: ChatStoreState): ChatMessage[] => {
  const data = chatSelectors.activeBaseChats(s);

  return getTheadParentMessages(s, data);
};

const portalAIChildChatsByThreadId =
  (id?: string) =>
  (s: ChatStoreState): ChatMessage[] => {
    // skip tool message
    const data = chatSelectors.activeBaseChats(s);

    return data.filter((m) => !!id && m.threadId === id);
  };

const portalAIChats = (s: ChatStoreState) => {
  const parentMessages = portalAIParentMessages(s);
  const afterMessages = portalAIChildChatsByThreadId(s.portalThreadId)(s);

  return [...parentMessages, ...afterMessages].filter(Boolean) as ChatMessage[];
};

const portalAIChatsWithHistoryConfig = (s: ChatStoreState) => {
  const parentMessages = portalAIParentMessages(s);
  const afterMessages = portalAIChildChatsByThreadId(s.portalThreadId)(s);

  const messages = [...parentMessages, ...afterMessages].filter(Boolean) as ChatMessage[];

  const config = agentSelectors.currentAgentChatConfig(useAgentStore.getState());

  return chatHelpers.getSlicedMessagesWithConfig(messages, config);
};

const threadSourceMessageIndex = (s: ChatStoreState) => {
  const theadMessageId = threadSourceMessageId(s);
  const data = portalDisplayChats(s);

  return !theadMessageId ? -1 : data.findIndex((d) => d.id === theadMessageId);
};
const getThreadsByTopic = (topicId?: string) => (s: ChatStoreState) => {
  if (!topicId) return;

  return s.threadMaps[topicId];
};

const getFirstThreadBySourceMsgId = (id: string) => (s: ChatStoreState) => {
  const threads = currentTopicThreads(s);

  return threads.find((t) => t.sourceMessageId === id);
};

const getThreadsBySourceMsgId = (id: string) => (s: ChatStoreState) => {
  const threads = currentTopicThreads(s);

  return threads.filter((t) => t.sourceMessageId === id);
};

const hasThreadBySourceMsgId = (id: string) => (s: ChatStoreState) => {
  const threads = currentTopicThreads(s);

  return threads.some((t) => t.sourceMessageId === id);
};

export const threadSelectors = {
  currentPortalThread,
  currentTopicThreads,
  getFirstThreadBySourceMsgId,
  getThreadsBySourceMsgId,
  getThreadsByTopic,
  hasThreadBySourceMsgId,
  portalAIChats,
  portalAIChatsWithHistoryConfig,
  portalDisplayChatIDs,
  portalDisplayChats,
  portalDisplayChatsString,
  portalDisplayChildChatIDsByThreadId,
  portalDisplayChildChatsByThreadId,
  threadSourceMessageId,
  threadSourceMessageIndex,
  threadStartMessageId,
};
