'use client';

import { Flexbox } from '@lobehub/ui';
import { MoreHorizontal } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import NavItem from '@/features/NavPanel/components/NavItem';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { documentSelectors, useFileStore } from '@/store/file';

import Item from './Item';

/**
 * Show pages filtered by knowledge base
 */
const PageList = memo(() => {
  const { t } = useTranslation('file');

  const filteredPages = useFileStore(documentSelectors.getFilteredPagesLimited);
  const hasMore = useFileStore(documentSelectors.hasMoreFilteredPages);
  const isLoadingMore = useFileStore(documentSelectors.isLoadingMoreDocuments);
  const openAllPagesDrawer = useFileStore((s) => s.openAllPagesDrawer);

  return (
    <Flexbox gap={1}>
      {filteredPages.map((page) => (
        <Item documentId={page.id} key={page.id} />
      ))}
      {isLoadingMore && <SkeletonList rows={3} />}
      {hasMore && !isLoadingMore && (
        <NavItem
          icon={MoreHorizontal}
          onClick={openAllPagesDrawer}
          title={t('more', { defaultValue: '更多', ns: 'common' })}
        />
      )}
    </Flexbox>
  );
});

export default PageList;
