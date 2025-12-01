'use client';

import { ActionIcon, SearchBar, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { PlusIcon } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useFileStore } from '@/store/file';
import { DocumentSourceType, LobeDocument } from '@/types/document';

import PageExplorerPlaceholder from './DocumentEditorPlaceholder';
import DocumentListItem from './DocumentListItem';
import DocumentListSkeleton from './DocumentListSkeleton';
import PageEditor from './PageEditor';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    width: 100%;
    height: 100%;
  `,
  editorPanel: css`
    overflow: hidden;
    flex: 1;
    background: ${token.colorBgContainer};
  `,
  header: css`
    display: flex;
    gap: 8px;
    align-items: center;

    padding-block: ${token.paddingXXS}px;
    padding-inline: ${token.paddingXS}px;
    border-block-end: 1px solid ${token.colorBorderSecondary};

    background: ${token.colorBgLayout};
  `,
  listPanel: css`
    display: flex;
    flex-direction: column;

    width: 280px;
    min-width: 280px;
    border-inline-end: 1px solid ${token.colorBorderSecondary};

    background: ${token.colorBgLayout};
  `,
  pageList: css`
    overflow-y: auto;
    flex: 1;
    padding-block: 4px;
  `,
}));

interface DocumentExplorerProps {
  documentId?: string;
  knowledgeBaseId?: string;
}

const updateUrl = (docId: string | null) => {
  const newPath = docId ? `/pages/${docId}` : '/pages';
  window.history.replaceState({}, '', newPath);
};

/**
 * Add a list along side the page editor to allow for quick navigation and creation of pages.
 */
const DocumentExplorer = memo<DocumentExplorerProps>(({ knowledgeBaseId, documentId }) => {
  const { t } = useTranslation('file');
  const { styles } = useStyles();

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null);

  const fetchDocuments = useFileStore((s) => s.fetchDocuments);
  const getOptimisticDocuments = useFileStore((s) => s.getOptimisticDocuments);
  const isDocumentListLoading = useFileStore((s) => s.isDocumentListLoading);
  const createDocument = useFileStore((s) => s.createDocument);
  const createOptimisticDocument = useFileStore((s) => s.createOptimisticDocument);
  const replaceTempDocumentWithReal = useFileStore((s) => s.replaceTempDocumentWithReal);
  const updateDocumentOptimistically = useFileStore((s) => s.updateDocumentOptimistically);
  // Subscribe to localDocumentMap and documents to trigger re-render when documents are updated
  useFileStore((s) => s.localDocumentMap);
  useFileStore((s) => s.documents);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // If documentId is provided, automatically open that page
  useEffect(() => {
    if (documentId) {
      setSelectedPageId(documentId);
      setIsCreatingNew(false);
    }
  }, [documentId]);

  // Get optimistic pages (merged local + server)
  // Filter by knowledgeBaseId if provided
  // Since the API call already filters by knowledgeBaseId, we trust that data
  // But we also need to check local optimistic updates
  // Re-compute when localDocumentMap changes to ensure list updates when pages are edited
  const pages = getOptimisticDocuments();

  // Filter pages based on search keywords and sort by creation date (newest first)
  const filteredPages = useMemo(() => {
    let result = pages;

    // Filter by search keywords
    if (searchKeywords.trim()) {
      const lowerKeywords = searchKeywords.toLowerCase();
      result = pages.filter((page) => {
        const content = page.content?.toLowerCase() || '';
        const title = page.title?.toLowerCase() || '';
        return content.includes(lowerKeywords) || title.includes(lowerKeywords);
      });
    }

    // Sort by creation date (newest first)
    return result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [pages, searchKeywords]);

  const handleDocumentSelect = (documentId: string) => {
    if (selectedPageId === documentId) {
      // Deselect if clicking the same page
      setSelectedPageId(null);
      updateUrl(null);
    } else {
      setSelectedPageId(documentId);
      updateUrl(documentId);
    }
    setIsCreatingNew(false);
  };

  const handleNewDocument = async () => {
    const untitledTitle = t('documentList.untitled');

    // Create optimistic page immediately for instant UX
    const tempPageId = createOptimisticDocument(untitledTitle);
    setSelectedPageId(tempPageId);
    setIsCreatingNew(true);

    try {
      // Create real page in background
      const newPage = await createDocument({
        content: '',
        knowledgeBaseId,
        title: untitledTitle,
      });

      // Convert DocumentItem to EditorDocument
      const realPage: LobeDocument = {
        content: newPage.content || '',
        createdAt: newPage.createdAt ? new Date(newPage.createdAt) : new Date(),
        editorData:
          typeof newPage.editorData === 'string'
            ? JSON.parse(newPage.editorData)
            : newPage.editorData || null,
        fileType: 'custom/document',
        filename: newPage.title || untitledTitle,
        id: newPage.id,
        metadata: newPage.metadata || {},
        source: 'document',
        sourceType: DocumentSourceType.EDITOR,
        title: newPage.title || untitledTitle,
        totalCharCount: newPage.content?.length || 0,
        totalLineCount: 0,
        updatedAt: newPage.updatedAt ? new Date(newPage.updatedAt) : new Date(),
      };

      // Replace optimistic page with real page (smooth UX, no flicker)
      replaceTempDocumentWithReal(tempPageId, realPage);

      // Update selected page ID to real ID and update URL
      setSelectedPageId(newPage.id);
      setIsCreatingNew(false);
      updateUrl(newPage.id);
    } catch (error) {
      console.error('Failed to create page:', error);
      // On error, remove the optimistic page and deselect
      useFileStore.getState().removeTempDocument(tempPageId);
      setSelectedPageId(null);
      setIsCreatingNew(false);
    }
  };

  const handleDocumentIdChange = (newId: string) => {
    // When a temp page gets a real ID, update the selected page ID
    setSelectedPageId(newId);
    setIsCreatingNew(false);
    updateUrl(newId);
  };

  const handleRenameOpenChange = (documentId: string, open: boolean) => {
    setRenamingPageId(open ? documentId : null);
  };

  const handleRenameConfirm = async (documentId: string, title: string, emoji?: string) => {
    try {
      await updateDocumentOptimistically(documentId, {
        metadata: {
          emoji,
        },
        title,
      });
    } catch (error) {
      console.error('Failed to rename page:', error);
    } finally {
      setRenamingPageId(null);
    }
  };

  // Show list panel only if loading, has pages, or has search query
  const shouldShowListPanel =
    isDocumentListLoading || filteredPages.length > 0 || searchKeywords.trim() !== '';

  return (
    <div className={styles.container}>
      {/* Left Panel - Documents List */}
      {shouldShowListPanel && (
        <div className={styles.listPanel}>
          <div className={styles.header}>
            <SearchBar
              allowClear
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder={t('searchPagePlaceholder')}
              style={{ flex: 1 }}
              value={searchKeywords}
              variant={'borderless'}
            />
            <ActionIcon
              icon={PlusIcon}
              onClick={handleNewDocument}
              title={t('header.newPageButton')}
            />
          </div>
          <div className={styles.pageList}>
            {isDocumentListLoading ? (
              <DocumentListSkeleton />
            ) : filteredPages.length === 0 ? (
              <div
                style={{ color: 'var(--lobe-text-secondary)', padding: 24, textAlign: 'center' }}
              >
                {searchKeywords.trim() ? t('documentList.noResults') : t('documentList.empty')}
              </div>
            ) : (
              <Virtuoso
                components={{
                  Footer: () => (
                    <Center style={{ paddingBlock: 16 }}>
                      <Text style={{ fontSize: 12 }} type={'secondary'}>
                        {t('documentList.pageCount', { count: filteredPages.length })}
                      </Text>
                    </Center>
                  ),
                }}
                data={filteredPages}
                itemContent={(_index, page) => {
                  const isSelected = selectedPageId === page.id;
                  const isRenaming = renamingPageId === page.id;
                  return (
                    <DocumentListItem
                      document={page}
                      isRenaming={isRenaming}
                      isSelected={isSelected}
                      key={page.id}
                      onDelete={() => {
                        if (selectedPageId === page.id) {
                          setSelectedPageId(null);
                          setIsCreatingNew(false);
                          updateUrl(null);
                        }
                      }}
                      onRenameConfirm={handleRenameConfirm}
                      onRenameOpenChange={handleRenameOpenChange}
                      onSelect={handleDocumentSelect}
                      untitledText={t('documentList.untitled')}
                    />
                  );
                }}
                style={{ height: '100%' }}
              />
            )}
          </div>
        </div>
      )}

      {/* Right Panel - Editor */}
      <div className={styles.editorPanel}>
        {selectedPageId || isCreatingNew ? (
          <PageEditor
            documentId={selectedPageId || undefined}
            knowledgeBaseId={knowledgeBaseId}
            onDelete={() => {
              setSelectedPageId(null);
              setIsCreatingNew(false);
              updateUrl(null);
            }}
            onDocumentIdChange={handleDocumentIdChange}
          />
        ) : (
          <PageExplorerPlaceholder
            hasPages={pages.length > 0}
            knowledgeBaseId={knowledgeBaseId}
            onCreateNewNote={handleNewDocument}
            onNoteCreated={(documentId) => {
              setSelectedPageId(documentId);
              setIsCreatingNew(false);
            }}
          />
        )}
      </div>
    </div>
  );
});

export default DocumentExplorer;
