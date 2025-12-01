'use client';

import { ActionIcon } from '@lobehub/ui';
import { SquarePenIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useFileStore } from '@/store/file';

const AddButton = memo(() => {
  const { t } = useTranslation('file');

  const createNewPage = useFileStore((s) => s.createNewPage);

  const handleNewDocument = () => {
    const untitledTitle = t('documentList.untitled');
    createNewPage(untitledTitle);
  };

  return (
    <ActionIcon
      icon={SquarePenIcon}
      onClick={handleNewDocument}
      size={DESKTOP_HEADER_ICON_SIZE}
      title={t('header.newPageButton')}
    />
  );
});

export default AddButton;
