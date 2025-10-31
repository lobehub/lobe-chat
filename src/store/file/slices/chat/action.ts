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
   * Create a new note with markdown content (not optimistic, waits for server response)
   * Returns the created note ID
   */
  createNote: (params: {
    content: string;
    knowledgeBaseId?: string;
    title: string;
  }) => Promise<string>;
  /**
   * Create a new optimistic note immediately in local map
   * Returns the temporary ID for the new note
   */
  createOptimisticNote: () => string;
  dispatchChatUploadFileList: (payload: UploadFileListDispatch) => void;

  /**
   * Get notes from local optimistic map merged with server data
   */
  getOptimisticNotes: () => FileListItem[];
  removeChatUploadFile: (id: string) => Promise<void>;
  /**
   * Remove a note document (deletes from documents table)
   */
  removeNote: (noteId: string) => Promise<void>;
  /**
   * Remove a temp note from local map
   */
  removeTempNote: (tempId: string) => void;
  /**
   * Replace a temp note with real note data (for smooth UX when creating notes)
   */
  replaceTempNoteWithReal: (tempId: string, realNote: FileListItem) => void;
  startAsyncTask: (
    fileId: string,
    runner: (id: string) => Promise<string>,
    onFileItemChange: (fileItem: FileListItem) => void,
  ) => Promise<void>;

  /**
   * Sync local note map with server data
   */
  syncNoteMapWithServer: (notes: FileListItem[]) => void;
  /**
   * Optimistically update note in local map and queue for DB sync
   */
  updateNoteOptimistically: (noteId: string, updates: Partial<FileListItem>) => Promise<void>;
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

  createNote: async ({ title, content, knowledgeBaseId }) => {
    const now = Date.now();

    // Create note with markdown content, leave editorData as empty JSON object
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

    // Refresh file list to show the new note
    await get().refreshFileList();

    return newDoc.id;
  },

  createOptimisticNote: () => {
    const { localNoteMap } = get();

    // Generate temporary ID with prefix to identify optimistic notes
    const tempId = `temp-note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();

    // Create new note object
    const newNote: FileListItem = {
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
      name: 'Untitled Note',
      size: 0,
      sourceType: 'document',
      updatedAt: now,
      url: '',
    };

    // Add to local map
    const newMap = new Map(localNoteMap);
    newMap.set(tempId, newNote);
    set({ localNoteMap: newMap }, false, n('createOptimisticNote'));

    return tempId;
  },

  dispatchChatUploadFileList: (payload) => {
    const nextValue = uploadFileListReducer(get().chatUploadFileList, payload);
    if (nextValue === get().chatUploadFileList) return;

    set({ chatUploadFileList: nextValue }, false, `dispatchChatFileList/${payload.type}`);
  },

  getOptimisticNotes: () => {
    const { localNoteMap, fileList } = get();

    console.log('filelist', fileList);

    // Get server notes from fileList state
    const serverNotes = (fileList || []).filter(
      (file: FileListItem) => file.fileType === 'custom/note',
    );

    // Track which notes we've added
    const addedIds = new Set<string>();

    // Create result array - start with server notes
    const result: FileListItem[] = serverNotes.map((note) => {
      addedIds.add(note.id);
      // Check if we have a local optimistic update for this note
      const localUpdate = localNoteMap.get(note.id);
      // If local update exists and is newer, use it; otherwise use server version
      if (localUpdate && new Date(localUpdate.updatedAt) >= new Date(note.updatedAt)) {
        return localUpdate;
      }
      return note;
    });

    // Add any optimistic notes that aren't in server list yet (e.g., newly created temp notes)
    for (const [id, note] of localNoteMap.entries()) {
      if (!addedIds.has(id) && note.fileType === 'custom/note') {
        result.unshift(note); // Add new notes to the beginning
      }
    }

    return result;
  },

  removeChatUploadFile: async (id) => {
    const { dispatchChatUploadFileList } = get();

    dispatchChatUploadFileList({ id, type: 'removeFile' });
    await fileService.removeFile(id);
  },

  removeNote: async (noteId) => {
    // Remove from local optimistic map first (optimistic update)
    const { localNoteMap } = get();
    const newMap = new Map(localNoteMap);
    newMap.delete(noteId);
    set({ localNoteMap: newMap }, false, n('removeNote/optimistic'));

    try {
      // Delete from documents table
      await documentService.deleteDocument(noteId);
      // Refresh file list to sync with server
      await get().refreshFileList();
    } catch (error) {
      console.error('Failed to delete note:', error);
      // Restore the note in local map on error
      const restoredMap = new Map(localNoteMap);
      set({ localNoteMap: restoredMap }, false, n('removeNote/restore'));
      throw error;
    }
  },

  removeTempNote: (tempId) => {
    const { localNoteMap } = get();
    const newMap = new Map(localNoteMap);
    newMap.delete(tempId);
    set({ localNoteMap: newMap }, false, n('removeTempNote'));
  },

  replaceTempNoteWithReal: (tempId, realNote) => {
    const { localNoteMap } = get();
    const newMap = new Map(localNoteMap);

    // Remove temp note
    newMap.delete(tempId);

    // Add real note with same position
    newMap.set(realNote.id, realNote);

    set({ localNoteMap: newMap }, false, n('replaceTempNoteWithReal'));
  },

  startAsyncTask: async (id, runner, onFileItemUpdate) => {
    await runner(id);

    let isFinished = false;

    while (!isFinished) {
      // 每间隔 2s 查询一次任务状态
      await sleep(2000);

      let fileItem: FileListItem | undefined = undefined;

      try {
        fileItem = await fileService.getFileItem(id);
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

  syncNoteMapWithServer: (notes) => {
    const { localNoteMap } = get();
    const newMap = new Map(localNoteMap);

    // Remove temp notes that now exist on server
    // This prevents duplicates after creating a new note
    for (const [id] of localNoteMap.entries()) {
      if (id.startsWith('temp-note-')) {
        newMap.delete(id);
      }
    }

    // Update or add notes from server
    for (const note of notes) {
      if (note.fileType === 'custom/note') {
        newMap.set(note.id, note);
      }
    }

    set({ localNoteMap: newMap }, false, n('syncNoteMapWithServer'));
  },

  updateNoteOptimistically: async (noteId, updates) => {
    const { localNoteMap, fileList } = get();

    // Find the note either in local map or file list
    const existingNote = localNoteMap.get(noteId) || fileList?.find((f) => f.id === noteId);

    if (!existingNote) {
      console.warn('[updateNoteOptimistically] Note not found:', noteId);
      return;
    }

    // Create updated note with new timestamp
    // Merge metadata if both exist, otherwise use the update's metadata or preserve existing
    const mergedMetadata = updates.metadata !== undefined
      ? { ...(existingNote.metadata || {}), ...updates.metadata }
      : existingNote.metadata;

    // Clean up undefined values from metadata
    const cleanedMetadata = mergedMetadata
      ? Object.fromEntries(Object.entries(mergedMetadata).filter(([_, v]) => v !== undefined))
      : undefined;

    const updatedNote: FileListItem = {
      ...existingNote,
      ...updates,
      metadata: cleanedMetadata,
      updatedAt: new Date(),
    };

    console.log('updatedNote', updatedNote);

    // Update local map immediately for optimistic UI
    const newMap = new Map(localNoteMap);
    newMap.set(noteId, updatedNote);
    set({ localNoteMap: newMap }, false, n('updateNoteOptimistically'));

    // Queue background sync to DB
    try {
      await documentService.updateDocument({
        content: updatedNote.content || '',
        editorData:
          typeof updatedNote.editorData === 'string'
            ? updatedNote.editorData
            : JSON.stringify(updatedNote.editorData),
        id: noteId,
        metadata: updatedNote.metadata,
        title: updatedNote.name,
      });

      // After successful sync, refresh file list to get server state
      // This will eventually sync back to the map via syncNoteMapWithServer
    } catch (error) {
      console.error('[updateNoteOptimistically] Failed to sync to DB:', error);
      // On error, revert the optimistic update
      const revertMap = new Map(localNoteMap);
      if (existingNote) {
        revertMap.set(noteId, existingNote);
      } else {
        revertMap.delete(noteId);
      }
      set({ localNoteMap: revertMap }, false, n('revertOptimisticUpdate'));
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
