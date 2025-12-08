import { EDITOR_DEBOUNCE_TIME, EDITOR_MAX_WAIT } from '@lobechat/const';
import { debounce } from 'lodash-es';
import { StateCreator } from 'zustand';

import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { DocumentSourceType, LobeDocument } from '@/types/document';

import { State, initialState } from './initialState';

export interface Action {
  flushSave: () => void;
  handleContentChange: () => void;
  handleCopyLink: (t: (key: string) => string, message: any) => void;
  handleDelete: (
    t: (key: string) => string,
    message: any,
    modal: any,
    onDeleteCallback?: () => void,
  ) => Promise<void>;
  handleTitleSubmit: () => Promise<void>;
  onEditorInit: () => void;
  performSave: () => Promise<void>;
  setCurrentEmoji: (emoji: string | undefined) => void;
  setCurrentTitle: (title: string) => void;
}

export type Store = State & Action;

// Create debounced save function outside of store for reuse
const createDebouncedSave = (get: () => Store) =>
  debounce(
    async () => {
      try {
        await get().performSave();
      } catch (error) {
        console.error('[PageEditor] Failed to auto-save:', error);
      }
    },
    EDITOR_DEBOUNCE_TIME,
    { leading: false, maxWait: EDITOR_MAX_WAIT, trailing: true },
  );

export const store: (initState?: Partial<State>) => StateCreator<Store> =
  (initState) => (set, get) => {
    const debouncedSave = createDebouncedSave(get);

    return {
      ...initialState,
      ...initState,

      flushSave: () => {
        debouncedSave.flush();
      },

      handleContentChange: () => {
        const { editor, lastSavedContent } = get();
        if (!editor) return;

        try {
          const textContent = (editor.getDocument('text') as unknown as string) || '';
          const markdownContent = (editor.getDocument('markdown') as unknown as string) || '';
          const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;

          // Check if content actually changed
          const contentChanged = markdownContent !== lastSavedContent;

          set({ isDirty: contentChanged, wordCount });

          // Only trigger auto-save if content actually changed
          if (contentChanged) {
            debouncedSave();
          }
        } catch (error) {
          console.error('[PageEditor] Failed to update content:', error);
        }
      },

      handleCopyLink: (t, message) => {
        const { currentDocId } = get();
        if (currentDocId) {
          const url = `${window.location.origin}${window.location.pathname}`;
          navigator.clipboard.writeText(url);
          message.success(t('documentEditor.linkCopied'));
        }
      },

      handleDelete: async (t, message, modal, onDeleteCallback) => {
        const { currentDocId } = get();
        if (!currentDocId) return;

        return new Promise((resolve, reject) => {
          modal.confirm({
            cancelText: t('cancel'),
            content: t('documentEditor.deleteConfirm.content'),
            okButtonProps: { danger: true },
            okText: t('delete'),
            onOk: async () => {
              try {
                const { removeDocument } = useFileStore.getState();
                await removeDocument(currentDocId);
                message.success(t('documentEditor.deleteSuccess'));
                onDeleteCallback?.();
                resolve();
              } catch (error) {
                console.error('Failed to delete page:', error);
                message.error(t('documentEditor.deleteError'));
                reject(error);
              }
            },
            title: t('documentEditor.deleteConfirm.title'),
          });
        });
      },

      handleTitleSubmit: async () => {
        const { performSave, editor } = get();
        await performSave();
        editor?.focus();
      },

      onEditorInit: () => {
        // Called when editor is initialized
      },

      performSave: async () => {
        const {
          editor,
          currentDocId,
          currentTitle,
          currentEmoji,
          knowledgeBaseId,
          parentId,
          onDocumentIdChange,
          onSave,
          isDirty,
        } = get();

        if (!editor) return;

        // Skip save if no changes
        if (!isDirty && currentDocId && !currentDocId.startsWith('temp-document-')) {
          return;
        }

        set({ saveStatus: 'saving' });

        try {
          const editorElement = editor.getRootElement();
          const hadFocus = editorElement?.contains(document.activeElement) ?? false;

          const currentEditorData = editor.getDocument('json');
          const currentContent = (editor.getDocument('markdown') as unknown as string) || '';

          if (!currentContent?.trim()) {
            set({ saveStatus: 'idle' });
            return;
          }

          const { updateDocumentOptimistically, replaceTempDocumentWithReal, refreshFileList } =
            useFileStore.getState();

          if (currentDocId && !currentDocId.startsWith('temp-document-')) {
            await updateDocumentOptimistically(currentDocId, {
              content: currentContent,
              editorData: structuredClone(currentEditorData),
              metadata: currentEmoji ? { emoji: currentEmoji } : { emoji: undefined },
              title: currentTitle,
              updatedAt: new Date(),
            });
          } else {
            const now = Date.now();
            const timestamp = new Date(now).toLocaleString('en-US', {
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const finalTitle = currentTitle || `Page - ${timestamp}`;

            const newPage = await documentService.createDocument({
              content: currentContent,
              editorData: JSON.stringify(currentEditorData),
              fileType: 'custom/document',
              knowledgeBaseId,
              metadata: {
                createdAt: now,
                ...(currentEmoji ? { emoji: currentEmoji } : {}),
              },
              parentId,
              title: finalTitle,
            });

            const realPage: LobeDocument = {
              content: currentContent,
              createdAt: new Date(now),
              editorData: structuredClone(currentEditorData) || null,
              fileType: 'custom/document' as const,
              filename: finalTitle,
              id: newPage.id,
              metadata: {
                createdAt: now,
                ...(currentEmoji ? { emoji: currentEmoji } : {}),
              },
              source: 'document',
              sourceType: DocumentSourceType.EDITOR,
              title: finalTitle,
              totalCharCount: currentContent.length,
              totalLineCount: 0,
              updatedAt: new Date(now),
            };

            if (currentDocId?.startsWith('temp-document-')) {
              replaceTempDocumentWithReal(currentDocId, realPage);
            }

            set({ currentDocId: newPage.id });
            onDocumentIdChange?.(newPage.id);
            refreshFileList();
          }

          if (hadFocus) {
            setTimeout(() => {
              editor?.focus();
            }, 0);
          }

          // Mark as clean and update save status
          set({
            isDirty: false,
            lastSavedContent: currentContent,
            lastUpdatedTime: new Date(),
            saveStatus: 'saved',
          });
          onSave?.();
        } catch (error) {
          console.error('[PageEditor] Failed to save:', error);
          set({ saveStatus: 'idle' });
        }
      },

      setCurrentEmoji: (emoji: string | undefined) => {
        set({ currentEmoji: emoji });
        debouncedSave();
      },

      setCurrentTitle: (title: string) => {
        set({ currentTitle: title });
        debouncedSave();
      },
    };
  };
