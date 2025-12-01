'use client';

import { Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { documentSelectors, useFileStore } from '@/store/file';

import Item from './Item';

const DocumentList = memo(() => {
  const { t } = useTranslation('file');

  const filteredPages = useFileStore(documentSelectors.getFilteredPages);
  const searchKeywords = useFileStore((s) => s.searchKeywords);

  if (filteredPages.length === 0) {
    return (
      <div style={{ color: 'var(--lobe-text-secondary)', padding: 24, textAlign: 'center' }}>
        {searchKeywords.trim() ? t('documentList.noResults') : t('documentList.empty')}
      </div>
    );
  }

  return (
    <Flexbox gap={1} paddingInline={4}>
      {filteredPages.map((page) => (
        <Item documentId={page.id} key={page.id} />
      ))}
      <Center style={{ paddingBlock: 16 }}>
        <Text style={{ fontSize: 12 }} type={'secondary'}>
          {t('documentList.pageCount', { count: filteredPages.length })}
        </Text>
      </Center>
    </Flexbox>
  );
});

export default DocumentList;
