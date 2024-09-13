import { StateCreator } from 'zustand/vanilla';

import { chainRewriteQuery } from '@/chains/rewriteQuery';
import { chatService } from '@/services/chat';
import { ragService } from '@/services/rag';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { toggleBooleanList } from '@/store/chat/utils';
import { useUserStore } from '@/store/user';
import { systemAgentSelectors } from '@/store/user/selectors';
import { ChatSemanticSearchChunk } from '@/types/chunk';
import { merge } from '@/utils/merge';

export interface ChatRAGAction {
  deleteUserMessageRagQuery: (id: string) => Promise<void>;
  /**
   * Retrieve chunks from semantic search
   */
  internal_retrieveChunks: (
    id: string,
    userQuery: string,
    messages: string[],
  ) => Promise<{ chunks: ChatSemanticSearchChunk[]; queryId: string }>;
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

const knowledgeIds = () => agentSelectors.currentKnowledgeIds(useAgentStore.getState());
const hasEnabledKnowledge = () => agentSelectors.hasEnabledKnowledge(useAgentStore.getState());

export const chatRag: StateCreator<ChatStore, [['zustand/devtools', never]], [], ChatRAGAction> = (
  set,
  get,
) => ({
  deleteUserMessageRagQuery: async (id) => {
    const message = chatSelectors.getMessageById(id)(get());

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

  internal_retrieveChunks: async (id, userQuery, messages) => {
    get().internal_toggleMessageRAGLoading(true, id);

    const message = chatSelectors.getMessageById(id)(get());

    // 1. get the rewrite query
    let rewriteQuery = message?.ragQuery || userQuery;

    // if there is no ragQuery and there is a chat history
    // we need to rewrite the user message to get better results
    if (!message?.ragQuery && messages.length > 0) {
      rewriteQuery = await get().internal_rewriteQuery(id, userQuery, messages);
    }

    // 2. retrieve chunks from semantic search
    const files = chatSelectors.currentUserFiles(get()).map((f) => f.id);
    const { chunks, queryId } = await ragService.semanticSearchForChat({
      fileIds: knowledgeIds().fileIds.concat(files),
      knowledgeIds: knowledgeIds().knowledgeBaseIds,
      messageId: id,
      rewriteQuery,
      userQuery,
    });

    get().internal_toggleMessageRAGLoading(false, id);

    return { chunks, queryId };
  },
  internal_rewriteQuery: async (id, content, messages) => {
    let rewriteQuery = content;

    const queryRewriteConfig = systemAgentSelectors.queryRewrite(useUserStore.getState());
    const rewriteQueryParams = merge(queryRewriteConfig, chainRewriteQuery(content, messages));

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
    const userFiles = chatSelectors.currentUserFiles(get()).map((f) => f.id);
    //  if there is relative files or enabled knowledge, try with ragQuery
    return hasEnabledKnowledge() || userFiles.length > 0;
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
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    // delete the current ragQuery
    await get().deleteUserMessageRagQuery(id);

    const chats = chatSelectors.currentChatsWithHistoryConfig(get());

    await get().internal_rewriteQuery(
      id,
      message.content,
      chats.map((m) => m.content),
    );
  },
});
