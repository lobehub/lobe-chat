import { StateCreator } from 'zustand/vanilla';

import { chainSummaryHistory } from '@/chains/summaryHistory';
import { chatService } from '@/services/chat';
import { topicService } from '@/services/topic';
import { ChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { systemAgentSelectors } from '@/store/user/selectors';
import { ChatMessage } from '@/types/message';

import { getAgentConfig } from './helpers';

export interface ChatMemoryAction {
  internal_summaryHistory: (messages: ChatMessage[]) => Promise<void>;
}

export const chatMemory: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatMemoryAction
> = (set, get) => ({
  internal_summaryHistory: async (messages) => {
    const topicId = get().activeTopicId;
    if (messages.length <= 1 || !topicId) return;

    const { model, provider } = getAgentConfig();

    const historyCompressConfig = systemAgentSelectors.historyCompress(useUserStore.getState());

    let historySummary = '';
    await chatService.fetchPresetTaskResult({
      onFinish: async (text) => {
        historySummary = text;
      },

      params: {
        ...chainSummaryHistory(messages),
        model: historyCompressConfig.model,
        provider: historyCompressConfig.provider,
        stream: false,
      },
    });

    await topicService.updateTopic(topicId, {
      metadata: { model, provider },
      summary: historySummary,
    });
    await get().refreshTopic();
    await get().refreshMessages();
  },
});
