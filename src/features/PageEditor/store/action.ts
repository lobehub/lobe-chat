import { StateCreator } from 'zustand';

import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { DocumentSourceType, LobeDocument } from '@/types/document';

import { State, initialState } from './initialState';

export interface Action {
  debouncedSave: () => void;
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
  setChatPanelExpanded: (expanded: boolean) => void;
  setCurrentEmoji: (emoji: string | undefined) => void;
  setCurrentTitle: (title: string) => void;
  toggleChatPanel: () => void;
}

export type Store = State & Action;

const DEBOUNCE_TIME = 1000;

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let contentChangeTimer: ReturnType<typeof setTimeout> | null = null;

export const store: (initState?: Partial<State>) => StateCreator<Store> =
  (initState) => (set, get) => ({
    ...initialState,
    ...initState,

    debouncedSave: () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }

      saveTimer = setTimeout(() => {
        void get().performSave();
      }, DEBOUNCE_TIME);
    },

    handleContentChange: () => {
      const { editor } = get();
      if (!editor) return;

      if (contentChangeTimer) {
        clearTimeout(contentChangeTimer);
      }

      contentChangeTimer = setTimeout(() => {
        try {
          const textContent = (editor.getDocument('text') as unknown as string) || '';
          const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;
          set({ wordCount });
        } catch (error) {
          console.error('[PageEditor] Failed to update content:', error);
        }
      }, DEBOUNCE_TIME);
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
      } = get();

      if (!editor) return;

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

        set({ lastUpdatedTime: new Date(), saveStatus: 'saved' });
        onSave?.();
      } catch (error) {
        console.error('[PageEditor] Failed to save:', error);
        set({ saveStatus: 'idle' });
      }
    },

    setChatPanelExpanded: (expanded: boolean) => {
      set({ chatPanelExpanded: expanded });
    },

    setCurrentEmoji: (emoji: string | undefined) => {
      set({ currentEmoji: emoji });
      get().debouncedSave();
    },

    setCurrentTitle: (title: string) => {
      set({ currentTitle: title });
      get().debouncedSave();
    },

    toggleChatPanel: () => {
      set((state) => ({ chatPanelExpanded: !state.chatPanelExpanded }));
    },
  });
