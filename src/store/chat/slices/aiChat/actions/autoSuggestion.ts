import { AutoSuggestionsUserActions, ChatMessage } from '@lobechat/types';
import { StateCreator } from 'zustand/vanilla';

import { aiChatService } from '@/services/aiChat';
import { messageService } from '@/services/message';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatStore } from '@/store/chat/store';

import { chatSelectors } from '../../../selectors';

export interface ChatAutoSuggestionAction {
  clearAutoSuggestions: (id: string) => void;
  /**
   * Generate auto-suggestions for a message
   */
  generateSuggestions: (messageId: string) => Promise<void>;
  /**
   * Update suggestions for a message
   */
  updateAutoSuggestionChoices: (
    id: string,
    autoSuggestions: AutoSuggestionsUserActions,
  ) => Promise<void>;
}

export const chatAutoSuggestion: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatAutoSuggestionAction
> = (set, get) => ({
  clearAutoSuggestions: (id) => {
    get().internal_dispatchMessage({
      id: id,
      key: 'autoSuggestions',
      type: 'updateMessageExtra',
      value: undefined,
    });
  },

  generateSuggestions: async (messageId: string) => {
    const { internal_dispatchMessage } = get();
    const messages = chatSelectors.activeBaseChats(get());
    const message = messages.find((msg: ChatMessage) => msg.id === messageId);

    if (!message || message.role !== 'assistant') return;

    // Get agent configuration for systemRole and autoSuggestion config
    const agentState = useAgentStore.getState();
    const agentConfig = agentSelectors.currentAgentConfig(agentState);

    // Check if auto-suggestions are enabled
    if (!agentConfig.chatConfig.autoSuggestion?.enabled) return;

    try {
      // Set loading state
      internal_dispatchMessage({
        id: messageId,
        key: 'autoSuggestions',
        type: 'updateMessageExtra',
        value: { loading: true, suggestions: [] },
      });

      // Call AI service with 10 second timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10_000);

      const suggestions = await aiChatService.generateSuggestion(
        {
          maxSuggestions: agentConfig.chatConfig.autoSuggestion.maxSuggestions,
          messages,
          systemRole: agentConfig.systemRole,
        },
        abortController,
      );

      clearTimeout(timeoutId);

      // Update message with suggestions
      internal_dispatchMessage({
        id: messageId,
        key: 'autoSuggestions',
        type: 'updateMessageExtra',
        value: { loading: false, suggestions },
      });
    } catch (error) {
      console.error('Failed to generate suggestions:', error);

      // Silent failure: remove autoSuggestions completely
      get().clearAutoSuggestions(messageId);
    }
  },
  updateAutoSuggestionChoices: async (messageId: string, userFeedback) => {
    const { clearAutoSuggestions } = get();
    const message = chatSelectors.getMessageById(messageId)(get());

    if (!message) return;

    clearAutoSuggestions(messageId);

    await messageService.updateMessageMetadata(messageId, { autoSuggestions: userFeedback });
  },
});
