import { ContextEngine } from '@lobechat/context-engine';
import { autoSuggestionPrompt } from '@lobechat/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';
import { createXorKeyVaultsPayload } from '@/services/_auth';
import { useUserStore } from '@/store/user';
import { systemAgentSelectors } from '@/store/user/slices/settings/selectors';
import { ChatMessage } from '@/types/message';

import { aiChatService } from './aiChat';

vi.mock('@lobechat/context-engine');
vi.mock('@lobechat/prompts');
vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    aiChat: {
      outputJSON: {
        mutate: vi.fn(),
      },
    },
  },
}));
vi.mock('@/services/_auth');
vi.mock('@/store/user');
vi.mock('@/store/user/slices/settings/selectors');

describe('AiChatService', () => {
  describe('generateSuggestion', () => {
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg1',
        role: 'user',
        content: 'Hello',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {},
      },
      {
        id: 'msg2',
        role: 'assistant',
        content: 'Hi there! How can I help you?',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {},
      },
    ] as ChatMessage[];

    const mockSystemAgentConfig = {
      enabled: true,
      model: 'gpt-4',
      provider: 'openai',
      customPrompt: '',
    };

    const mockAbortController = new AbortController();

    beforeEach(() => {
      vi.clearAllMocks();

      // Mock useUserStore.getState
      vi.mocked(useUserStore.getState).mockReturnValue({} as any);

      // Mock systemAgentSelectors.autoSuggestion
      vi.mocked(systemAgentSelectors.autoSuggestion).mockReturnValue(mockSystemAgentConfig);

      // Mock autoSuggestionPrompt
      vi.mocked(autoSuggestionPrompt).mockReturnValue('Generated prompt text');

      // Mock ContextEngine
      const mockProcess = vi.fn().mockResolvedValue({
        messages: [
          {
            content: 'Generated prompt text',
            createdAt: Date.now(),
            id: 'temp-suggestion-msg',
            meta: {},
            role: 'user',
            updatedAt: Date.now(),
          },
        ],
      });
      vi.mocked(ContextEngine).mockImplementation(
        () =>
          ({
            process: mockProcess,
          }) as any,
      );

      // Mock createXorKeyVaultsPayload
      vi.mocked(createXorKeyVaultsPayload).mockReturnValue('mock-payload' as any);
    });

    it('should generate suggestions successfully', async () => {
      const mockSuggestions = {
        suggestions: ['What can you do?', 'Tell me more', 'How does this work?'],
      };

      vi.mocked(lambdaClient.aiChat.outputJSON.mutate).mockResolvedValue(mockSuggestions);

      const result = await aiChatService.generateSuggestion(
        {
          messages: mockMessages,
          systemRole: 'You are a helpful assistant',
          maxSuggestions: 3,
        },
        mockAbortController,
      );

      expect(result).toEqual(mockSuggestions.suggestions);
      expect(autoSuggestionPrompt).toHaveBeenCalledWith({
        customPrompt: '',
        maxSuggestions: 3,
        messages: mockMessages,
        systemRole: 'You are a helpful assistant',
      });
      expect(lambdaClient.aiChat.outputJSON.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.any(Array),
          model: 'gpt-4',
          provider: 'openai',
          schema: expect.objectContaining({
            name: 'suggestions',
            schema: expect.objectContaining({
              properties: {
                suggestions: {
                  items: { type: 'string' },
                  maxItems: 3,
                  type: 'array',
                },
              },
            }),
          }),
        }),
        {
          context: { showNotification: false },
          signal: mockAbortController.signal,
        },
      );
    });

    it('should return undefined when auto-suggestions are disabled', async () => {
      vi.mocked(systemAgentSelectors.autoSuggestion).mockReturnValue({
        ...mockSystemAgentConfig,
        enabled: false,
      });

      const result = await aiChatService.generateSuggestion(
        {
          messages: mockMessages,
          systemRole: 'You are a helpful assistant',
        },
        mockAbortController,
      );

      expect(result).toBeUndefined();
      expect(lambdaClient.aiChat.outputJSON.mutate).not.toHaveBeenCalled();
    });

    it('should process messages using ContextEngine', async () => {
      const mockSuggestions = { suggestions: ['Suggestion 1'] };
      vi.mocked(lambdaClient.aiChat.outputJSON.mutate).mockResolvedValue(mockSuggestions);

      const mockContextEngine = {
        process: vi.fn().mockResolvedValue({
          messages: [
            {
              content: 'Processed prompt',
              createdAt: Date.now(),
              id: 'temp-suggestion-msg',
              meta: {},
              role: 'user',
              updatedAt: Date.now(),
            },
          ],
        }),
      };
      vi.mocked(ContextEngine).mockImplementation(() => mockContextEngine as any);

      await aiChatService.generateSuggestion(
        {
          messages: mockMessages,
        },
        mockAbortController,
      );

      expect(ContextEngine).toHaveBeenCalledWith(
        expect.objectContaining({
          pipeline: expect.any(Array),
        }),
      );
      expect(mockContextEngine.process).toHaveBeenCalledWith(
        expect.objectContaining({
          initialState: {
            messages: [],
          },
          maxTokens: 1024,
          messages: expect.any(Array),
          model: 'gpt-4',
        }),
      );
    });

    it('should handle custom prompt in system agent config', async () => {
      const customPrompt = 'Custom suggestion prompt';
      vi.mocked(systemAgentSelectors.autoSuggestion).mockReturnValue({
        ...mockSystemAgentConfig,
        customPrompt,
      });

      const mockSuggestions = { suggestions: ['Custom suggestion'] };
      vi.mocked(lambdaClient.aiChat.outputJSON.mutate).mockResolvedValue(mockSuggestions);

      await aiChatService.generateSuggestion(
        {
          messages: mockMessages,
          maxSuggestions: 2,
        },
        mockAbortController,
      );

      expect(autoSuggestionPrompt).toHaveBeenCalledWith({
        customPrompt,
        maxSuggestions: 2,
        messages: mockMessages,
        systemRole: undefined,
      });
    });

    it('should create correct XOR key vaults payload', async () => {
      const mockSuggestions = { suggestions: ['Test'] };
      vi.mocked(lambdaClient.aiChat.outputJSON.mutate).mockResolvedValue(mockSuggestions);

      await aiChatService.generateSuggestion(
        {
          messages: mockMessages,
        },
        mockAbortController,
      );

      expect(createXorKeyVaultsPayload).toHaveBeenCalledWith('openai');
      expect(lambdaClient.aiChat.outputJSON.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          keyVaultsPayload: 'mock-payload',
        }),
        expect.any(Object),
      );
    });

    it('should handle abort controller signal', async () => {
      const abortController = new AbortController();
      const mockSuggestions = { suggestions: ['Test'] };
      vi.mocked(lambdaClient.aiChat.outputJSON.mutate).mockResolvedValue(mockSuggestions);

      await aiChatService.generateSuggestion(
        {
          messages: mockMessages,
        },
        abortController,
      );

      expect(lambdaClient.aiChat.outputJSON.mutate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          signal: abortController.signal,
        }),
      );
    });

    it('should throw error when AI service fails', async () => {
      const mockError = new Error('AI service error');
      vi.mocked(lambdaClient.aiChat.outputJSON.mutate).mockRejectedValue(mockError);

      await expect(
        aiChatService.generateSuggestion(
          {
            messages: mockMessages,
          },
          mockAbortController,
        ),
      ).rejects.toThrow('AI service error');
    });

    it('should handle empty suggestions response', async () => {
      const mockSuggestions = { suggestions: [] };
      vi.mocked(lambdaClient.aiChat.outputJSON.mutate).mockResolvedValue(mockSuggestions);

      const result = await aiChatService.generateSuggestion(
        {
          messages: mockMessages,
        },
        mockAbortController,
      );

      expect(result).toEqual([]);
    });

    it('should use default maxSuggestions when not provided', async () => {
      const mockSuggestions = { suggestions: ['Test'] };
      vi.mocked(lambdaClient.aiChat.outputJSON.mutate).mockResolvedValue(mockSuggestions);

      await aiChatService.generateSuggestion(
        {
          messages: mockMessages,
        },
        mockAbortController,
      );

      expect(autoSuggestionPrompt).toHaveBeenCalledWith({
        customPrompt: '',
        maxSuggestions: undefined,
        messages: mockMessages,
        systemRole: undefined,
      });
    });
  });
});
