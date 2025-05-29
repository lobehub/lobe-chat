import { describe, expect, it } from 'vitest';

import { DEFAULT_AGENT_CHAT_CONFIG, DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { AgentStoreState, initialState } from '@/store/agent/initialState';
import { LobeAgentChatConfig, LobeAgentConfig } from '@/types/agent';
import { merge } from '@/utils/merge';

import { agentChatConfigSelectors, currentAgentChatConfig } from './chatConfig';

// Helper function to create mock state
const createMockState = (
  chatConfig?: Partial<LobeAgentChatConfig>,
  config?: Partial<LobeAgentConfig>,
): AgentStoreState =>
  merge(initialState, {
    agentMap: {
      agent1: merge(DEFAULT_AGENT_CONFIG, { ...config, chatConfig }),
    },
    activeId: 'agent1',
  }) as AgentStoreState;

describe('agentChatConfigSelectors', () => {
  describe('currentAgentChatConfig', () => {
    it('should return default object when chatConfig is not defined', () => {
      const state = createMockState({});
      expect(currentAgentChatConfig(state)).toEqual(DEFAULT_AGENT_CHAT_CONFIG);
    });

    it('should return the chatConfig when defined', () => {
      const chatConfig = { historyCount: 5 };
      const state = createMockState(chatConfig);
      expect(currentAgentChatConfig(state).historyCount).toEqual(5);
    });
  });

  describe('enableHistoryCount', () => {
    it('should return the enableHistoryCount value when defined', () => {
      const state = createMockState({ enableHistoryCount: false });
      expect(agentChatConfigSelectors.enableHistoryCount(state)).toBe(false);
    });

    it('should return false value when enable context caching with claude models', () => {
      const state = createMockState(
        { enableHistoryCount: true, disableContextCaching: false },
        { model: 'claude-3-7-sonnet-20250219' },
      );

      expect(agentChatConfigSelectors.enableHistoryCount(merge(state))).toBe(false);
    });

    it('should return true value when enable context caching with other models', () => {
      const state = createMockState(
        { enableHistoryCount: true, disableContextCaching: false },
        { model: 'gpt-4o-min' },
      );

      expect(agentChatConfigSelectors.enableHistoryCount(merge(state))).toBe(true);
    });

    it('should return false when enable search with claude 3.7 models', () => {
      const state = createMockState(
        { enableHistoryCount: true, disableContextCaching: true, searchMode: 'auto' },
        { model: 'claude-3-7-sonnet-20250219' },
      );

      expect(agentChatConfigSelectors.enableHistoryCount(merge(state))).toBe(false);
    });

    it('should return true when disable search with claude 3.7 models', () => {
      const state = createMockState(
        { enableHistoryCount: true, disableContextCaching: true, searchMode: 'off' },
        { model: 'claude-3-7-sonnet-20250219' },
      );

      expect(agentChatConfigSelectors.enableHistoryCount(merge(state))).toBe(true);
    });

    it('should return true when enable search with claude 3.5 models', () => {
      const state = createMockState(
        { enableHistoryCount: true, disableContextCaching: true, searchMode: 'auto' },
        { model: 'claude-3-5-sonnet-latest' },
      );

      expect(agentChatConfigSelectors.enableHistoryCount(merge(state))).toBe(true);
    });
  });

  describe('historyCount', () => {
    it('should return undefined when historyCount is not defined', () => {
      const state = createMockState();
      expect(agentChatConfigSelectors.historyCount(state)).toBe(20);
    });

    it('should return the historyCount value when defined', () => {
      const state = createMockState({ historyCount: 20 });
      expect(agentChatConfigSelectors.historyCount(state)).toBe(20);
    });
  });

  describe('agentSearchMode', () => {
    it('should return "off" when searchMode is not defined', () => {
      const state = createMockState();
      expect(agentChatConfigSelectors.agentSearchMode(state)).toBe('off');
    });

    it('should return the searchMode value when defined', () => {
      const state = createMockState({ searchMode: 'auto' });
      expect(agentChatConfigSelectors.agentSearchMode(state)).toBe('auto');
    });
  });

  describe('useModelBuiltinSearch', () => {
    it('should return undefined when useModelBuiltinSearch is not defined', () => {
      const state = createMockState();
      expect(agentChatConfigSelectors.useModelBuiltinSearch(state)).toBeUndefined();
    });

    it('should return the useModelBuiltinSearch value when defined', () => {
      const state = createMockState({ useModelBuiltinSearch: true });
      expect(agentChatConfigSelectors.useModelBuiltinSearch(state)).toBe(true);
    });
  });

  describe('isAgentEnableSearch', () => {
    it('should return false when searchMode is "off"', () => {
      const state = createMockState({ searchMode: 'off' });
      expect(agentChatConfigSelectors.isAgentEnableSearch(state)).toBe(false);
    });

    it('should return true when searchMode is not "off"', () => {
      const state = createMockState({ searchMode: 'auto' });
      expect(agentChatConfigSelectors.isAgentEnableSearch(state)).toBe(true);
    });

    it('should return false when searchMode is undefined (defaults to "off")', () => {
      const state = createMockState();
      expect(agentChatConfigSelectors.isAgentEnableSearch(state)).toBe(false);
    });
  });

  describe('displayMode', () => {
    it('should return "chat" when displayMode is not defined', () => {
      const state = createMockState();
      expect(agentChatConfigSelectors.displayMode(state)).toBe('chat');
    });

    it('should return the displayMode value when defined', () => {
      const state = createMockState({ displayMode: 'docs' });
      expect(agentChatConfigSelectors.displayMode(state)).toBe('docs');
    });
  });

  describe('enableHistoryDivider', () => {
    it('should return false when enableHistoryCount is false', () => {
      const state = createMockState({ enableHistoryCount: false, historyCount: 5 });
      const selector = agentChatConfigSelectors.enableHistoryDivider(10, 5);
      expect(selector(state)).toBe(false);
    });

    it('should return false when historyLength is less than or equal to historyCount', () => {
      const state = createMockState({ enableHistoryCount: true, historyCount: 10 });
      const selector = agentChatConfigSelectors.enableHistoryDivider(10, 5);
      expect(selector(state)).toBe(false);
    });

    it('should return false when currentIndex is not at the historyCount position', () => {
      const state = createMockState({ enableHistoryCount: true, historyCount: 5 });
      const selector = agentChatConfigSelectors.enableHistoryDivider(10, 3);
      expect(selector(state)).toBe(false);
    });

    it('should return true when all conditions are met', () => {
      const state = createMockState({ enableHistoryCount: true, historyCount: 5 });
      const selector = agentChatConfigSelectors.enableHistoryDivider(10, 5);
      expect(selector(state)).toBe(true);
    });

    it('should handle undefined or null historyCount', () => {
      const state = createMockState({ enableHistoryCount: true, historyCount: null as any });
      const selector = agentChatConfigSelectors.enableHistoryDivider(10, 5);
      expect(selector(state)).toBe(false);
    });
  });
});
