'use client';

import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import PageEditor from '@/features/PageEditor';
import { useFileStore } from '@/store/file';

import PageExplorerPlaceholder from './DocumentEditorPlaceholder';

interface PageExplorerProps {
  knowledgeBaseId?: string;
  pageId?: string;
}

/**
 * Page explorer component - renders the page editor
 */
const PageExplorer = memo<PageExplorerProps>(({ pageId, knowledgeBaseId }) => {
  const { t } = useTranslation('file');

  const selectedPageId = useFileStore((s) => s.selectedPageId);
  const fetchDocuments = useFileStore((s) => s.fetchDocuments);
  const getOptimisticDocuments = useFileStore((s) => s.getOptimisticDocuments);
  const setSelectedPageId = useFileStore((s) => s.setSelectedPageId);
  const createNewPage = useFileStore((s) => s.createNewPage);
  const deletePage = useFileStore((s) => s.deletePage);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // If documentId is provided from URL, set it as selected
  useEffect(() => {
    if (pageId && pageId !== selectedPageId) {
      setSelectedPageId(pageId, false);
    }
  }, [pageId]);

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
        hasPages={pages.length > 0}
        knowledgeBaseId={knowledgeBaseId}
        onCreateNewNote={handleNewDocument}
        onNoteCreated={() => {}}
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
