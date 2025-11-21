import debug from 'debug';
import { StateCreator } from 'zustand/vanilla';

import { agentSelectors } from '@/store/agent/selectors';
import { getAgentStoreState } from '@/store/agent/store';
import { ChatStore } from '@/store/chat/store';
import { KnowledgeBaseExecutionRuntime } from '@/tools/knowledge-base/ExecutionRuntime';

import { dbMessageSelectors } from '../../message/selectors';

const log = debug('lobe-store:builtin-tool:knowledge-base');

export interface KnowledgeBaseAction {
  /**
   * Read full content of specific files from knowledge base
   */
  readKnowledge: (
    id: string,
    params: {
      fileIds: string[];
    },
  ) => Promise<void | boolean>;

  /**
   * Search knowledge base for relevant files and chunks
   */
  searchKnowledgeBase: (
    id: string,
    params: {
      query: string;
      topK?: number;
    },
  ) => Promise<void | boolean>;
}

const runtime = new KnowledgeBaseExecutionRuntime();

export const knowledgeBaseSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  KnowledgeBaseAction
> = (set, get) => ({
  readKnowledge: async (id, params) => {
    // Get parent operationId from messageOperationMap (should be executeToolCall)
    const parentOperationId = get().messageOperationMap[id];

    log('[readKnowledge] messageId=%s, fileIds=%o', id, params.fileIds);

    // Create child operation for reading knowledge
    const { operationId: readOpId, abortController } = get().startOperation({
      context: {
        messageId: id,
      },
      metadata: {
        fileIds: params.fileIds,
        startTime: Date.now(),
      },
      parentOperationId,
      type: 'builtinToolKnowledgeBase',
    });

    log(
      '[readKnowledge] messageId=%s, parentOpId=%s, readOpId=%s, aborted=%s',
      id,
      parentOperationId,
      readOpId,
      abortController.signal.aborted,
    );

    const context = { operationId: readOpId };

    try {
      const { content, success, error, state } = await runtime.readKnowledge(params, {
        signal: abortController.signal,
      });

      // Complete read operation
      get().completeOperation(readOpId);

      log('[readKnowledge] Read completed: messageId=%s, success=%s', id, success);

      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(id, error, context);
      }

      // Always return true to trigger AI summary
      return true;
    } catch (e) {
      const err = e as Error;

      log('[readKnowledge] Error: messageId=%s, error=%s', id, err.message);

      // Check if it's an abort error
      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        log('[readKnowledge] Request aborted: messageId=%s', id);
        get().failOperation(readOpId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return;
      }

      // Fail operation for other errors
      get().failOperation(readOpId, {
        message: err.message,
        type: 'PluginServerError',
      });

      console.error(e);
      await get().optimisticUpdateMessageContent(
        id,
        `Error reading knowledge: ${err.message}`,
        undefined,
        context,
      );
    }
  },

  searchKnowledgeBase: async (id, params) => {
    // Get parent operationId from messageOperationMap (should be executeToolCall)
    const parentOperationId = get().messageOperationMap[id];

    // Get knowledge base IDs and file IDs from agent store
    const agentState = getAgentStoreState();
    const knowledgeIds = agentSelectors.currentKnowledgeIds(agentState);

    // Get user-selected files from messages
    const userFiles = dbMessageSelectors
      .dbUserFiles(get())
      .map((f) => f?.id)
      .filter(Boolean) as string[];

    // Merge knowledge base files and user-selected files
    const options = {
      fileIds: [...knowledgeIds.fileIds, ...userFiles],
      knowledgeBaseIds: knowledgeIds.knowledgeBaseIds,
    };

    log(
      '[searchKnowledgeBase] messageId=%s, query=%s, knowledgeBaseIds=%o, fileIds=%o',
      id,
      params.query,
      options.knowledgeBaseIds,
      options.fileIds,
    );

    // Create child operation for knowledge base search
    const { operationId: searchOpId, abortController } = get().startOperation({
      context: {
        messageId: id,
      },
      metadata: {
        fileIds: options.fileIds,
        knowledgeBaseIds: options.knowledgeBaseIds,
        query: params.query,
        startTime: Date.now(),
        topK: params.topK,
      },
      parentOperationId,
      type: 'builtinToolKnowledgeBase',
    });

    log(
      '[searchKnowledgeBase] messageId=%s, parentOpId=%s, searchOpId=%s, aborted=%s',
      id,
      parentOperationId,
      searchOpId,
      abortController.signal.aborted,
    );

    const context = { operationId: searchOpId };

    try {
      const { content, success, error, state } = await runtime.searchKnowledgeBase(params, {
        fileIds: options.fileIds,
        knowledgeBaseIds: options.knowledgeBaseIds,
        messageId: id,
        signal: abortController.signal,
      });

      // Complete search operation
      get().completeOperation(searchOpId);

      log('[searchKnowledgeBase] Search completed: messageId=%s, success=%s', id, success);

      await get().optimisticUpdateMessageContent(id, content, undefined, context);

      if (success) {
        await get().optimisticUpdatePluginState(id, state, context);
      } else {
        await get().optimisticUpdatePluginError(id, error, context);
      }

      // Always return true to trigger AI summary
      return true;
    } catch (e) {
      const err = e as Error;

      log('[searchKnowledgeBase] Error: messageId=%s, error=%s', id, err.message);

      // Check if it's an abort error
      if (err.message.includes('The user aborted a request.') || err.name === 'AbortError') {
        log('[searchKnowledgeBase] Request aborted: messageId=%s', id);
        get().failOperation(searchOpId, {
          message: 'User cancelled the request',
          type: 'UserAborted',
        });
        return;
      }

      // Fail operation for other errors
      get().failOperation(searchOpId, {
        message: err.message,
        type: 'PluginServerError',
      });

      console.error(e);
      await get().optimisticUpdateMessageContent(
        id,
        `Error searching knowledge base: ${err.message}`,
        undefined,
        context,
      );
    }
  },
});
