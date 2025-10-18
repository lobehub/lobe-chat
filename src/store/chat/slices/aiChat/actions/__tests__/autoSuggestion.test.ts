import { act, renderHook } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { aiChatService } from '@/services/aiChat';
import { messageService } from '@/services/message';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { chatSelectors } from '@/store/chat/selectors';

import { useChatStore } from '../../../../store';
import { TEST_CONTENT, TEST_IDS, createMockMessage } from './fixtures';
import { resetTestEnvironment, setupMockSelectors } from './helpers';

// Mock services
vi.mock('@/services/aiChat', () => ({
  aiChatService: {
    generateSuggestion: vi.fn(),
  },
}));

vi.mock('@/services/message', () => ({
  messageService: {
    updateMessageMetadata: vi.fn(),
  },
}));

vi.mock('zustand/traditional');

beforeEach(() => {
  resetTestEnvironment();
  setupMockSelectors();
  vi.clearAllMocks();

  // Mock internal_dispatchMessage as it's used by the actions
  act(() => {
    useChatStore.setState({
      internal_dispatchMessage: vi.fn(),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('autoSuggestion actions', () => {
  describe('generateSuggestions', () => {
    describe('validation', () => {
      it('should not generate suggestions if message not found', async () => {
        const { result } = renderHook(() => useChatStore());

        act(() => {
          useChatStore.setState({
            messagesMap: { default: [] },
          });
        });

        await act(async () => {
          await result.current.generateSuggestions('non-existent-id');
        });

        expect(aiChatService.generateSuggestion).not.toHaveBeenCalled();
        expect(result.current.internal_dispatchMessage).not.toHaveBeenCalled();
      });

      it('should not generate suggestions if message is not assistant role', async () => {
        const { result } = renderHook(() => useChatStore());
        const userMessage = createMockMessage({ id: TEST_IDS.MESSAGE_ID, role: 'user' });

        vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([userMessage]);

        await act(async () => {
          await result.current.generateSuggestions(TEST_IDS.MESSAGE_ID);
        });

        expect(aiChatService.generateSuggestion).not.toHaveBeenCalled();
      });

      it('should not generate suggestions if auto-suggestion is disabled', async () => {
        const { result } = renderHook(() => useChatStore());
        const assistantMessage = createMockMessage({
          id: TEST_IDS.MESSAGE_ID,
          role: 'assistant',
        });

        vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([assistantMessage]);

        setupMockSelectors({
          agentConfig: {
            chatConfig: {
              autoSuggestion: {
                enabled: false,
              },
            },
          },
        });

        await act(async () => {
          await result.current.generateSuggestions(TEST_IDS.MESSAGE_ID);
        });

        expect(aiChatService.generateSuggestion).not.toHaveBeenCalled();
      });
    });

    describe('successful generation', () => {
      it('should generate suggestions for assistant message', async () => {
        const { result } = renderHook(() => useChatStore());
        const assistantMessage = createMockMessage({
          id: TEST_IDS.MESSAGE_ID,
          role: 'assistant',
          content: TEST_CONTENT.AI_RESPONSE,
        });
        const suggestions = ['Follow up question 1', 'Follow up question 2'];

        vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([assistantMessage]);

        setupMockSelectors({
          agentConfig: {
            systemRole: 'You are a helpful assistant',
            chatConfig: {
              autoSuggestion: {
                enabled: true,
                maxSuggestions: 3,
              },
            },
          },
        });

        (aiChatService.generateSuggestion as Mock).mockResolvedValue(suggestions);

        await act(async () => {
          await result.current.generateSuggestions(TEST_IDS.MESSAGE_ID);
        });

        // Should set loading state initially
        expect(result.current.internal_dispatchMessage).toHaveBeenCalledWith({
          id: TEST_IDS.MESSAGE_ID,
          key: 'autoSuggestions',
          type: 'updateMessageExtra',
          value: { loading: true, suggestions: [] },
        });

        // Should call service with correct parameters
        expect(aiChatService.generateSuggestion).toHaveBeenCalledWith(
          {
            maxSuggestions: 3,
            messages: [assistantMessage],
            systemRole: 'You are a helpful assistant',
          },
          expect.any(AbortController),
        );

        // Should update with suggestions and clear loading
        expect(result.current.internal_dispatchMessage).toHaveBeenCalledWith({
          id: TEST_IDS.MESSAGE_ID,
          key: 'autoSuggestions',
          type: 'updateMessageExtra',
          value: { loading: false, suggestions },
        });
      });

      it('should pass agent configuration to service', async () => {
        const { result } = renderHook(() => useChatStore());
        const assistantMessage = createMockMessage({
          id: TEST_IDS.MESSAGE_ID,
          role: 'assistant',
        });

        vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([assistantMessage]);

        setupMockSelectors({
          agentConfig: {
            systemRole: 'Custom system role',
            chatConfig: {
              autoSuggestion: {
                enabled: true,
                maxSuggestions: 5,
              },
            },
          },
        });

        (aiChatService.generateSuggestion as Mock).mockResolvedValue(['suggestion']);

        await act(async () => {
          await result.current.generateSuggestions(TEST_IDS.MESSAGE_ID);
        });

        expect(aiChatService.generateSuggestion).toHaveBeenCalledWith(
          expect.objectContaining({
            maxSuggestions: 5,
            systemRole: 'Custom system role',
          }),
          expect.any(AbortController),
        );
      });
    });

    describe('timeout handling', () => {
      it('should abort request after 10 seconds', async () => {
        const { result } = renderHook(() => useChatStore());
        const assistantMessage = createMockMessage({
          id: TEST_IDS.MESSAGE_ID,
          role: 'assistant',
        });

        vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([assistantMessage]);

        setupMockSelectors({
          agentConfig: {
            chatConfig: {
              autoSuggestion: {
                enabled: true,
                maxSuggestions: 3,
              },
            },
          },
        });

        let capturedController: AbortController | undefined;
        (aiChatService.generateSuggestion as Mock).mockImplementation(
          async (params, controller) => {
            capturedController = controller;
            // Simulate long-running request that gets aborted
            return new Promise((resolve, reject) => {
              const timeout = setTimeout(() => resolve(['suggestion']), 15_000);
              controller.signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new Error('Request aborted'));
              });
            });
          },
        );

        vi.useFakeTimers();

        const promise = act(async () => {
          try {
            await result.current.generateSuggestions(TEST_IDS.MESSAGE_ID);
          } catch {
            // Expected to throw on abort
          }
        });

        // Fast-forward to trigger timeout
        await vi.advanceTimersByTimeAsync(10_000);

        await promise;

        expect(capturedController?.signal.aborted).toBe(true);

        vi.useRealTimers();
      });
    });

    describe('error handling', () => {
      it('should silently fail and remove autoSuggestions on error', async () => {
        const assistantMessage = createMockMessage({
          id: TEST_IDS.MESSAGE_ID,
          role: 'assistant',
        });

        vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([assistantMessage]);

        setupMockSelectors({
          agentConfig: {
            chatConfig: {
              autoSuggestion: {
                enabled: true,
                maxSuggestions: 3,
              },
            },
          },
        });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        (aiChatService.generateSuggestion as Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useChatStore());
        const dispatchSpy = result.current.internal_dispatchMessage as any;

        await act(async () => {
          await result.current.generateSuggestions(TEST_IDS.MESSAGE_ID);
        });

        // Should set loading initially
        expect(dispatchSpy).toHaveBeenCalledWith({
          id: TEST_IDS.MESSAGE_ID,
          key: 'autoSuggestions',
          type: 'updateMessageExtra',
          value: { loading: true, suggestions: [] },
        });

        // Should clear autoSuggestions on error
        expect(dispatchSpy).toHaveBeenCalledWith({
          id: TEST_IDS.MESSAGE_ID,
          key: 'autoSuggestions',
          type: 'updateMessageExtra',
          value: undefined,
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to generate suggestions:',
          expect.any(Error),
        );

        consoleErrorSpy.mockRestore();
      });

      it('should handle API timeout gracefully', async () => {
        const assistantMessage = createMockMessage({
          id: TEST_IDS.MESSAGE_ID,
          role: 'assistant',
        });

        vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([assistantMessage]);

        setupMockSelectors({
          agentConfig: {
            chatConfig: {
              autoSuggestion: {
                enabled: true,
                maxSuggestions: 3,
              },
            },
          },
        });

        const abortError = new Error('Request aborted');
        abortError.name = 'AbortError';

        (aiChatService.generateSuggestion as Mock).mockRejectedValue(abortError);

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const { result } = renderHook(() => useChatStore());
        const dispatchSpy = result.current.internal_dispatchMessage as any;

        await act(async () => {
          await result.current.generateSuggestions(TEST_IDS.MESSAGE_ID);
        });

        // Should clear autoSuggestions on abort
        expect(dispatchSpy).toHaveBeenCalledWith({
          id: TEST_IDS.MESSAGE_ID,
          key: 'autoSuggestions',
          type: 'updateMessageExtra',
          value: undefined,
        });

        consoleErrorSpy.mockRestore();
      });

      it('should handle empty suggestions response', async () => {
        const assistantMessage = createMockMessage({
          id: TEST_IDS.MESSAGE_ID,
          role: 'assistant',
        });

        vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([assistantMessage]);

        setupMockSelectors({
          agentConfig: {
            chatConfig: {
              autoSuggestion: {
                enabled: true,
                maxSuggestions: 3,
              },
            },
          },
        });

        (aiChatService.generateSuggestion as Mock).mockResolvedValue([]);

        const { result } = renderHook(() => useChatStore());
        const dispatchSpy = result.current.internal_dispatchMessage as any;

        await act(async () => {
          await result.current.generateSuggestions(TEST_IDS.MESSAGE_ID);
        });

        // Should update with empty suggestions array
        expect(dispatchSpy).toHaveBeenCalledWith({
          id: TEST_IDS.MESSAGE_ID,
          key: 'autoSuggestions',
          type: 'updateMessageExtra',
          value: { loading: false, suggestions: [] },
        });
      });
    });
  });

  describe('updateAutoSuggestionChoices', () => {
    it('should update message metadata with user feedback', async () => {
      const assistantMessage = createMockMessage({
        id: TEST_IDS.MESSAGE_ID,
        role: 'assistant',
      });

      vi.spyOn(chatSelectors, 'getMessageById').mockReturnValue(() => assistantMessage);

      const userFeedback = {
        choice: 1,
        suggestions: ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'],
      };

      const { result } = renderHook(() => useChatStore());
      const dispatchSpy = result.current.internal_dispatchMessage as any;

      await act(async () => {
        await result.current.updateAutoSuggestionChoices(TEST_IDS.MESSAGE_ID, userFeedback);
      });

      // Should clear autoSuggestions from message extra
      expect(dispatchSpy).toHaveBeenCalledWith({
        id: TEST_IDS.MESSAGE_ID,
        key: 'autoSuggestions',
        type: 'updateMessageExtra',
        value: undefined,
      });

      // Should persist user choice to message metadata
      expect(messageService.updateMessageMetadata).toHaveBeenCalledWith(TEST_IDS.MESSAGE_ID, {
        autoSuggestions: userFeedback,
      });
    });

    it('should not update if message not found', async () => {
      vi.spyOn(chatSelectors, 'getMessageById').mockReturnValue(() => undefined);

      const userFeedback = {
        choice: 0,
        suggestions: ['Suggestion 1'],
      };

      const { result } = renderHook(() => useChatStore());
      const dispatchSpy = result.current.internal_dispatchMessage as any;

      await act(async () => {
        await result.current.updateAutoSuggestionChoices('non-existent-id', userFeedback);
      });

      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(messageService.updateMessageMetadata).not.toHaveBeenCalled();
    });

    it('should handle different choice indexes', async () => {
      const assistantMessage = createMockMessage({
        id: TEST_IDS.MESSAGE_ID,
        role: 'assistant',
      });

      vi.spyOn(chatSelectors, 'getMessageById').mockReturnValue(() => assistantMessage);

      const suggestions = ['First option', 'Second option', 'Third option'];

      const { result } = renderHook(() => useChatStore());

      // Test choice 0
      await act(async () => {
        await result.current.updateAutoSuggestionChoices(TEST_IDS.MESSAGE_ID, {
          choice: 0,
          suggestions,
        });
      });

      expect(messageService.updateMessageMetadata).toHaveBeenCalledWith(TEST_IDS.MESSAGE_ID, {
        autoSuggestions: { choice: 0, suggestions },
      });

      // Test choice 2
      await act(async () => {
        await result.current.updateAutoSuggestionChoices(TEST_IDS.MESSAGE_ID, {
          choice: 2,
          suggestions,
        });
      });

      expect(messageService.updateMessageMetadata).toHaveBeenCalledWith(TEST_IDS.MESSAGE_ID, {
        autoSuggestions: { choice: 2, suggestions },
      });
    });

    it('should update metadata even with single suggestion', async () => {
      const assistantMessage = createMockMessage({
        id: TEST_IDS.MESSAGE_ID,
        role: 'assistant',
      });

      vi.spyOn(chatSelectors, 'getMessageById').mockReturnValue(() => assistantMessage);

      const userFeedback = {
        choice: 0,
        suggestions: ['Only one suggestion'],
      };

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.updateAutoSuggestionChoices(TEST_IDS.MESSAGE_ID, userFeedback);
      });

      expect(messageService.updateMessageMetadata).toHaveBeenCalledWith(TEST_IDS.MESSAGE_ID, {
        autoSuggestions: userFeedback,
      });
    });

    it('should handle metadata update errors gracefully', async () => {
      const assistantMessage = createMockMessage({
        id: TEST_IDS.MESSAGE_ID,
        role: 'assistant',
      });

      vi.spyOn(chatSelectors, 'getMessageById').mockReturnValue(() => assistantMessage);

      (messageService.updateMessageMetadata as Mock).mockRejectedValue(new Error('Update failed'));

      const userFeedback = {
        choice: 1,
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      };

      const { result } = renderHook(() => useChatStore());
      const dispatchSpy = result.current.internal_dispatchMessage as any;

      // Should throw error if update fails
      await expect(
        act(async () => {
          await result.current.updateAutoSuggestionChoices(TEST_IDS.MESSAGE_ID, userFeedback);
        }),
      ).rejects.toThrow('Update failed');

      // Should still have attempted to clear UI state before error
      expect(dispatchSpy).toHaveBeenCalledWith({
        id: TEST_IDS.MESSAGE_ID,
        key: 'autoSuggestions',
        type: 'updateMessageExtra',
        value: undefined,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete suggestion workflow', async () => {
      const assistantMessage = createMockMessage({
        id: TEST_IDS.MESSAGE_ID,
        role: 'assistant',
        content: 'AI response about weather',
      });

      vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([assistantMessage]);
      vi.spyOn(chatSelectors, 'getMessageById').mockReturnValue(() => assistantMessage);

      setupMockSelectors({
        agentConfig: {
          systemRole: 'Weather assistant',
          chatConfig: {
            autoSuggestion: {
              enabled: true,
              maxSuggestions: 3,
            },
          },
        },
      });

      const suggestions = ['What about tomorrow?', 'Show me weekly forecast', 'Any rain today?'];

      (aiChatService.generateSuggestion as Mock).mockResolvedValue(suggestions);

      const { result } = renderHook(() => useChatStore());
      const dispatchSpy = result.current.internal_dispatchMessage as any;

      // Step 1: Generate suggestions
      await act(async () => {
        await result.current.generateSuggestions(TEST_IDS.MESSAGE_ID);
      });

      expect(dispatchSpy).toHaveBeenCalledWith({
        id: TEST_IDS.MESSAGE_ID,
        key: 'autoSuggestions',
        type: 'updateMessageExtra',
        value: { loading: false, suggestions },
      });

      // Step 2: User selects a suggestion
      await act(async () => {
        await result.current.updateAutoSuggestionChoices(TEST_IDS.MESSAGE_ID, {
          choice: 1,
          suggestions,
        });
      });

      expect(dispatchSpy).toHaveBeenCalledWith({
        id: TEST_IDS.MESSAGE_ID,
        key: 'autoSuggestions',
        type: 'updateMessageExtra',
        value: undefined,
      });

      expect(messageService.updateMessageMetadata).toHaveBeenCalledWith(TEST_IDS.MESSAGE_ID, {
        autoSuggestions: { choice: 1, suggestions },
      });
    });

    it('should handle concurrent suggestion generations', async () => {
      const message1 = createMockMessage({ id: 'msg-1', role: 'assistant' });
      const message2 = createMockMessage({ id: 'msg-2', role: 'assistant' });

      vi.spyOn(chatSelectors, 'activeBaseChats').mockReturnValue([message1, message2]);

      setupMockSelectors({
        agentConfig: {
          chatConfig: {
            autoSuggestion: {
              enabled: true,
              maxSuggestions: 2,
            },
          },
        },
      });

      (aiChatService.generateSuggestion as Mock).mockResolvedValue(['suggestion']);

      const { result } = renderHook(() => useChatStore());

      // Generate suggestions for both messages concurrently
      await act(async () => {
        await Promise.all([
          result.current.generateSuggestions('msg-1'),
          result.current.generateSuggestions('msg-2'),
        ]);
      });

      // Both should have been processed
      expect(aiChatService.generateSuggestion).toHaveBeenCalledTimes(2);
    });
  });
});
