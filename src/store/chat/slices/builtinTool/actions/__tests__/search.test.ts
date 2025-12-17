import { crawlResultsPrompt, searchResultsPrompt } from '@lobechat/prompts';
import { SearchContent, SearchQuery, UniformSearchResponse } from '@lobechat/types';
import { UIChatMessage } from '@lobechat/types';
import { act, renderHook } from '@testing-library/react';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { searchService } from '@/services/search';
import { useChatStore } from '@/store/chat';
import { dbMessageSelectors } from '@/store/chat/selectors';
import { CRAWL_CONTENT_LIMITED_COUNT } from '@/tools/web-browsing/const';

// Mock services
vi.mock('@/services/search', () => ({
  searchService: {
    webSearch: vi.fn(),
    crawlPages: vi.fn(),
  },
}));

vi.mock('@/store/chat/selectors', () => ({
  dbMessageSelectors: {
    getDbMessageById: vi.fn(),
  },
}));

describe('search actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatStore.setState({
      activeId: 'session-id',
      activeTopicId: 'topic-id',
      searchLoading: {},
      optimisticUpdateMessageContent: vi.fn(),
      optimisticUpdateMessagePluginError: vi.fn(),
      optimisticUpdatePluginArguments: vi.fn(),
      optimisticUpdatePluginState: vi.fn(),
      optimisticCreateMessage: vi.fn(),
      optimisticAddToolToAssistantMessage: vi.fn(),
      openToolUI: vi.fn(),
    });

    // Default mock for dbMessageSelectors - returns undefined to use activeId/activeTopicId
    vi.spyOn(dbMessageSelectors, 'getDbMessageById').mockImplementation(() => () => undefined);
  });

  describe('search', () => {
    it('should handle successful search', async () => {
      const mockResponse: UniformSearchResponse = {
        results: [
          {
            title: 'Test Result',
            content: 'Test Content',
            url: 'https://test.com',
            category: 'general',
            engines: ['google'],
            parsedUrl: 'test.com',
            score: 1,
          },
        ],
        costTime: 1,
        resultNumbers: 1,
        query: 'test',
      };

      (searchService.webSearch as Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatStore());
      const { search } = result.current;

      const messageId = 'test-message-id';
      const query: SearchQuery = {
        searchEngines: ['google'],
        query: 'test query',
      };

      await act(async () => {
        await search(messageId, query);
      });

      const expectedContent: SearchContent[] = [
        {
          title: 'Test Result',
          url: 'https://test.com',
          content: 'Test Content',
        },
      ];

      expect(searchService.webSearch).toHaveBeenCalledWith(
        {
          searchEngines: ['google'],
          query: 'test query',
        },
        { signal: expect.any(AbortSignal) },
      );
      expect(result.current.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        searchResultsPrompt(expectedContent),
        undefined,
        { operationId: expect.any(String) },
      );
    });

    it('should handle empty search results', async () => {
      const emptyResponse: UniformSearchResponse = {
        results: [],
        costTime: 1,
        resultNumbers: 0,
        query: 'test',
      };

      (searchService.webSearch as Mock).mockResolvedValue(emptyResponse);

      const { result } = renderHook(() => useChatStore());
      const { search } = result.current;

      const messageId = 'test-message-id';
      const query: SearchQuery = {
        searchEngines: ['custom-engine'],
        searchTimeRange: 'year',
        query: 'test query',
      };

      await act(async () => {
        await search(messageId, query);
      });

      expect(searchService.webSearch).toHaveBeenCalledWith(
        {
          searchEngines: ['custom-engine'],
          searchTimeRange: 'year',
          query: 'test query',
        },
        { signal: expect.any(AbortSignal) },
      );
      expect(result.current.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        searchResultsPrompt([]),
        undefined,
        { operationId: expect.any(String) },
      );
    });

    it('should handle search error', async () => {
      const error = new Error('Search failed');
      (searchService.webSearch as Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useChatStore());
      const { search } = result.current;

      const messageId = 'test-message-id';
      const query: SearchQuery = {
        query: 'test query',
      };

      await act(async () => {
        await search(messageId, query);
      });

      expect(result.current.optimisticUpdateMessagePluginError).toHaveBeenCalledWith(
        messageId,
        {
          body: error,
          message: 'Search failed',
          type: 'PluginServerError',
        },
        { operationId: expect.any(String) },
      );
    });
  });

  describe('crawlMultiPages', () => {
    it('should truncate content that exceeds limit', async () => {
      const longContent = 'a'.repeat(CRAWL_CONTENT_LIMITED_COUNT + 1000);
      const mockResponse = {
        results: [
          {
            data: {
              content: longContent,
              title: 'Test Page',
            },
            crawler: 'naive',
            originalUrl: 'https://test.com',
          },
        ],
      };

      (searchService.crawlPages as Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatStore());
      const messageId = 'test-message-id';

      await act(async () => {
        await result.current.crawlMultiPages(messageId, { urls: ['https://test.com'] });
      });

      const expectedContent = [
        {
          content: longContent.slice(0, CRAWL_CONTENT_LIMITED_COUNT),
          title: 'Test Page',
        },
      ];

      expect(result.current.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        crawlResultsPrompt(expectedContent as any),
        undefined,
        { operationId: expect.any(String) },
      );
    });

    it('should handle crawl errors', async () => {
      const mockResponse = {
        results: [
          {
            errorMessage: 'Failed to crawl',
            errorType: 'CRAWL_ERROR',
            originalUrl: 'https://test.com',
          },
        ],
      };

      (searchService.crawlPages as Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useChatStore());
      const messageId = 'test-message-id';

      await act(async () => {
        await result.current.crawlMultiPages(messageId, { urls: ['https://test.com'] });
      });

      expect(result.current.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        crawlResultsPrompt(mockResponse.results),
        undefined,
        { operationId: expect.any(String) },
      );
    });
  });

  describe('reSearchWithSearXNG', () => {
    it('should update arguments and perform search', async () => {
      const { result } = renderHook(() => useChatStore());
      const spy = vi.spyOn(result.current, 'search');

      const messageId = 'test-message-id';
      const operationId = 'op_test';

      // Set up messageOperationMap so triggerSearchAgain can get operationId
      useChatStore.setState({
        messageOperationMap: {
          [messageId]: operationId,
        },
      });

      const { triggerSearchAgain } = result.current;
      const query: SearchQuery = {
        query: 'test query',
      };

      await act(async () => {
        await triggerSearchAgain(messageId, query, { aiSummary: true });
      });

      expect(result.current.optimisticUpdatePluginArguments).toHaveBeenCalledWith(
        messageId,
        query,
        false,
        { operationId },
      );
      expect(spy).toHaveBeenCalledWith(messageId, query, true);
    });
  });

  describe('saveSearXNGSearchResult', () => {
    it('should save search result as tool message', async () => {
      const messageId = 'test-message-id';
      const parentId = 'parent-message-id';
      const mockMessage: Partial<UIChatMessage> = {
        id: messageId,
        parentId,
        sessionId: undefined,
        topicId: undefined,
        content: 'test content',
        plugin: {
          identifier: 'search',
          arguments: '{}',
          apiName: 'search',
          type: 'default',
        },
        pluginState: {},
        role: 'assistant',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {},
      };

      vi.spyOn(dbMessageSelectors, 'getDbMessageById').mockImplementation(
        () => () => mockMessage as UIChatMessage,
      );

      const { result } = renderHook(() => useChatStore());
      const { saveSearchResult } = result.current;

      await act(async () => {
        await saveSearchResult(messageId);
      });

      expect(result.current.optimisticCreateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'test content',
          parentId,
          plugin: mockMessage.plugin,
          pluginState: mockMessage.pluginState,
          role: 'tool',
          sessionId: 'session-id',
          topicId: 'topic-id',
        }),
        { operationId: expect.any(String) },
      );

      expect(result.current.optimisticAddToolToAssistantMessage).toHaveBeenCalledWith(
        parentId,
        expect.objectContaining({
          identifier: 'search',
          type: 'default',
        }),
        { operationId: expect.any(String) },
      );
    });

    it('should not save if message not found', async () => {
      vi.spyOn(dbMessageSelectors, 'getDbMessageById').mockImplementation(() => () => undefined);

      const { result } = renderHook(() => useChatStore());
      const { saveSearchResult } = result.current;

      await act(async () => {
        await saveSearchResult('non-existent-id');
      });

      expect(result.current.optimisticCreateMessage).not.toHaveBeenCalled();
      expect(result.current.optimisticAddToolToAssistantMessage).not.toHaveBeenCalled();
    });
  });

  // toggleSearchLoading is no longer needed as we use operation-based state management

  describe('OptimisticUpdateContext isolation', () => {
    it('search should pass context to optimistic methods', async () => {
      const mockResponse: UniformSearchResponse = {
        results: [
          {
            title: 'Test',
            content: 'Content',
            url: 'https://test.com',
            category: 'general',
            engines: ['google'],
            parsedUrl: 'test.com',
            score: 1,
          },
        ],
        costTime: 1,
        resultNumbers: 1,
        query: 'test',
      };

      (searchService.webSearch as Mock).mockResolvedValue(mockResponse);

      const messageId = 'test-message-id';
      const contextSessionId = 'context-session-id';
      const contextTopicId = 'context-topic-id';

      const mockMessage: Partial<UIChatMessage> = {
        id: messageId,
        sessionId: contextSessionId,
        topicId: contextTopicId,
        role: 'tool',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {},
      };

      vi.spyOn(dbMessageSelectors, 'getDbMessageById').mockImplementation(
        () => () => mockMessage as UIChatMessage,
      );

      const { result } = renderHook(() => useChatStore());
      const query: SearchQuery = { query: 'test' };

      await act(async () => {
        await result.current.search(messageId, query);
      });

      expect(result.current.optimisticUpdatePluginState).toHaveBeenCalledWith(
        messageId,
        expect.any(Object),
        { operationId: expect.any(String) },
      );
      expect(result.current.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        expect.any(String),
        undefined,
        { operationId: expect.any(String) },
      );
    });

    it('crawlMultiPages should pass context to optimistic methods', async () => {
      const mockResponse = {
        results: [
          {
            data: {
              content: 'Test content',
              title: 'Test',
            },
            crawler: 'naive',
            originalUrl: 'https://test.com',
          },
        ],
      };

      (searchService.crawlPages as Mock).mockResolvedValue(mockResponse);

      const messageId = 'test-message-id';
      const contextSessionId = 'context-session-id';
      const contextTopicId = 'context-topic-id';

      const mockMessage: Partial<UIChatMessage> = {
        id: messageId,
        sessionId: contextSessionId,
        topicId: contextTopicId,
        role: 'tool',
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {},
      };

      vi.spyOn(dbMessageSelectors, 'getDbMessageById').mockImplementation(
        () => () => mockMessage as UIChatMessage,
      );

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.crawlMultiPages(messageId, { urls: ['https://test.com'] });
      });

      expect(result.current.optimisticUpdateMessageContent).toHaveBeenCalledWith(
        messageId,
        expect.any(String),
        undefined,
        { operationId: expect.any(String) },
      );
      expect(result.current.optimisticUpdatePluginState).toHaveBeenCalledWith(
        messageId,
        expect.any(Object),
        { operationId: expect.any(String) },
      );
    });

    it('saveSearchResult should pass context to optimistic methods', async () => {
      const messageId = 'test-message-id';
      const parentId = 'parent-message-id';
      const contextSessionId = 'context-session-id';
      const contextTopicId = 'context-topic-id';

      const mockMessage: Partial<UIChatMessage> = {
        id: messageId,
        parentId,
        sessionId: contextSessionId,
        topicId: contextTopicId,
        content: 'test content',
        plugin: {
          identifier: 'search',
          arguments: '{}',
          apiName: 'search',
          type: 'default',
        },
        pluginState: {},
        role: 'tool',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {},
      };

      vi.spyOn(dbMessageSelectors, 'getDbMessageById').mockImplementation(
        () => () => mockMessage as UIChatMessage,
      );

      (useChatStore.getState().optimisticCreateMessage as Mock).mockResolvedValue({
        id: 'new-message-id',
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.saveSearchResult(messageId);
      });

      expect(result.current.optimisticAddToolToAssistantMessage).toHaveBeenCalledWith(
        parentId,
        expect.objectContaining({
          identifier: 'search',
          type: 'default',
        }),
        { operationId: expect.any(String) },
      );
      expect(result.current.optimisticCreateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: contextSessionId,
          topicId: contextTopicId,
        }),
        { operationId: expect.any(String) },
      );
    });
  });
});
