'use client';

import { useTranslation } from 'react-i18next';

import { useFileCategory } from '@/app/[variants]/(main)/files/hooks/useFileCategory';
import FileManager from '@/features/FileManager';
import { FilesTabs } from '@/types/files';

export default () => {
  const { t } = useTranslation('file');
  const [category] = useFileCategory();

  return <FileManager category={category} title={t(`tab.${category as FilesTabs}`)} />;
};
