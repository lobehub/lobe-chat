'use client';

import { useEditor } from '@lobehub/editor/react';
import { App } from 'antd';
import { ReactNode, createContext, memo, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileStore } from '@/store/file';
import { documentSelectors } from '@/store/file/slices/document/selectors';

import { usePageEditor } from './usePageEditor';

type EditorInstance = ReturnType<typeof useEditor>;

interface PageEditorContextValue {
  chatPanelExpanded: boolean;
  currentDocId: string | undefined;
  currentEmoji: string | undefined;
  currentTitle: string;
  debouncedSave: () => void;
  editor: EditorInstance;
  handleContentChange: () => void;
  handleCopyLink: () => void;
  handleDelete: () => void;
  handleTitleSubmit: () => Promise<void>;
  knowledgeBaseId: string | undefined;
  lastUpdatedTime: Date | null;
  onEditorInit: () => void;
  pageId: string | undefined;
  parentId: string | null | undefined;
  saveStatus: 'idle' | 'saving' | 'saved';
  setChatPanelExpanded: (expanded: boolean) => void;
  setCurrentEmoji: (emoji: string | undefined) => void;
  setCurrentTitle: (title: string) => void;
  toggleChatPanel: () => void;
  wordCount: number;
}

const PageEditorContext = createContext<PageEditorContextValue | null>(null);

export const usePageEditorContext = () => {
  const context = useContext(PageEditorContext);
  if (!context) {
    throw new Error('usePageEditorContext must be used within PageEditorProvider');
  }
  return context;
};

interface PageEditorProviderProps {
  children: ReactNode;
  knowledgeBaseId?: string;
  onDelete?: () => void;
  onDocumentIdChange?: (newId: string) => void;
  onSave?: () => void;
  pageId?: string;
}

export const PageEditorProvider = memo<PageEditorProviderProps>(
  ({ children, pageId, knowledgeBaseId, onDocumentIdChange, onSave, onDelete }) => {
    const { t } = useTranslation(['file', 'common']);
    const { message, modal } = App.useApp();

    const editor = useEditor();
    const [chatPanelExpanded, setChatPanelExpanded] = useState(false);

    const removeDocument = useFileStore((s) => s.removeDocument);
    const currentDocument = useFileStore(documentSelectors.getDocumentById(pageId));
    const useFetchKnowledgeItem = useFileStore((s) => s.useFetchKnowledgeItem);
    const { data: fetchedDocument } = useFetchKnowledgeItem(pageId);

    const pageDocument = currentDocument || fetchedDocument;

    const {
      currentDocId,
      currentEmoji,
      currentTitle,
      lastUpdatedTime,
      saveStatus,
      wordCount,
      setCurrentEmoji,
      setCurrentTitle,
      debouncedSave,
      handleContentChange,
      performSave,
      onEditorInit,
    } = usePageEditor({
      autoSave: true,
      documentId: pageId,
      editor,
      knowledgeBaseId,
      onDocumentIdChange,
      onSave,
    });

    const handleDelete = useCallback(async () => {
      if (!currentDocId) return;

      modal.confirm({
        cancelText: t('cancel', { ns: 'common' }),
        content: t('documentEditor.deleteConfirm.content'),
        okButtonProps: { danger: true },
        okText: t('delete', { ns: 'common' }),
        onOk: async () => {
          try {
            await removeDocument(currentDocId);
            message.success(t('documentEditor.deleteSuccess'));
            onDelete?.();
          } catch (error) {
            console.error('Failed to delete page:', error);
            message.error(t('documentEditor.deleteError'));
          }
        },
        title: t('documentEditor.deleteConfirm.title'),
      });
    }, [currentDocId, modal, removeDocument, message, onDelete, t]);

    const handleCopyLink = useCallback(() => {
      if (currentDocId) {
        const url = `${window.location.origin}${window.location.pathname}`;
        navigator.clipboard.writeText(url);
        message.success(t('documentEditor.linkCopied'));
      }
    }, [currentDocId, message, t]);

    const handleTitleSubmit = useCallback(async () => {
      await performSave();
      editor?.focus();
    }, [performSave, editor]);

    const toggleChatPanel = useCallback(() => {
      setChatPanelExpanded((prev) => !prev);
    }, []);

    const value: PageEditorContextValue = {
      chatPanelExpanded,
      currentDocId,
      currentEmoji,
      currentTitle,
      debouncedSave,
      editor,
      handleContentChange,
      handleCopyLink,
      handleDelete,
      handleTitleSubmit,
      knowledgeBaseId,
      lastUpdatedTime,
      onEditorInit,
      pageId,
      parentId: pageDocument?.parentId,
      saveStatus,
      setChatPanelExpanded,
      setCurrentEmoji,
      setCurrentTitle,
      toggleChatPanel,
      wordCount,
    };

    return <PageEditorContext.Provider value={value}>{children}</PageEditorContext.Provider>;
  },
);
