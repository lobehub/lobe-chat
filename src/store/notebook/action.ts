import { NotebookDocument } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { notebookService } from '@/services/notebook';
import { useChatStore } from '@/store/chat';
import { setNamespace } from '@/utils/storeDebug';

import type { NotebookStore } from './store';

const n = setNamespace('notebook');

const SWR_USE_FETCH_NOTEBOOK_DOCUMENTS = 'SWR_USE_FETCH_NOTEBOOK_DOCUMENTS';

export interface NotebookAction {
  deleteDocument: (id: string, topicId: string) => Promise<void>;
  refreshDocuments: (topicId: string) => Promise<void>;
  useFetchDocuments: (topicId: string | undefined) => SWRResponse<NotebookDocument[]>;
}

export const createNotebookAction: StateCreator<
  NotebookStore,
  [['zustand/devtools', never]],
  [],
  NotebookAction
> = (set, get) => ({
  deleteDocument: async (id, topicId) => {
    await notebookService.deleteDocument(id);

    // If the deleted document is currently open, close it
    const portalDocumentId = useChatStore.getState().portalDocumentId;
    if (portalDocumentId === id) {
      useChatStore.getState().closeDocument();
    }

    // Refresh the documents list
    await mutate([SWR_USE_FETCH_NOTEBOOK_DOCUMENTS, topicId]);
  },

  refreshDocuments: async (topicId) => {
    await mutate([SWR_USE_FETCH_NOTEBOOK_DOCUMENTS, topicId]);
  },

  useFetchDocuments: (topicId) => {
    return useClientDataSWR<NotebookDocument[]>(
      topicId ? [SWR_USE_FETCH_NOTEBOOK_DOCUMENTS, topicId] : null,
      async () => {
        if (!topicId) return [];

        const result = await notebookService.listDocuments({ topicId });

        return result.data;
      },
      {
        onSuccess: (documents) => {
          if (!topicId) return;

          const currentDocuments = get().documentsMap[topicId];

          // Skip update if data is the same
          if (currentDocuments && isEqual(documents, currentDocuments)) return;

          set(
            {
              documentsMap: { ...get().documentsMap, [topicId]: documents },
            },
            false,
            n('useFetchDocuments(onData)', { topicId }),
          );
        },
      },
    );
  },
});
