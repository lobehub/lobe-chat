'use client';

import { memo, useEffect } from 'react';

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
  const [selectedPageId, setSelectedPageId, getOptimisticDocuments, fetchDocuments, deletePage] =
    useFileStore((s) => [
      s.selectedPageId,
      s.setSelectedPageId,
      s.getOptimisticDocuments,
      s.fetchDocuments,
      s.deletePage,
    ]);

  useEffect(() => {
    if (pageId && pageId !== selectedPageId) {
      setSelectedPageId(pageId, false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchDocuments({ pageOnly: true });
  }, [fetchDocuments]);

  const pages = getOptimisticDocuments();
  const currentPageId = selectedPageId || pageId;

  const handleDelete = (docId: string) => {
    deletePage(docId);
  };

  // Check if the current page exists in the pages list
  const currentPageExists = currentPageId && pages.some((page) => page.id === currentPageId);

  if (!currentPageId || !currentPageExists) {
    return <PageExplorerPlaceholder hasPages={pages?.length > 0} />;
  }

  return (
    <PageEditor
      // knowledgeBaseId={knowledgeBaseId}
      onDelete={() => handleDelete(currentPageId)}
      pageId={currentPageId}
    />
  );
});

export default PageExplorer;
