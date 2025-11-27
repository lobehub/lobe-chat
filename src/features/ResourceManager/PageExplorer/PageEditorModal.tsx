'use client';

import { useEditor } from '@lobehub/editor/react';
import { Modal } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { message } from '@/components/AntdStaticMethods';

import EditorContent from './EditorContent';
import { usePageEditor } from './hooks/usePageEditor';

type EditorInstance = ReturnType<typeof useEditor>;

interface NoteEditorModalProps {
  documentId?: string;
  documentTitle?: string;
  editorData?: Record<string, any> | null;
  knowledgeBaseId?: string;
  onClose: () => void;
  open: boolean;
  parentId?: string;
}

const PageEditorModal = memo<NoteEditorModalProps>(
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

    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !!documentId;

    const { currentTitle, setCurrentTitle, performSave } = usePageEditor({
      autoSave: false, // Manual save for modal
      documentId,
      editor,
      knowledgeBaseId,
      onSave: async () => {
        message.success(
          isEditMode
            ? t('header.newNoteDialog.updateSuccess', { ns: 'file' })
            : t('header.newNoteDialog.saveSuccess', { ns: 'file' }),
        );
        editor?.cleanDocument();
        onClose();
      },
      parentId,
    });

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
        await performSave({ title: currentTitle });
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
          <EditorContent editor={editor} onInit={onEditorInit} style={{ minHeight: 400 }} />
        </Flexbox>
      </Modal>
    );
  },
);

export default PageEditorModal;
