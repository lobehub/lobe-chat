'use client';

import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import PageEditor from '@/features/PageEditor';
import { useFileStore } from '@/store/file';

import PageExplorerPlaceholder from './PageExplorerPlaceholder';

interface PageExplorerProps {
  knowledgeBaseId?: string;
  pageId?: string;
}

const PageExplorer = memo<PageExplorerProps>(({ pageId, knowledgeBaseId }) => {
  const { t } = useTranslation('file');

  const [
    selectedPageId,
    setSelectedPageId,
    getOptimisticDocuments,
    fetchDocuments,
    createNewPage,
    deletePage,
  ] = useFileStore((s) => [
    s.selectedPageId,
    s.setSelectedPageId,
    s.getOptimisticDocuments,
    s.fetchDocuments,
    s.createNewPage,
    s.deletePage,
  ]);

  useEffect(() => {
    if (pageId && pageId !== selectedPageId) {
      setSelectedPageId(pageId, false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const pages = getOptimisticDocuments();
  const currentPageId = selectedPageId || pageId;

  const handleNewDocument = () => {
    const untitledTitle = t('documentList.untitled');
    createNewPage(untitledTitle);
  };

  const handleDelete = (docId: string) => {
    deletePage(docId);
  };

  if (!currentPageId)
    return (
      <PageExplorerPlaceholder
        hasPages={pages?.length > 0}
        knowledgeBaseId={knowledgeBaseId}
        onCreateNewNote={handleNewDocument}
      />
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
