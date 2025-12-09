'use client';

import { Empty } from 'antd';
import { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { VList, VListHandle } from 'virtua';

import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { documentSelectors, useFileStore } from '@/store/file';
import { LobeDocument } from '@/types/document';

import Item from '../List/Item';

interface ContentProps {
  searchKeyword: string;
}

const Content = memo<ContentProps>(({ searchKeyword }) => {
  const { t } = useTranslation('file');
  const virtuaRef = useRef<VListHandle>(null);
  const fetchedCountRef = useRef(-1);

  const [hasMore, isLoadingMore, loadMoreDocuments] = useFileStore((s) => [
    documentSelectors.hasMoreDocuments(s),
    documentSelectors.isLoadingMoreDocuments(s),
    s.loadMoreDocuments,
  ]);

  const allFilteredPages = useFileStore(documentSelectors.getFilteredPages);

  // Filter by search keyword
  const displayPages = useMemo(() => {
    if (!searchKeyword.trim()) return allFilteredPages;

    const keyword = searchKeyword.toLowerCase();
    return allFilteredPages.filter((page: LobeDocument) => {
      const content = page.content?.toLowerCase() || '';
      const title = page.title?.toLowerCase() || '';
      return content.includes(keyword) || title.includes(keyword);
    });
  }, [allFilteredPages, searchKeyword]);

  const count = displayPages.length;
  const isSearching = searchKeyword.trim().length > 0;

  // Handle scroll - use findItemIndex (official pattern)
  const handleScroll = useCallback(async () => {
    // Don't load more when searching
    if (isSearching) return;

    const ref = virtuaRef.current;
    if (!ref || !hasMore) return;

    // Use findItemIndex to detect scroll position
    const bottomVisibleIndex = ref.findItemIndex(ref.scrollOffset + ref.viewportSize);

    // When scrolled near the end (within 5 items), load more
    if (fetchedCountRef.current < count && bottomVisibleIndex + 5 > count) {
      fetchedCountRef.current = count;
      await loadMoreDocuments();
    }
  }, [hasMore, loadMoreDocuments, count, isSearching]);

  const showLoading = isLoadingMore && !isSearching;

  // Show empty state
  if (count === 0) {
    return (
      <Center height={'100%'}>
        <Empty
          description={isSearching ? t('documentList.noResults') : t('documentList.empty')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Center>
    );
  }

  return (
    <VList
      bufferSize={typeof window !== 'undefined' ? window.innerHeight : 0}
      onScroll={handleScroll}
      ref={virtuaRef}
      style={{ height: '100%' }}
    >
      {displayPages.map((page) => (
        <Flexbox gap={1} key={page.id} padding={'4px 8px'}>
          <Item documentId={page.id} />
        </Flexbox>
      ))}
      {showLoading && (
        <Flexbox padding={'4px 8px'}>
          <SkeletonList rows={3} />
        </Flexbox>
      )}
    </VList>
  );
});

Content.displayName = 'AllPagesDrawerContent';

export default Content;
