'use client';

import { createStyles } from 'antd-style';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileStore } from '@/store/file';

import PageExplorerPlaceholder from './DocumentEditorPlaceholder';
import PageEditor from './PageEditor';

const useStyles = createStyles(({ css, token }) => ({
  editorPanel: css`
    overflow: hidden;
    flex: 1;
    background: ${token.colorBgContainer};
  `,
}));

interface PageExplorerProps {
  documentId?: string;
  knowledgeBaseId?: string;
}

/**
 * Page explorer component - renders the page editor
 */
const PageExplorer = memo<PageExplorerProps>(({ documentId, knowledgeBaseId }) => {
  const { t } = useTranslation('file');
  const { styles } = useStyles();

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
    if (documentId && documentId !== selectedPageId) {
      setSelectedPageId(documentId, false);
    }
  }, [documentId]);

  const pages = getOptimisticDocuments();
  const currentPageId = selectedPageId || documentId;

  const handleNewDocument = () => {
    const untitledTitle = t('documentList.untitled');
    createNewPage(untitledTitle);
  };

  const handleDelete = (docId: string) => {
    deletePage(docId);
  };

  return (
    <div className={styles.editorPanel}>
      {currentPageId ? (
        <PageEditor
          knowledgeBaseId={knowledgeBaseId}
          onDelete={() => handleDelete(currentPageId)}
          onDocumentIdChange={() => {}}
          pageId={currentPageId}
        />
      ) : (
        <PageExplorerPlaceholder
          hasPages={pages.length > 0}
          knowledgeBaseId={knowledgeBaseId}
          onCreateNewNote={handleNewDocument}
          onNoteCreated={() => {}}
        />
      )}
    </div>
  );
});

export default PageExplorer;
