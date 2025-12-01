'use client';

import { Accordion, Text } from '@lobehub/ui';
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

  return (
    <Flexbox paddingInline={4}>
      <Accordion defaultExpandedKeys={[GroupKey.AllPages]} gap={8}>
        {/* 全部文稿 - 不折叠，直接作为列表展示 */}
        <Flexbox gap={4}>
          <Text
            ellipsis
            fontSize={12}
            style={{ paddingBlock: 4, paddingInline: '8px 4px' }}
            type={'secondary'}
            weight={500}
          >
            {t('menu.allPages', { defaultValue: '全部文稿' })}
          </Text>
          {isDocumentListLoading ? (
            <SkeletonList paddingInline={4} rows={8} />
          ) : filteredPages.length === 0 ? (
            <div style={{ color: 'var(--lobe-text-secondary)', padding: 24, textAlign: 'center' }}>
              {searchKeywords.trim() ? t('documentList.noResults') : t('documentList.empty')}
            </div>
          ) : (
            <List />
          )}
        </Flexbox>
      </Accordion>
    </Flexbox>
  );
});

export default Body;
