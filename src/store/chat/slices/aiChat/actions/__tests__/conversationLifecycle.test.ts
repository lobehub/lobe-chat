import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { aiChatService } from '@/services/aiChat';
import { getSessionStoreState } from '@/store/session';

import { useChatStore } from '../../../../store';
import { TEST_CONTENT, TEST_IDS, createMockMessage } from './fixtures';
import {
  resetTestEnvironment,
  setupMockSelectors,
  setupStoreWithMessages,
  spyOnMessageService,
} from './helpers';

// Keep zustand mock as it's needed globally
vi.mock('zustand/traditional');

// Mock lambdaClient to prevent network requests
vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    session: {
      updateSession: {
        mutate: vi.fn().mockResolvedValue(undefined),
      },
    },
  },
}));

beforeEach(() => {
  resetTestEnvironment();
  setupMockSelectors();
  spyOnMessageService();
  const sessionStore = getSessionStoreState();
  vi.spyOn(sessionStore, 'triggerSessionUpdate').mockResolvedValue(undefined);

  act(() => {
    useChatStore.setState({
      refreshMessages: vi.fn(),
      refreshTopic: vi.fn(),
      internal_execAgentRuntime: vi.fn(),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ConversationLifecycle actions', () => {
  describe('sendMessage', () => {
    describe('validation', () => {
      it('should not send when there is no active session', async () => {
        act(() => {
          useChatStore.setState({ activeId: undefined });
        });

        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
        });

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
      });

      it('should not send when message is empty and no files are provided', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.EMPTY });
        });

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
      });

      it('should not send when message is empty with empty files array', async () => {
        const { result } = renderHook(() => useChatStore());

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.EMPTY, files: [] });
        });

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
      });
    });

    describe('message creation', () => {
      it('should not process AI when onlyAddUserMessage is true', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.spyOn(aiChatService, 'sendMessageInServer').mockResolvedValue({
          messages: [],
          topics: [],
          assistantMessageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
        } as any);

        await act(async () => {
          await result.current.sendMessage({
            message: TEST_CONTENT.USER_MESSAGE,
            onlyAddUserMessage: true,
          });
        });

        expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
      });

      it('should create user message and trigger AI processing', async () => {
        const { result } = renderHook(() => useChatStore());

        vi.spyOn(aiChatService, 'sendMessageInServer').mockResolvedValue({
          messages: [
            createMockMessage({ id: TEST_IDS.USER_MESSAGE_ID, role: 'user' }),
            createMockMessage({ id: TEST_IDS.ASSISTANT_MESSAGE_ID, role: 'assistant' }),
          ],
          topics: [],
          assistantMessageId: TEST_IDS.ASSISTANT_MESSAGE_ID,
        } as any);

        await act(async () => {
          await result.current.sendMessage({ message: TEST_CONTENT.USER_MESSAGE });
        });

        expect(result.current.internal_execAgentRuntime).toHaveBeenCalled();
      });
    });
  });

  describe('regenerateUserMessage', () => {
    it('should trigger user message regeneration', async () => {
      const messages = [
        createMockMessage({ id: TEST_IDS.USER_MESSAGE_ID, role: 'user', content: 'test' }),
        createMockMessage({ id: TEST_IDS.MESSAGE_ID, role: 'assistant' }),
      ];

      setupStoreWithMessages(messages);

      const switchMessageBranchSpy = vi.fn().mockResolvedValue(undefined);
      const internalTraceSpy = vi.fn();

      act(() => {
        useChatStore.setState({
          internal_traceMessage: internalTraceSpy,
          switchMessageBranch: switchMessageBranchSpy,
          internal_shouldUseRAG: vi.fn().mockReturnValue(false),
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.regenerateUserMessage(TEST_IDS.USER_MESSAGE_ID);
      });

      expect(switchMessageBranchSpy).toHaveBeenCalledWith(TEST_IDS.USER_MESSAGE_ID, 1);
      expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
        expect.objectContaining({
          parentMessageId: TEST_IDS.USER_MESSAGE_ID,
          parentMessageType: 'user',
        }),
      );
      expect(internalTraceSpy).toHaveBeenCalled();
    });

    it('should not regenerate when already regenerating', async () => {
      const { result } = renderHook(() => useChatStore());

      // Create a regenerate operation to simulate already regenerating
      act(() => {
        const { operationId } = result.current.startOperation({
          type: 'regenerate',
          context: { sessionId: TEST_IDS.SESSION_ID, messageId: TEST_IDS.USER_MESSAGE_ID },
        });

        useChatStore.setState({
          internal_execAgentRuntime: vi.fn(),
        });
      });

      await act(async () => {
        await result.current.regenerateUserMessage(TEST_IDS.USER_MESSAGE_ID);
      });

      expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
    });
  });

  describe('regenerateAssistantMessage', () => {
    it('should trigger assistant message regeneration', async () => {
      const messages = [
        createMockMessage({ id: TEST_IDS.USER_MESSAGE_ID, role: 'user' }),
        createMockMessage({
          id: TEST_IDS.MESSAGE_ID,
          role: 'assistant',
          parentId: TEST_IDS.USER_MESSAGE_ID,
        }),
      ];

      setupStoreWithMessages(messages);

      act(() => {
        useChatStore.setState({
          internal_traceMessage: vi.fn(),
          switchMessageBranch: vi.fn(),
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.regenerateAssistantMessage(TEST_IDS.MESSAGE_ID);
      });

      expect(result.current.internal_execAgentRuntime).toHaveBeenCalledWith(
        expect.objectContaining({
          parentMessageId: TEST_IDS.USER_MESSAGE_ID,
          parentMessageType: 'user',
        }),
      );
      expect(result.current.internal_traceMessage).toHaveBeenCalled();
    });

    it('should not regenerate when already regenerating', async () => {
      const { result } = renderHook(() => useChatStore());

      // Create a regenerate operation to simulate already regenerating
      act(() => {
        result.current.startOperation({
          type: 'regenerate',
          context: { sessionId: TEST_IDS.SESSION_ID, messageId: TEST_IDS.MESSAGE_ID },
        });

        useChatStore.setState({
          internal_execAgentRuntime: vi.fn(),
        });
      });

      await act(async () => {
        await result.current.regenerateAssistantMessage(TEST_IDS.MESSAGE_ID);
      });

      expect(result.current.internal_execAgentRuntime).not.toHaveBeenCalled();
    });
  });

  describe('delAndRegenerateMessage', () => {
    it('should delete message then regenerate', async () => {
      const messages = [
        createMockMessage({ id: TEST_IDS.USER_MESSAGE_ID, role: 'user' }),
        createMockMessage({
          id: TEST_IDS.MESSAGE_ID,
          role: 'assistant',
          parentId: TEST_IDS.USER_MESSAGE_ID,
        }),
      ];

      setupStoreWithMessages(messages);

      act(() => {
        useChatStore.setState({
          regenerateAssistantMessage: vi.fn(),
          deleteMessage: vi.fn(),
          internal_traceMessage: vi.fn(),
        });
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.delAndRegenerateMessage(TEST_IDS.MESSAGE_ID);
      });

      expect(result.current.regenerateAssistantMessage).toHaveBeenCalledWith(
        TEST_IDS.MESSAGE_ID,
        expect.objectContaining({ skipTrace: true }),
      );
      expect(result.current.deleteMessage).toHaveBeenCalledWith(TEST_IDS.MESSAGE_ID);
      expect(result.current.internal_traceMessage).toHaveBeenCalled();
    });
  });
});
