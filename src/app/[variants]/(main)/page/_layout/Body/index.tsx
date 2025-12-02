'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import SkeletonList from '@/features/NavPanel/Body/SkeletonList';
import { documentSelectors, useFileStore } from '@/store/file';

import List from './DocumentList/List';

export enum GroupKey {
  AllPages = 'all-pages',
}

const Body = memo(() => {
  const { t } = useTranslation('file');
  const isDocumentListLoading = useFileStore((s) => s.isDocumentListLoading);
  const filteredPages = useFileStore(documentSelectors.getFilteredPages);
  const searchKeywords = useFileStore((s) => s.searchKeywords);

  if (isDocumentListLoading) return <SkeletonList />;

  if (filteredPages.length === 0)
    return (
      <div style={{ color: 'var(--lobe-text-secondary)', padding: 24, textAlign: 'center' }}>
        {searchKeywords.trim() ? t('documentList.noResults') : t('documentList.empty')}
      </div>
    );

  return <List />;
});

export default Body;
