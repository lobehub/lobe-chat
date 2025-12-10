'use client';

import { memo, useEffect } from 'react';

import PageEditor from '@/features/PageEditor';
import { useFileStore } from '@/store/file';

import PageExplorerPlaceholder from './PageExplorerPlaceholder';

interface PageExplorerProps {
  knowledgeBaseId?: string;
  pageId?: string;
}

/**
 * Dedicated for the /page route
 */
const PageExplorer = memo<PageExplorerProps>(({ pageId, knowledgeBaseId }) => {
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

  if (!currentPageId)
    return (
      <PageExplorerPlaceholder hasPages={pages?.length > 0} knowledgeBaseId={knowledgeBaseId} />
    );

  return (
    <PageEditor
      knowledgeBaseId={knowledgeBaseId}
      onDelete={() => handleDelete(currentPageId)}
      pageId={currentPageId}
    />
  );
});

export default PageExplorer;
