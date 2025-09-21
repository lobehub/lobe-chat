import { StateCreator } from 'zustand/vanilla';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatStore } from '@/store/chat/store';
import { ChatAutoSuggestions, ChatMessage } from '@/types/message';
import { generateAutoSuggestions } from '@/utils/suggestion';

import { chatSelectors } from '../../selectors';

export interface ChatAutoSuggestionAction {
  /**
   * Generate auto-suggestions for a message
   */
  generateSuggestions: (messageId: string) => Promise<void>;
  /**
   * Update suggestions for a message
   */
  updateMessageSuggestions: (messageId: string, suggestions: ChatAutoSuggestions) => Promise<void>;
}

export const chatAutoSuggestion: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatAutoSuggestionAction
> = (set, get) => ({
  generateSuggestions: async (messageId: string) => {
    const { internal_dispatchMessage } = get();
    const messages = chatSelectors.activeBaseChats(get());
    const message = messages.find((msg: ChatMessage) => msg.id === messageId);

    if (!message || message.role !== 'assistant') {
      return;
    }

    // Get agent configuration
    const agentState = useAgentStore.getState();
    const agentConfig = agentSelectors.currentAgentConfig(agentState);

    // Check if auto-suggestions are enabled
    if (!agentConfig.chatConfig.autoSuggestion?.enabled) {
      return;
    }

    try {
      // Set loading state
      internal_dispatchMessage({
        id: messageId,
        type: 'updateMessage',
        value: {
          extra: {
            ...message.extra,
            autoSuggestions: {
              loading: true,
              suggestions: [],
            },
          },
        },
      });

      // Generate suggestions
      const suggestions = await generateAutoSuggestions({
        customPrompt: agentConfig.chatConfig.autoSuggestion.customPrompt,
        maxSuggestions: agentConfig.chatConfig.autoSuggestion.maxSuggestions,
        messages,
        model: agentConfig.model,
        provider: agentConfig.provider || 'openai',
        systemRole: agentConfig.systemRole,
      });

      // Update message with suggestions
      internal_dispatchMessage({
        id: messageId,
        type: 'updateMessage',
        value: {
          extra: {
            ...message.extra,
            autoSuggestions: {
              loading: false,
              suggestions,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);

      // Clear loading state on error
      internal_dispatchMessage({
        id: messageId,
        type: 'updateMessage',
        value: {
          extra: {
            ...message.extra,
            autoSuggestions: {
              loading: false,
              suggestions: [],
            },
          },
        },
      });
    }
  },

  updateMessageSuggestions: async (messageId: string, suggestions: ChatAutoSuggestions) => {
    const { internal_dispatchMessage } = get();
    const messages = chatSelectors.activeBaseChats(get());
    const message = messages.find((msg: ChatMessage) => msg.id === messageId);

    if (!message) {
      return;
    }

    internal_dispatchMessage({
      id: messageId,
      type: 'updateMessage',
      value: {
        extra: {
          ...message.extra,
          autoSuggestions: suggestions,
        },
      },
    });
  },
});
