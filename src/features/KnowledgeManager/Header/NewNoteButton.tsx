'use client';

import { Button } from '@lobehub/ui';
import { FilePenLine } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import NoteEditorModal from '../DocumentExplorer/NoteEditorModal';

const NewNoteButton = ({ knowledgeBaseId }: { knowledgeBaseId?: string }) => {
  const { t } = useTranslation('file');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button icon={FilePenLine} onClick={handleOpen} type="primary">
        {t('header.newPageButton')}
      </Button>

      <NoteEditorModal knowledgeBaseId={knowledgeBaseId} onClose={handleClose} open={isModalOpen} />
    </>
  );
};

export default NewNoteButton;
