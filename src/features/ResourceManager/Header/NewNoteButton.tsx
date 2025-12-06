'use client';

import { Button } from '@lobehub/ui';
import { FilePenLine } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import PageEditorModal from '@/features/PageEditor/Modal';
import { useFileStore } from '@/store/file';
import { DocumentSourceType } from '@/types/document';

const NewNoteButton = ({ knowledgeBaseId }: { knowledgeBaseId?: string }) => {
  const { t } = useTranslation('file');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createDocument = useFileStore((s) => s.createDocument);
  const currentFolderId = useFileStore((s) => s.currentFolderId);
  const setMode = useResourceManagerStore((s) => s.setMode);
  const setCurrentViewItemId = useResourceManagerStore((s) => s.setCurrentViewItemId);

  const handleOpen = async () => {
    // Create a new page directly and switch to page view
    const untitledTitle = t('documentList.untitled');
    const newPage = await createDocument({
      content: '',
      knowledgeBaseId,
      parentId: currentFolderId ?? undefined,
      title: untitledTitle,
    });

    // Add to local document map for immediate availability
    const newDocumentMap = new Map(useFileStore.getState().localDocumentMap);
    newDocumentMap.set(newPage.id, {
      content: newPage.content || '',
      createdAt: newPage.createdAt ? new Date(newPage.createdAt) : new Date(),
      editorData:
        typeof newPage.editorData === 'string'
          ? JSON.parse(newPage.editorData)
          : newPage.editorData || null,
      fileType: 'custom/document',
      filename: newPage.title || untitledTitle,
      id: newPage.id,
      metadata: newPage.metadata || {},
      source: 'document',
      sourceType: DocumentSourceType.EDITOR,
      title: newPage.title || untitledTitle,
      totalCharCount: newPage.content?.length || 0,
      totalLineCount: 0,
      updatedAt: newPage.updatedAt ? new Date(newPage.updatedAt) : new Date(),
    });
    useFileStore.setState({ localDocumentMap: newDocumentMap });

    // Switch to page view mode
    setCurrentViewItemId(newPage.id);
    setMode('page');
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button icon={FilePenLine} onClick={handleOpen} type="primary">
        {t('header.newPageButton')}
      </Button>

      <PageEditorModal knowledgeBaseId={knowledgeBaseId} onClose={handleClose} open={isModalOpen} />
    </>
  );
};

export default NewNoteButton;
