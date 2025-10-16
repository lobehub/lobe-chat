import { vi } from 'vitest';

import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';
import { sessionMetaSelectors } from '@/store/session/selectors';

import { useChatStore } from '../../../../store';
import { messageMapKey } from '../../../../utils/messageMapKey';
import { TEST_IDS, createMockAgentConfig, createMockChatConfig } from './fixtures';

/**
 * Setup mock selectors with default or custom values
 */
export const setupMockSelectors = (
  options: {
    agentConfig?: Record<string, any>;
    agentMeta?: Record<string, any>;
    chatConfig?: Record<string, any>;
  } = {},
) => {
  vi.spyOn(agentSelectors, 'currentAgentConfig').mockImplementation(() =>
    createMockAgentConfig(options.agentConfig),
  );

  vi.spyOn(agentChatConfigSelectors, 'currentChatConfig').mockImplementation(() =>
    createMockChatConfig(options.chatConfig),
  );

  vi.spyOn(sessionMetaSelectors, 'currentAgentMeta').mockImplementation(
    () => options.agentMeta || { tags: [] },
  );
};

/**
 * Setup store state with messages
 */
export const setupStoreWithMessages = (messages: any[], sessionId = TEST_IDS.SESSION_ID) => {
  useChatStore.setState({
    activeId: sessionId,
    messagesMap: {
      [messageMapKey(sessionId)]: messages,
    },
  });
};

/**
 * Create a mock AbortController for testing
 */
export const createMockAbortController = () => {
  const controller = new AbortController();
  vi.spyOn(controller, 'abort');
  return controller;
};

/**
 * Setup spies for message service methods
 */
export const spyOnMessageService = () => {
  const createMessageSpy = vi
    .spyOn(messageService, 'createMessage')
    .mockResolvedValue(TEST_IDS.NEW_MESSAGE_ID);
  const updateMessageSpy = vi.spyOn(messageService, 'updateMessage').mockResolvedValue(undefined);
  const removeMessageSpy = vi.spyOn(messageService, 'removeMessage').mockResolvedValue(undefined);
  const updateMessageErrorSpy = vi
    .spyOn(messageService, 'updateMessageError')
    .mockResolvedValue(undefined);

  return {
    createMessageSpy,
    removeMessageSpy,
    updateMessageErrorSpy,
    updateMessageSpy,
  };
};

/**
 * Setup spies for chat service methods
 */
export const spyOnChatService = () => {
  const createAssistantMessageSpy = vi
    .spyOn(chatService, 'createAssistantMessage')
    .mockResolvedValue(new Response(TEST_IDS.ASSISTANT_MESSAGE_ID));

  return {
    createAssistantMessageSpy,
  };
};

/**
 * Reset all mocks and store state to clean state
 */
export const resetTestEnvironment = () => {
  vi.clearAllMocks();
  useChatStore.setState(
    {
      activeId: TEST_IDS.SESSION_ID,
      activeTopicId: TEST_IDS.TOPIC_ID,
      chatLoadingIds: [],
      chatLoadingIdsAbortController: undefined,
      messagesMap: {},
      toolCallingStreamIds: {},
    },
    false,
  );
};
