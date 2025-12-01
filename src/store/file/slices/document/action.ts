import { createNanoId } from '@lobechat/utils';
import { StateCreator } from 'zustand/vanilla';

import { documentService } from '@/services/document';
import { DocumentSourceType, LobeDocument } from '@/types/document';
import { setNamespace } from '@/utils/storeDebug';

import { FileStore } from '../../store';

const n = setNamespace('document');

const ALLOWED_DOCUMENT_SOURCE_TYPES = new Set(['editor', 'file', 'api']);
const ALLOWED_DOCUMENT_FILE_TYPES = new Set(['custom/document', 'application/pdf']);
const EDITOR_DOCUMENT_FILE_TYPE = 'custom/document';

/**
 * Check if a page should be displayed in the page list
 */
const isAllowedDocument = (page: { fileType: string; sourceType: string }) => {
  return (
    ALLOWED_DOCUMENT_SOURCE_TYPES.has(page.sourceType) &&
    ALLOWED_DOCUMENT_FILE_TYPES.has(page.fileType)
  );
};

export interface DocumentAction {
  /**
   * Create a new document with markdown content (not optimistic, waits for server response)
   * Returns the created document
   */
  createDocument: (params: {
    content: string;
    knowledgeBaseId?: string;
    parentId?: string;
    title: string;
  }) => Promise<{ [key: string]: any; id: string }>;
  /**
   * Create a new folder
   * Returns the created folder's ID
   */
  createFolder: (name: string, parentId?: string, knowledgeBaseId?: string) => Promise<string>;
  /**
   * Create a new optimistic document immediately in local map
   * Returns the temporary ID for the new document
   */
  createOptimisticDocument: (title?: string) => string;
  /**
   * Duplicate an existing document
   * Returns the created document
   */
  duplicateDocument: (documentId: string) => Promise<{ [key: string]: any; id: string }>;
  /**
   * Fetch all documents from the server
   */
  fetchDocuments: () => Promise<void>;
  /**
   * Get documents from local optimistic map merged with server data
   */
  getOptimisticDocuments: () => LobeDocument[];
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
  replaceTempDocumentWithReal: (tempId: string, realDocument: LobeDocument) => void;
  /**
   * Update document directly (no optimistic update)
   */
  updateDocument: (documentId: string, updates: Partial<LobeDocument>) => Promise<void>;
  /**
   * Optimistically update document in local map and queue for DB sync
   */
  updateDocumentOptimistically: (
    documentId: string,
    updates: Partial<LobeDocument>,
  ) => Promise<void>;
}

export const createDocumentSlice: StateCreator<
  FileStore,
  [['zustand/devtools', never]],
  [],
  DocumentAction
