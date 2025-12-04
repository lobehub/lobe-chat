'use client';

import { Accordion, AccordionItem, Text } from '@lobehub/ui';
import { Empty } from 'antd';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { documentSelectors, useFileStore } from '@/store/file';

import Actions from './Actions';
import List from './List';

export enum GroupKey {
  AllPages = 'all-pages',
}

const Body = memo(() => {
  const { t } = useTranslation('file');
  const isDocumentListLoading = useFileStore((s) => s.isDocumentListLoading);
  const filteredPages = useFileStore(documentSelectors.getFilteredPages);
  const searchKeywords = useFileStore((s) => s.searchKeywords);

  return (
    <Flexbox gap={1} paddingInline={4}>
      <Accordion defaultExpandedKeys={[GroupKey.AllPages]} gap={2}>
        <AccordionItem
          action={<Actions />}
          itemKey={GroupKey.AllPages}
          paddingBlock={4}
          paddingInline={'8px 4px'}
          title={
            <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
              {t('documentList.title')}
              {filteredPages.length > 0 && ` ${filteredPages.length}`}
            </Text>
          }
        >
          <Suspense fallback={<SkeletonList />}>
            {isDocumentListLoading ? (
              <SkeletonList />
            ) : (
              <Flexbox gap={1} paddingBlock={1}>
                {filteredPages.length === 0 ? (
                  <Empty
                    description={
                      searchKeywords.trim() ? t('documentList.noResults') : t('documentList.empty')
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <List />
                )}
              </Flexbox>
            )}
          </Suspense>
        </AccordionItem>
      </Accordion>
    </Flexbox>
  );
});

export default Body;
