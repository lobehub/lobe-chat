import { t } from 'i18next';
import { StateCreator } from 'zustand/vanilla';

import { notification } from '@/components/AntdStaticMethods';
import { FILE_UPLOAD_BLACKLIST } from '@/const/file';
import { documentService } from '@/services/document';
import { fileService } from '@/services/file';
import { ragService } from '@/services/rag';
import { UPLOAD_NETWORK_ERROR } from '@/services/upload';
import {
  UploadFileListDispatch,
  uploadFileListReducer,
} from '@/store/file/reducers/uploadFileList';
import { FileListItem } from '@/types/files';
import { UploadFileItem } from '@/types/files/upload';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';
import { sleep } from '@/utils/sleep';
import { setNamespace } from '@/utils/storeDebug';

import { FileStore } from '../../store';

const n = setNamespace('chat');

export interface FileAction {
  clearChatUploadFileList: () => void;
  /**
   * Create a new document with markdown content (not optimistic, waits for server response)
   * Returns the created document
   */
  createDocument: (params: {
    content: string;
    knowledgeBaseId?: string;
    title: string;
  }) => Promise<{ [key: string]: any; id: string }>;
  /**
   * Create a new optimistic document immediately in local map
   * Returns the temporary ID for the new document
   */
  createOptimisticDocument: (title?: string) => string;
  dispatchChatUploadFileList: (payload: UploadFileListDispatch) => void;

  /**
   * Get documents from local optimistic map merged with server data
   */
  getOptimisticDocuments: () => FileListItem[];
  removeChatUploadFile: (id: string) => Promise<void>;
  /**
   * Remove a document (deletes from documents table)
   */
  removeDocument: (documentId: string) => Promise<void>;
  /**
   * Remove a temp document from local map
   */
  removeTempDocument: (tempId: string) => void;
  /**
   * Replace a temp document with real document data (for smooth UX when creating documents)
   */
  replaceTempDocumentWithReal: (tempId: string, realDocument: FileListItem) => void;
  startAsyncTask: (
    fileId: string,
    runner: (id: string) => Promise<string>,
    onFileItemChange: (fileItem: FileListItem) => void,
  ) => Promise<void>;

  /**
   * Sync local document map with server data
   */
  syncDocumentMapWithServer: (documents: FileListItem[]) => void;
  /**
   * Optimistically update document in local map and queue for DB sync
   */
  updateDocumentOptimistically: (
    documentId: string,
    updates: Partial<FileListItem>,
  ) => Promise<void>;
  uploadChatFiles: (files: File[]) => Promise<void>;
}

export const createFileSlice: StateCreator<
  FileStore,
  [['zustand/devtools', never]],
  [],
  FileAction
