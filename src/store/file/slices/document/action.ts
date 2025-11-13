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
 * Check if a document should be displayed in the document list
 */
const isAllowedDocument = (document: { fileType: string; sourceType: string }) => {
  return (
    ALLOWED_DOCUMENT_SOURCE_TYPES.has(document.sourceType) &&
    ALLOWED_DOCUMENT_FILE_TYPES.has(document.fileType)
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
    title: string;
  }) => Promise<{ [key: string]: any; id: string }>;
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
  createDocument: async ({ title, content, knowledgeBaseId }) => {
    const now = Date.now();

    // Create document with markdown content, leave editorData as empty JSON object
    const newDoc = await documentService.createDocument({
      content,
      editorData: '{}', // Empty JSON object instead of empty string
      fileType: EDITOR_DOCUMENT_FILE_TYPE,
      knowledgeBaseId,
      metadata: {
        createdAt: now,
      },
      title,
    });

    // Don't refresh documents here - the caller will handle replacing the temp document
    // with the real one via replaceTempDocumentWithReal, which provides a smooth UX
    // without triggering the loading skeleton

    return newDoc;
  },

  createOptimisticDocument: (title = 'Untitled') => {
    const { localDocumentMap } = get();

    // Generate temporary ID with prefix to identify optimistic documents
    const tempId = `temp-document-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();

    const newDocument: LobeDocument = {
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
    newMap.set(tempId, newDocument);
    set({ localDocumentMap: newMap }, false, n('createOptimisticDocument'));

    return tempId;
  },

  duplicateDocument: async (documentId) => {
    // Fetch the source document
    const sourceDoc = await documentService.getDocumentById(documentId);

    if (!sourceDoc) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    // Create a new document with copied properties
    const newDoc = await documentService.createDocument({
      content: sourceDoc.content || '',
      editorData: sourceDoc.editorData
        ? typeof sourceDoc.editorData === 'string'
          ? sourceDoc.editorData
          : JSON.stringify(sourceDoc.editorData)
        : '{}',
      fileType: sourceDoc.fileType,
      metadata: {
        ...sourceDoc.metadata,
        createdAt: Date.now(),
        duplicatedFrom: documentId,
      },
      title: `${sourceDoc.title} (Copy)`,
    });

    // Add the new document to local map immediately for instant UI update
    const { localDocumentMap } = get();
    const newMap = new Map(localDocumentMap);
    const editorDoc: LobeDocument = {
      content: newDoc.content || null,
      createdAt: newDoc.createdAt ? new Date(newDoc.createdAt) : new Date(),
      editorData:
        typeof newDoc.editorData === 'string'
          ? JSON.parse(newDoc.editorData)
          : newDoc.editorData || null,
      fileType: newDoc.fileType,
      filename: newDoc.title || newDoc.filename || '',
      id: newDoc.id,
      metadata: newDoc.metadata || {},
      source: 'document',
      sourceType: DocumentSourceType.EDITOR,
      title: newDoc.title || '',
      totalCharCount: newDoc.content?.length || 0,
      totalLineCount: 0,
      updatedAt: newDoc.updatedAt ? new Date(newDoc.updatedAt) : new Date(),
    };
    newMap.set(newDoc.id, editorDoc);
    set({ localDocumentMap: newMap }, false, n('duplicateDocument'));

    // Don't refresh documents here - we've already added it to the local map
    // This prevents the loading skeleton from appearing

    return newDoc;
  },

  fetchDocuments: async () => {
    set({ isDocumentListLoading: true }, false, n('fetchDocuments/start'));

    try {
      const documentItems = await documentService.queryDocuments();
      const documents = documentItems.filter(isAllowedDocument).map((doc) => ({
        ...doc,
        filename: doc.filename ?? doc.title ?? 'Untitled',
      })) as LobeDocument[];
      set({ documents, isDocumentListLoading: false }, false, n('fetchDocuments/success'));

      // Sync with local map: remove temp documents that now exist on server
      const { localDocumentMap } = get();
      const newMap = new Map(localDocumentMap);

      for (const [id] of localDocumentMap.entries()) {
        if (id.startsWith('temp-document-')) {
          newMap.delete(id);
        }
      }

      set({ localDocumentMap: newMap }, false, n('fetchDocuments/syncLocalMap'));
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      set({ isDocumentListLoading: false }, false, n('fetchDocuments/error'));
      throw error;
    }
  },

  getOptimisticDocuments: () => {
    const { localDocumentMap, documents } = get();

    // Track which documents we've added
    const addedIds = new Set<string>();

    // Create result array - start with server documents
    const result: LobeDocument[] = documents.map((document) => {
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
      if (!addedIds.has(id)) {
        result.unshift(document); // Add new documents to the beginning
      }
    }

    return result;
  },

  removeDocument: async (documentId) => {
    // Remove from local optimistic map first (optimistic update)
    const { localDocumentMap, documents } = get();
    const newMap = new Map(localDocumentMap);
    newMap.delete(documentId);

    // Also remove from documents array to update the list immediately
    const newDocuments = documents.filter((doc) => doc.id !== documentId);

    set(
      { documents: newDocuments, localDocumentMap: newMap },
      false,
      n('removeDocument/optimistic'),
    );

    try {
      // Delete from documents table
      await documentService.deleteDocument(documentId);
      // No need to call fetchDocuments() - optimistic update is enough
    } catch (error) {
      console.error('Failed to delete document:', error);
      // Restore the document in local map and documents array on error
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

  replaceTempDocumentWithReal: (tempId, realDocument) => {
    const { localDocumentMap } = get();
    const newMap = new Map(localDocumentMap);

    // Remove temp document
    newMap.delete(tempId);

    // Add real document with same position
    newMap.set(realDocument.id, realDocument);

    set({ localDocumentMap: newMap }, false, n('replaceTempDocumentWithReal'));
  },

  updateDocumentOptimistically: async (documentId, updates) => {
    const { localDocumentMap, documents } = get();

    // Find the document either in local map or documents state
    let existingDocument = localDocumentMap.get(documentId);
    if (!existingDocument) {
      existingDocument = documents.find((doc) => doc.id === documentId);
    }

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
      : {};

    const updatedDocument: LobeDocument = {
      ...existingDocument,
      ...updates,
      metadata: cleanedMetadata,
      title: updates.title || existingDocument.title,
      updatedAt: new Date(),
    };

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
            : JSON.stringify(updatedDocument.editorData || {}),
        id: documentId,
        metadata: updatedDocument.metadata || {},
        title: updatedDocument.title || updatedDocument.filename,
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
});
