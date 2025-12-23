'use client';

import { memo, useEffect, useRef } from 'react';

import PageEditor from '@/features/PageEditor';
import { useFileStore } from '@/store/file';

import PageExplorerPlaceholder from './PageExplorerPlaceholder';

interface PageExplorerProps {
  // Current opened page id
  pageId?: string;
}

/**
 * Dedicated for the /page route
 *
 * Work together with a sidebar src/app/[variants]/(main)/page/_layout/Body/index.tsx
 */
const PageExplorer = memo<PageExplorerProps>(({ pageId }) => {
  const [
    selectedPageId,
    setSelectedPageId,
    pages,
    fetchDocuments,
    fetchDocumentDetail,
    isDocumentListLoading,
  ] = useFileStore((s) => [
    s.selectedPageId,
    s.setSelectedPageId,
    s.getOptimisticDocuments(), // Call inside selector to subscribe to changes
    s.fetchDocuments,
    s.fetchDocumentDetail,
    s.deletePage,
    s.isDocumentListLoading,
  ]);

  // Track previous pageId to detect actual URL changes (start undefined to run on first load)
  const prevPageIdRef = useRef<string | undefined>(undefined);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments({ pageOnly: true });
  }, [fetchDocuments]);

  // When pageId prop changes (from URL navigation), update selected page and fetch details
  // Use ref to only sync when pageId actually changes, avoiding conflicts with sidebar selection
  useEffect(() => {
    if (pageId && pageId !== prevPageIdRef.current) {
      prevPageIdRef.current = pageId;
      setSelectedPageId(pageId, false);
      // Fetch the document detail to ensure it's loaded in the local map
      fetchDocumentDetail(pageId);
    }
  }, [pageId, setSelectedPageId, fetchDocumentDetail]);

  const currentPageId = selectedPageId || pageId;

  // Check if the current page exists in the pages list
  const currentPageExists = currentPageId && pages.some((page) => page.id === currentPageId);

  // When we have a pageId from URL but document list is not yet loaded (empty list or still loading),
  // proceed to show the editor instead of placeholder. The editor handles its own loading state.
  // This prevents the placeholder flash on page refresh.
  const isWaitingForDocuments = pages.length === 0 || isDocumentListLoading;
  const shouldShowEditor =
    currentPageId && (currentPageExists || (pageId && isWaitingForDocuments));

  if (!shouldShowEditor) {
    return <PageExplorerPlaceholder hasPages={pages?.length > 0} />;
  }

  return <PageEditor pageId={currentPageId} />;
});

export default PageExplorer;
