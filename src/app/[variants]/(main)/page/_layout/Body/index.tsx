'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

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

  return (
    <Flexbox gap={1} paddingInline={4}>
      {filteredPages.length === 0 ? (
        <div style={{ color: 'var(--lobe-text-secondary)', padding: 24, textAlign: 'center' }}>
          {searchKeywords.trim() ? t('documentList.noResults') : t('documentList.empty')}
        </div>
      ) : (
        <List />
      )}
    </Flexbox>
  );
});

export default Body;
