'use client';

import { useEditor } from '@lobehub/editor/react';
import { Modal } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { message } from '@/components/AntdStaticMethods';
import { documentService } from '@/services/document';
import { useFileStore } from '@/store/file';
import { DocumentSourceType, LobeDocument } from '@/types/document';

import ModalEditorCanvas from './EditorCanvas';

type EditorInstance = ReturnType<typeof useEditor>;

interface PageEditorModalProps {
  documentId?: string;
  documentTitle?: string;
  editorData?: Record<string, any> | null;
  knowledgeBaseId?: string;
  onClose: () => void;
  open: boolean;
  parentId?: string;
}

const PageEditorModal = memo<PageEditorModalProps>(
  ({
    open,
    onClose,
    documentId,
    documentTitle,
    editorData: cachedEditorData,
    knowledgeBaseId,
    parentId,
  }) => {
    const { t } = useTranslation('file');
    const editor = useEditor();
    const [currentTitle, setCurrentTitle] = useState(documentTitle || '');
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !!documentId;

    const updateDocumentOptimistically = useFileStore((s) => s.updateDocumentOptimistically);
    const replaceTempDocumentWithReal = useFileStore((s) => s.replaceTempDocumentWithReal);
    const refreshFileList = useFileStore((s) => s.refreshFileList);

    const handleClose = () => {
      editor?.cleanDocument();
      setCurrentTitle('');
      onClose();
    };

    const handleSave = async () => {
      if (!editor || isSaving) return;

      const textContent = (editor.getDocument('markdown') as unknown as string) || '';
      if (!textContent || textContent.trim() === '') {
        message.warning(t('header.newNoteDialog.emptyContent', { ns: 'file' }));
        return;
      }

      setIsSaving(true);

      try {
        const currentEditorData = editor.getDocument('json');
        const currentContent = (editor.getDocument('markdown') as unknown as string) || '';

        if (documentId && !documentId.startsWith('temp-document-')) {
          // Update existing document
          await updateDocumentOptimistically(documentId, {
            content: currentContent,
            editorData: structuredClone(currentEditorData),
            title: currentTitle,
            updatedAt: new Date(),
          });
        } else {
          // Create new document
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
            },
            source: 'document',
            sourceType: DocumentSourceType.EDITOR,
            title: finalTitle,
            totalCharCount: currentContent.length,
            totalLineCount: 0,
            updatedAt: new Date(now),
          };

          if (documentId?.startsWith('temp-document-')) {
            replaceTempDocumentWithReal(documentId, realPage);
          }

          refreshFileList();
        }

        message.success(
          isEditMode
            ? t('header.newNoteDialog.updateSuccess', { ns: 'file' })
            : t('header.newNoteDialog.saveSuccess', { ns: 'file' }),
        );
        editor?.cleanDocument();
        onClose();
      } catch (error) {
        console.error('Failed to save note:', error);
        message.error(t('header.newNoteDialog.saveError', { ns: 'file' }));
      } finally {
        setIsSaving(false);
      }
    };

    const onEditorInit = (editor: EditorInstance) => {
      if (open && documentId && editor && cachedEditorData) {
        setCurrentTitle(documentTitle || '');
        editor.setDocument('json', JSON.stringify(cachedEditorData));
      } else if (!open) {
        editor?.cleanDocument();
        setCurrentTitle('');
      }
    };

    return (
      <Modal
        destroyOnHidden
        okButtonProps={{ loading: isSaving }}
        okText={t('header.newNoteDialog.save')}
        onCancel={handleClose}
        onOk={handleSave}
        open={open}
        width={800}
      >
        <Flexbox padding={16}>
          <ModalEditorCanvas editor={editor} onInit={onEditorInit} style={{ minHeight: 400 }} />
        </Flexbox>
      </Modal>
    );
  },
);

export default PageEditorModal;