> = (set, get) => ({
  createDocument: async ({ title, content, knowledgeBaseId, parentId }) => {
    const now = Date.now();

    // Create page with markdown content, leave editorData as empty JSON object
    const newPage = await documentService.createDocument({
      content,
      editorData: '{}', // Empty JSON object instead of empty string
      fileType: EDITOR_DOCUMENT_FILE_TYPE,
      knowledgeBaseId,
      metadata: {
        createdAt: now,
      },
      parentId,
      title,
    });

    // Don't refresh pages here - the caller will handle replacing the temp page
    // with the real one via replaceTempDocumentWithReal, which provides a smooth UX
    // without triggering the loading skeleton

    return newPage;
  },

  createFolder: async (name, parentId, knowledgeBaseId) => {
    const now = Date.now();

    // Generate random 8-character slug (A-Z, a-z, 0-9)
    const generateSlug = createNanoId(8);
    const slug = generateSlug();

    const folder = await documentService.createDocument({
      content: '',
      editorData: '{}',
      fileType: 'custom/folder',
      knowledgeBaseId,
      metadata: {
        createdAt: now,
      },
      parentId,
      slug,
      title: name,
    });

    await get().refreshFileList();

    return folder.id;
  },

  createOptimisticDocument: (title = 'Untitled') => {
    const { localDocumentMap } = get();

    // Generate temporary ID with prefix to identify optimistic pages
    const tempId = `temp-document-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();

    const newPage: LobeDocument = {
      content: null,
      createdAt: now,
      editorData: null,
      fileType: EDITOR_DOCUMENT_FILE_TYPE,
      filename: title,
      id: tempId,
      metadata: {},
      source: 'document',
      sourceType: DocumentSourceType.EDITOR,
      title: title,
      totalCharCount: 0,
      totalLineCount: 0,
      updatedAt: now,
    };

    // Add to local map
    const newMap = new Map(localDocumentMap);
    newMap.set(tempId, newPage);
    set({ localDocumentMap: newMap }, false, n('createOptimisticDocument'));

    return tempId;
  },

  duplicateDocument: async (documentId) => {
    // Fetch the source page
    const sourcePage = await documentService.getDocumentById(documentId);

    if (!sourcePage) {
      throw new Error(`Page with ID ${documentId} not found`);
    }

    // Create a new page with copied properties
    const newPage = await documentService.createDocument({
      content: sourcePage.content || '',
      editorData: sourcePage.editorData
        ? typeof sourcePage.editorData === 'string'
          ? sourcePage.editorData
          : JSON.stringify(sourcePage.editorData)
        : '{}',
      fileType: sourcePage.fileType,
      metadata: {
        ...sourcePage.metadata,
        createdAt: Date.now(),
        duplicatedFrom: documentId,
      },
      title: `${sourcePage.title} (Copy)`,
    });

    // Add the new page to local map immediately for instant UI update
    const { localDocumentMap } = get();
    const newMap = new Map(localDocumentMap);
    const editorPage: LobeDocument = {
      content: newPage.content || null,
      createdAt: newPage.createdAt ? new Date(newPage.createdAt) : new Date(),
      editorData:
        typeof newPage.editorData === 'string'
          ? JSON.parse(newPage.editorData)
          : newPage.editorData || null,
      fileType: newPage.fileType,
      filename: newPage.title || newPage.filename || '',
      id: newPage.id,
      metadata: newPage.metadata || {},
      source: 'document',
      sourceType: DocumentSourceType.EDITOR,
      title: newPage.title || '',
      totalCharCount: newPage.content?.length || 0,
      totalLineCount: 0,
      updatedAt: newPage.updatedAt ? new Date(newPage.updatedAt) : new Date(),
    };
    newMap.set(newPage.id, editorPage);
    set({ localDocumentMap: newMap }, false, n('duplicateDocument'));

    // Don't refresh pages here - we've already added it to the local map
    // This prevents the loading skeleton from appearing

    return newPage;
  },

  fetchDocuments: async () => {
    set({ isDocumentListLoading: true }, false, n('fetchDocuments/start'));

    try {
      const documentItems = await documentService.queryDocuments();
      const pages = documentItems.filter(isAllowedDocument).map((doc) => ({
        ...doc,
        filename: doc.filename ?? doc.title ?? 'Untitled',
      })) as LobeDocument[];
      set({ documents: pages, isDocumentListLoading: false }, false, n('fetchDocuments/success'));

      // Sync with local map: remove temp pages that now exist on server
      const { localDocumentMap } = get();
      const newMap = new Map(localDocumentMap);

      for (const [id] of localDocumentMap.entries()) {
        if (id.startsWith('temp-document-')) {
          newMap.delete(id);
        }
      }

      set({ localDocumentMap: newMap }, false, n('fetchDocuments/syncLocalMap'));
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      set({ isDocumentListLoading: false }, false, n('fetchDocuments/error'));
      throw error;
    }
  },

  getOptimisticDocuments: () => {
    const { localDocumentMap, documents } = get();

    // Track which pages we've added
    const addedIds = new Set<string>();

    // Create result array - start with server pages
    const result: LobeDocument[] = documents.map((page) => {
      addedIds.add(page.id);
      // Check if we have a local optimistic update for this page
      const localUpdate = localDocumentMap.get(page.id);
      // If local update exists and is newer, use it; otherwise use server version
      if (localUpdate && new Date(localUpdate.updatedAt) >= new Date(page.updatedAt)) {
        return localUpdate;
      }
      return page;
    });

    // Add any optimistic pages that aren't in server list yet (e.g., newly created temp pages)
    for (const [id, page] of localDocumentMap.entries()) {
      if (!addedIds.has(id)) {
        result.unshift(page); // Add new pages to the beginning
      }
    }

    return result;
  },

  removeDocument: async (documentId) => {
    // Remove from local optimistic map first (optimistic update)
    const { localDocumentMap, documents } = get();
    const newMap = new Map(localDocumentMap);
    newMap.delete(documentId);

    // Also remove from pages array to update the list immediately
    const newPages = documents.filter((doc) => doc.id !== documentId);

    set({ documents: newPages, localDocumentMap: newMap }, false, n('removeDocument/optimistic'));

    try {
      // Delete from pages table
      await documentService.deleteDocument(documentId);
      // No need to call fetchDocuments() - optimistic update is enough
    } catch (error) {
      console.error('Failed to delete page:', error);
      // Restore the page in local map and pages array on error
      const restoredMap = new Map(localDocumentMap);
      set({ documents, localDocumentMap: restoredMap }, false, n('removeDocument/restore'));
      throw error;
    }
  },

  removeTempDocument: (tempId) => {
    const { localDocumentMap } = get();
    const newMap = new Map(localDocumentMap);
    newMap.delete(tempId);
    set({ localDocumentMap: newMap }, false, n('removeTempDocument'));
  },

  replaceTempDocumentWithReal: (tempId, realPage) => {
    const { localDocumentMap } = get();
    const newMap = new Map(localDocumentMap);

    // Remove temp page
    newMap.delete(tempId);

    // Add real page with same position
    newMap.set(realPage.id, realPage);

    set({ localDocumentMap: newMap }, false, n('replaceTempDocumentWithReal'));
  },

  updateDocument: async (id, updates) => {
    await documentService.updateDocument({
      content: updates.content ?? undefined,
      editorData: updates.editorData
        ? typeof updates.editorData === 'string'
          ? updates.editorData
          : JSON.stringify(updates.editorData)
        : undefined,
      id,
      metadata: updates.metadata,
      parentId: updates.parentId !== undefined ? updates.parentId : undefined,
      title: updates.title,
    });
    await get().refreshFileList();
  },

  updateDocumentOptimistically: async (documentId, updates) => {
    const { localDocumentMap, documents } = get();

    // Find the page either in local map or documents state
    let existingPage = localDocumentMap.get(documentId);
    if (!existingPage) {
      existingPage = documents.find((doc) => doc.id === documentId);
    }

    if (!existingPage) {
      console.warn('[updateDocumentOptimistically] Page not found:', documentId);
      return;
    }

    // Create updated page with new timestamp
    // Merge metadata if both exist, otherwise use the update's metadata or preserve existing
    const mergedMetadata =
      updates.metadata !== undefined
        ? { ...existingPage.metadata, ...updates.metadata }
        : existingPage.metadata;

    // Clean up undefined values from metadata
    const cleanedMetadata = mergedMetadata
      ? Object.fromEntries(Object.entries(mergedMetadata).filter(([, v]) => v !== undefined))
      : {};

    const updatedPage: LobeDocument = {
      ...existingPage,
      ...updates,
      metadata: cleanedMetadata,
      title: updates.title || existingPage.title,
      updatedAt: new Date(),
    };

    // Update local map immediately for optimistic UI
    const newMap = new Map(localDocumentMap);
    newMap.set(documentId, updatedPage);
    set({ localDocumentMap: newMap }, false, n('updateDocumentOptimistically'));

    // Queue background sync to DB
    try {
      await documentService.updateDocument({
        content: updatedPage.content || '',
        editorData:
          typeof updatedPage.editorData === 'string'
            ? updatedPage.editorData
            : JSON.stringify(updatedPage.editorData || {}),
        id: documentId,
        metadata: updatedPage.metadata || {},
        parentId: updatedPage.parentId || undefined,
        title: updatedPage.title || updatedPage.filename,
      });

      // After successful sync, refresh file list to get server state
      // This will eventually sync back to the map via syncDocumentMapWithServer
      await get().refreshFileList();
    } catch (error) {
      console.error('[updateDocumentOptimistically] Failed to sync to DB:', error);
      // On error, revert the optimistic update
      const revertMap = new Map(localDocumentMap);
      if (existingPage) {
        revertMap.set(documentId, existingPage);
      } else {
        revertMap.delete(documentId);
      }
      set({ localDocumentMap: revertMap }, false, n('revertOptimisticUpdate'));
    }
  },
});
