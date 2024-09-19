import { t } from 'i18next';

import { DEFAULT_INBOX_AVATAR, DEFAULT_USER_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { messageMapKey } from '@/store/chat/slices/message/utils';
import { featureFlagsSelectors } from '@/store/serverConfig';
import { createServerConfigStore } from '@/store/serverConfig/store';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { ChatFileItem, ChatMessage } from '@/types/message';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

import { chatHelpers } from '../../helpers';
import type { ChatStoreState } from '../../initialState';

const getMeta = (message: ChatMessage) => {
  switch (message.role) {
    case 'user': {
      return {
        avatar: userProfileSelectors.userAvatar(useUserStore.getState()) || DEFAULT_USER_AVATAR,
      };
    }

    case 'system': {
      return message.meta;
    }

    default: {
      return sessionMetaSelectors.currentAgentMeta(useSessionStore.getState());
    }
  }
};

const currentChatKey = (s: ChatStoreState) => messageMapKey(s.activeId, s.activeTopicId);

// 当前激活的消息列表
const currentChats = (s: ChatStoreState): ChatMessage[] => {
  if (!s.activeId) return [];

  const messages = s.messagesMap[currentChatKey(s)] || [];

  return messages.map((i) => ({ ...i, meta: getMeta(i) }));
};

const currentToolMessages = (s: ChatStoreState) => {
  const messages = currentChats(s);

  return messages.filter((m) => m.role === 'tool');
};

const currentUserMessages = (s: ChatStoreState) => {
  const messages = currentChats(s);

  return messages.filter((m) => m.role === 'user');
};

const currentUserFiles = (s: ChatStoreState) => {
  const userMessages = currentUserMessages(s);

  return userMessages
    .filter((m) => m.fileList && m.fileList?.length > 0)
    .flatMap((m) => m.fileList)
    .filter(Boolean) as ChatFileItem[];
};

const initTime = Date.now();

const showInboxWelcome = (s: ChatStoreState): boolean => {
  const isInbox = s.activeId === INBOX_SESSION_ID;
  if (!isInbox) return false;

  const data = currentChats(s);
  const isBrandNewChat = data.length === 0;

  return isBrandNewChat;
};

// Custom message for new assistant initialization
const currentChatsWithGuideMessage =
  (meta: MetaData) =>
  (s: ChatStoreState): ChatMessage[] => {
    // skip tool message
    const data = currentChats(s).filter((m) => m.role !== 'tool');

    const { isAgentEditable } = featureFlagsSelectors(createServerConfigStore().getState());

    const isBrandNewChat = data.length === 0;

    if (!isBrandNewChat) return data;

    const [activeId, isInbox] = [s.activeId, s.activeId === INBOX_SESSION_ID];

    const inboxMsg = '';
    const agentSystemRoleMsg = t('agentDefaultMessageWithSystemRole', {
      name: meta.title || t('defaultAgent'),
      ns: 'chat',
      systemRole: meta.description,
    });
    const agentMsg = t(isAgentEditable ? 'agentDefaultMessage' : 'agentDefaultMessageWithoutEdit', {
      name: meta.title || t('defaultAgent'),
      ns: 'chat',
      url: `/chat/settings?session=${activeId}`,
    });

    const emptyInboxGuideMessage = {
      content: isInbox ? inboxMsg : !!meta.description ? agentSystemRoleMsg : agentMsg,
      createdAt: initTime,
      extra: {},
      id: 'default',
      meta: merge({ avatar: DEFAULT_INBOX_AVATAR }, meta),
      role: 'assistant',
      updatedAt: initTime,
    } as ChatMessage;

    return [emptyInboxGuideMessage];
  };

const currentChatIDsWithGuideMessage = (s: ChatStoreState) => {
  const meta = sessionMetaSelectors.currentAgentMeta(useSessionStore.getState());

  return currentChatsWithGuideMessage(meta)(s).map((s) => s.id);
};

const currentChatsWithHistoryConfig = (s: ChatStoreState): ChatMessage[] => {
  const chats = currentChats(s);
  const config = agentSelectors.currentAgentChatConfig(useAgentStore.getState());

  return chatHelpers.getSlicedMessagesWithConfig(chats, config);
};

const chatsMessageString = (s: ChatStoreState): string => {
  const chats = currentChatsWithHistoryConfig(s);
  return chats.map((m) => m.content).join('');
};

const getMessageById = (id: string) => (s: ChatStoreState) =>
  chatHelpers.getMessageById(currentChats(s), id);

const getMessageByToolCallId = (id: string) => (s: ChatStoreState) => {
  const messages = currentChats(s);
  return messages.find((m) => m.tool_call_id === id);
};
const getTraceIdByMessageId = (id: string) => (s: ChatStoreState) => getMessageById(id)(s)?.traceId;

const latestMessage = (s: ChatStoreState) => currentChats(s).at(-1);

const currentChatLoadingState = (s: ChatStoreState) => !s.messagesInit;

const isCurrentChatLoaded = (s: ChatStoreState) => !!s.messagesMap[currentChatKey(s)];

const isMessageEditing = (id: string) => (s: ChatStoreState) => s.messageEditingIds.includes(id);
const isMessageLoading = (id: string) => (s: ChatStoreState) => s.messageLoadingIds.includes(id);

const isMessageGenerating = (id: string) => (s: ChatStoreState) => s.chatLoadingIds.includes(id);
const isMessageInRAGFlow = (id: string) => (s: ChatStoreState) =>
  s.messageRAGLoadingIds.includes(id);
const isPluginApiInvoking = (id: string) => (s: ChatStoreState) =>
  s.pluginApiLoadingIds.includes(id);

const isToolCallStreaming = (id: string, index: number) => (s: ChatStoreState) => {
  const isLoading = s.toolCallingStreamIds[id];

  if (!isLoading) return false;

  return isLoading[index];
};

const isAIGenerating = (s: ChatStoreState) => s.chatLoadingIds.length > 0;
const isInRAGFlow = (s: ChatStoreState) => s.messageRAGLoadingIds.length > 0;
const isCreatingMessage = (s: ChatStoreState) => s.isCreatingMessage;
const isHasMessageLoading = (s: ChatStoreState) => s.messageLoadingIds.length > 0;

/**
 * this function is used to determine whether the send button should be disabled
 */
const isSendButtonDisabledByMessage = (s: ChatStoreState) =>
  // 1. when there is message loading
  isHasMessageLoading(s) ||
  // 2. when is creating the topic
  s.creatingTopic ||
  // 3. when is creating the message
  isCreatingMessage(s) ||
  // 4. when the message is in RAG flow
  isInRAGFlow(s);

export const chatSelectors = {
  chatsMessageString,
  currentChatIDsWithGuideMessage,
  currentChatKey,
  currentChatLoadingState,
  currentChats,
  currentChatsWithGuideMessage,
  currentChatsWithHistoryConfig,
  currentToolMessages,
  currentUserFiles,
  getMessageById,
  getMessageByToolCallId,
  getTraceIdByMessageId,
  isAIGenerating,
  isCreatingMessage,
  isCurrentChatLoaded,
  isHasMessageLoading,
  isMessageEditing,
  isMessageGenerating,
  isMessageInRAGFlow,
  isMessageLoading,
  isPluginApiInvoking,
  isSendButtonDisabledByMessage,
  isToolCallStreaming,
  latestMessage,
  showInboxWelcome,
};