> = (set, get) => ({
  clearChatUploadFileList: () => {
    set({ chatUploadFileList: [] }, false, n('clearChatUploadFileList'));
  },

  createDocument: async ({ title, content, knowledgeBaseId }) => {
    const now = Date.now();

    // Create document with markdown content, leave editorData as empty JSON object
    const newDoc = await documentService.createNote({
      content,
      editorData: '{}', // Empty JSON object instead of empty string
      fileType: 'custom/note',
      knowledgeBaseId,
      metadata: {
        createdAt: now,
      },
      title,
    });

    // Refresh file list to show the new document
    await get().refreshFileList();

    return newDoc;
  },

  createOptimisticDocument: (title = 'Untitled') => {
    const { localDocumentMap } = get();

    // Generate temporary ID with prefix to identify optimistic documents
    const tempId = `temp-document-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();

    // Create new document object
    const newDocument: FileListItem = {
      chunkCount: null,
      chunkingError: null,
      chunkingStatus: null,
      content: '',
      createdAt: now,
      editorData: null,
      embeddingError: null,
      embeddingStatus: null,
      fileType: 'custom/note',
      finishEmbedding: false,
      id: tempId,
      name: title,
      size: 0,
      sourceType: 'document',
      updatedAt: now,
      url: '',
    };

    // Add to local map
    const newMap = new Map(localDocumentMap);
    newMap.set(tempId, newDocument);
    set({ localDocumentMap: newMap }, false, n('createOptimisticDocument'));

    return tempId;
  },

  dispatchChatUploadFileList: (payload) => {
    const nextValue = uploadFileListReducer(get().chatUploadFileList, payload);
    if (nextValue === get().chatUploadFileList) return;

    set({ chatUploadFileList: nextValue }, false, `dispatchChatFileList/${payload.type}`);
  },

  getOptimisticDocuments: () => {
    const { localDocumentMap, fileList } = get();

    // Get server documents from fileList state
    const serverDocuments = (fileList || []).filter(
      (file: FileListItem) =>
        ['custom/note', 'application/pdf'].includes(file.fileType) && file.sourceType === 'file',
    );

    // Track which documents we've added
    const addedIds = new Set<string>();

    // Create result array - start with server documents
    const result: FileListItem[] = serverDocuments.map((document) => {
      addedIds.add(document.id);
      // Check if we have a local optimistic update for this document
      const localUpdate = localDocumentMap.get(document.id);
      // If local update exists and is newer, use it; otherwise use server version
      if (localUpdate && new Date(localUpdate.updatedAt) >= new Date(document.updatedAt)) {
        return localUpdate;
      }
      return document;
    });

    // Add any optimistic documents that aren't in server list yet (e.g., newly created temp documents)
    for (const [id, document] of localDocumentMap.entries()) {
      if (!addedIds.has(id) && document.fileType === 'custom/note') {
        result.unshift(document); // Add new documents to the beginning
      }
    }

    return result;
  },

  removeChatUploadFile: async (id) => {
    const { dispatchChatUploadFileList } = get();

    dispatchChatUploadFileList({ id, type: 'removeFile' });
    await fileService.removeFile(id);
  },

  removeDocument: async (documentId) => {
    // Remove from local optimistic map first (optimistic update)
    const { localDocumentMap } = get();
    const newMap = new Map(localDocumentMap);
    newMap.delete(documentId);
    set({ localDocumentMap: newMap }, false, n('removeDocument/optimistic'));

    try {
      // Delete from documents table
      await documentService.deleteDocument(documentId);
      // Refresh file list to sync with server
      await get().refreshFileList();
    } catch (error) {
      console.error('Failed to delete document:', error);
      // Restore the document in local map on error
      const restoredMap = new Map(localDocumentMap);
      set({ localDocumentMap: restoredMap }, false, n('removeDocument/restore'));
      throw error;
    }
  },

  removeTempDocument: (tempId) => {
    const { localDocumentMap } = get();
    const newMap = new Map(localDocumentMap);
    newMap.delete(tempId);
    set({ localDocumentMap: newMap }, false, n('removeTempDocument'));
  },

  replaceTempDocumentWithReal: (tempId, realDocument) => {
    const { localDocumentMap } = get();
    const newMap = new Map(localDocumentMap);

    // Remove temp document
    newMap.delete(tempId);

    // Add real document with same position
    newMap.set(realDocument.id, realDocument);

    set({ localDocumentMap: newMap }, false, n('replaceTempDocumentWithReal'));
  },

  startAsyncTask: async (id, runner, onFileItemUpdate) => {
    await runner(id);

    let isFinished = false;

    while (!isFinished) {
      // 每间隔 2s 查询一次任务状态
      await sleep(2000);

      let fileItem: FileListItem | undefined = undefined;

      try {
        fileItem = await fileService.getKnowledgeItem(id);
      } catch (e) {
        console.error('getFileItem Error:', e);
        continue;
      }

      if (!fileItem) return;

      onFileItemUpdate(fileItem);

      if (fileItem.finishEmbedding) {
        isFinished = true;
      }

      // if error, also break
      else if (fileItem.chunkingStatus === 'error' || fileItem.embeddingStatus === 'error') {
        isFinished = true;
      }
    }
  },

  syncDocumentMapWithServer: (documents) => {
    const { localDocumentMap } = get();
    const newMap = new Map(localDocumentMap);

    // Remove temp documents that now exist on server
    // This prevents duplicates after creating a new document
    for (const [id] of localDocumentMap.entries()) {
      if (id.startsWith('temp-document-')) {
        newMap.delete(id);
      }
    }

    // Update or add documents from server
    for (const document of documents) {
      if (document.fileType === 'custom/note') {
        newMap.set(document.id, document);
      }
    }

    set({ localDocumentMap: newMap }, false, n('syncDocumentMapWithServer'));
  },

  updateDocumentOptimistically: async (documentId, updates) => {
    const { localDocumentMap, fileList } = get();

    // Find the document either in local map or file list
    const existingDocument =
      localDocumentMap.get(documentId) || fileList?.find((f) => f.id === documentId);

    if (!existingDocument) {
      console.warn('[updateDocumentOptimistically] Document not found:', documentId);
      return;
    }

    // Create updated document with new timestamp
    // Merge metadata if both exist, otherwise use the update's metadata or preserve existing
    const mergedMetadata =
      updates.metadata !== undefined
        ? { ...existingDocument.metadata, ...updates.metadata }
        : existingDocument.metadata;

    // Clean up undefined values from metadata
    const cleanedMetadata = mergedMetadata
      ? Object.fromEntries(Object.entries(mergedMetadata).filter(([, v]) => v !== undefined))
      : undefined;

    const updatedDocument: FileListItem = {
      ...existingDocument,
      ...updates,
      metadata: cleanedMetadata,
      updatedAt: new Date(),
    };

    console.log('updatedDocument', updatedDocument);

    // Update local map immediately for optimistic UI
    const newMap = new Map(localDocumentMap);
    newMap.set(documentId, updatedDocument);
    set({ localDocumentMap: newMap }, false, n('updateDocumentOptimistically'));

    // Queue background sync to DB
    try {
      await documentService.updateDocument({
        content: updatedDocument.content || '',
        editorData:
          typeof updatedDocument.editorData === 'string'
            ? updatedDocument.editorData
            : JSON.stringify(updatedDocument.editorData),
        id: documentId,
        metadata: updatedDocument.metadata || {},
        title: updatedDocument.name,
      });

      // After successful sync, refresh file list to get server state
      // This will eventually sync back to the map via syncDocumentMapWithServer
    } catch (error) {
      console.error('[updateDocumentOptimistically] Failed to sync to DB:', error);
      // On error, revert the optimistic update
      const revertMap = new Map(localDocumentMap);
      if (existingDocument) {
        revertMap.set(documentId, existingDocument);
      } else {
        revertMap.delete(documentId);
      }
      set({ localDocumentMap: revertMap }, false, n('revertOptimisticUpdate'));
    }
  },

  uploadChatFiles: async (rawFiles) => {
    const { dispatchChatUploadFileList } = get();
    // 0. skip file in blacklist
    const files = rawFiles.filter((file) => !FILE_UPLOAD_BLACKLIST.includes(file.name));
    // 1. add files with base64
    const uploadFiles: UploadFileItem[] = await Promise.all(
      files.map(async (file) => {
        let previewUrl: string | undefined = undefined;
        let base64Url: string | undefined = undefined;

        // only image and video can be previewed, we create a previewUrl and base64Url for them
        if (file.type.startsWith('image') || file.type.startsWith('video')) {
          const data = await file.arrayBuffer();

          previewUrl = URL.createObjectURL(new Blob([data!], { type: file.type }));

          const base64 = Buffer.from(data!).toString('base64');
          base64Url = `data:${file.type};base64,${base64}`;
        }

        return { base64Url, file, id: file.name, previewUrl, status: 'pending' } as UploadFileItem;
      }),
    );

    dispatchChatUploadFileList({ files: uploadFiles, type: 'addFiles' });

    // upload files and process it
    const pools = files.map(async (file) => {
      let fileResult: { id: string; url: string } | undefined;

      try {
        fileResult = await get().uploadWithProgress({
          file,
          onStatusUpdate: dispatchChatUploadFileList,
        });
      } catch (error) {
        // skip `UNAUTHORIZED` error
        if ((error as any)?.message !== 'UNAUTHORIZED')
          notification.error({
            description:
              // it may be a network error or the cors error
              error === UPLOAD_NETWORK_ERROR
                ? t('upload.networkError', { ns: 'error' })
                : // or the error from the server
                  typeof error === 'string'
                  ? error
                  : t('upload.unknownError', { ns: 'error', reason: (error as Error).message }),
            message: t('upload.uploadFailed', { ns: 'error' }),
          });

        dispatchChatUploadFileList({ id: file.name, type: 'removeFile' });
      }

      if (!fileResult) return;

      // image don't need to be chunked and embedding
      if (isChunkingUnsupported(file.type)) return;

      const data = await ragService.parseFileContent(fileResult.id);
      console.log(data);
    });

    await Promise.all(pools);
  },
});
