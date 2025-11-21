import { chainRewriteQuery } from '@lobechat/prompts';
import { StateCreator } from 'zustand/vanilla';

import { chatService } from '@/services/chat';
import { ragService } from '@/services/rag';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatStore } from '@/store/chat';
import { dbMessageSelectors, displayMessageSelectors } from '@/store/chat/selectors';
import { toggleBooleanList } from '@/store/chat/utils';
import { useUserStore } from '@/store/user';
import { systemAgentSelectors } from '@/store/user/selectors';

export interface ChatRAGAction {
  deleteUserMessageRagQuery: (id: string) => Promise<void>;
  /**
   * Rewrite user content to better RAG query
   */
  internal_rewriteQuery: (id: string, content: string, messages: string[]) => Promise<string>;

  /**
   * Check if we should use RAG
   */
  internal_shouldUseRAG: () => boolean;
  internal_toggleMessageRAGLoading: (loading: boolean, id: string) => void;
  rewriteQuery: (id: string) => Promise<void>;
}

const hasEnabledKnowledge = () => agentSelectors.hasEnabledKnowledge(useAgentStore.getState());

export const chatRag: StateCreator<ChatStore, [['zustand/devtools', never]], [], ChatRAGAction> = (
  set,
  get,
) => ({
  deleteUserMessageRagQuery: async (id) => {
    const message = dbMessageSelectors.getDbMessageById(id)(get());

    if (!message || !message.ragQueryId) return;

    // optimistic update the message's ragQuery
    get().internal_dispatchMessage({
      id,
      type: 'updateMessage',
      value: { ragQuery: null },
    });

    await ragService.deleteMessageRagQuery(message.ragQueryId);
    await get().refreshMessages();
  },

  internal_rewriteQuery: async (id, content, messages) => {
    let rewriteQuery = content;

    const queryRewriteConfig = systemAgentSelectors.queryRewrite(useUserStore.getState());
    if (!queryRewriteConfig.enabled) return content;

    const rewriteQueryParams = {
      model: queryRewriteConfig.model,
      provider: queryRewriteConfig.provider,
      ...chainRewriteQuery(
        content,
        messages,
        !!queryRewriteConfig.customPrompt ? queryRewriteConfig.customPrompt : undefined,
      ),
    };

    let ragQuery = '';
    await chatService.fetchPresetTaskResult({
      onFinish: async (text) => {
        rewriteQuery = text;
      },

      onMessageHandle: (chunk) => {
        if (chunk.type !== 'text') return;
        ragQuery += chunk.text;

        get().internal_dispatchMessage({
          id,
          type: 'updateMessage',
          value: { ragQuery },
        });
      },
      params: rewriteQueryParams,
    });

    return rewriteQuery;
  },
  internal_shouldUseRAG: () => {
    //  if there is enabled knowledge, try with ragQuery
    return hasEnabledKnowledge();
  },

  internal_toggleMessageRAGLoading: (loading, id) => {
    set(
      {
        messageRAGLoadingIds: toggleBooleanList(get().messageRAGLoadingIds, id, loading),
      },
      false,
      'internal_toggleMessageLoading',
    );
  },

  rewriteQuery: async (id) => {
    const message = dbMessageSelectors.getDbMessageById(id)(get());
    if (!message) return;

    // delete the current ragQuery
    await get().deleteUserMessageRagQuery(id);

    const chats = displayMessageSelectors.mainAIChatsWithHistoryConfig(get());

    await get().internal_rewriteQuery(
      id,
      message.content,
      chats.map((m) => m.content),
    );
  },
});
