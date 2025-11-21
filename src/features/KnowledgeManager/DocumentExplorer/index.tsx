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

import DocumentEditor from './DocumentEditor';
import DocumentEditorPlaceholder from './DocumentEditorPlaceholder';
import DocumentListItem from './DocumentListItem';
import DocumentListSkeleton from './DocumentListSkeleton';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    width: 100%;
    height: 100%;
  `,
  documentList: css`
    overflow-y: auto;
    flex: 1;
    padding-block: 4px;
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

    background: ${token.colorBgContainer};
  `,
  listPanel: css`
    display: flex;
    flex-direction: column;

    width: 280px;
    min-width: 280px;
    border-inline-end: 1px solid ${token.colorBorderSecondary};

    background: ${token.colorBgContainer};
  `,
}));

interface DocumentExplorerProps {
  documentId?: string;
  knowledgeBaseId?: string;
}

const updateUrl = (docId: string | null) => {
  const newPath = docId ? `/knowledge/${docId}` : '/knowledge';
  window.history.replaceState({}, '', newPath);
};

/**
 * View, edit and create documents.
 */
const DocumentExplorer = memo<DocumentExplorerProps>(({ knowledgeBaseId, documentId }) => {
  const { t } = useTranslation('file');
  const { styles } = useStyles();

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [renamingDocumentId, setRenamingDocumentId] = useState<string | null>(null);

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

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // If documentId is provided, automatically open that document
  useEffect(() => {
    if (documentId) {
      setSelectedDocumentId(documentId);
      setIsCreatingNew(false);
    }
  }, [documentId]);

  // Get optimistic documents (merged local + server)
  // Filter by knowledgeBaseId if provided
  // Since the API call already filters by knowledgeBaseId, we trust that data
  // But we also need to check local optimistic updates
  // Re-compute when localDocumentMap changes to ensure list updates when documents are edited
  const documents = getOptimisticDocuments();

  // Filter documents based on search keywords and sort by creation date (newest first)
  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Filter by search keywords
    if (searchKeywords.trim()) {
      const lowerKeywords = searchKeywords.toLowerCase();
      result = documents.filter((document) => {
        const content = document.content?.toLowerCase() || '';
        const title = document.title?.toLowerCase() || '';
        return content.includes(lowerKeywords) || title.includes(lowerKeywords);
      });
    }

    // Sort by creation date (newest first)
    return result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [documents, searchKeywords]);

  const handleDocumentSelect = (documentId: string) => {
    if (selectedDocumentId === documentId) {
      // Deselect if clicking the same document
      setSelectedDocumentId(null);
      updateUrl(null);
    } else {
      setSelectedDocumentId(documentId);
      updateUrl(documentId);
    }
    setIsCreatingNew(false);
  };

  const handleNewDocument = async () => {
    const untitledTitle = t('documentList.untitled');

    // Create optimistic document immediately for instant UX
    const tempDocumentId = createOptimisticDocument(untitledTitle);
    setSelectedDocumentId(tempDocumentId);
    setIsCreatingNew(true);

    try {
      // Create real document in background
      const newDoc = await createDocument({
        content: '',
        knowledgeBaseId,
        title: untitledTitle,
      });

      // Convert DocumentItem to EditorDocument
      const realDocument: LobeDocument = {
        content: newDoc.content || '',
        createdAt: newDoc.createdAt ? new Date(newDoc.createdAt) : new Date(),
        editorData:
          typeof newDoc.editorData === 'string'
            ? JSON.parse(newDoc.editorData)
            : newDoc.editorData || null,
        fileType: 'custom/document',
        filename: newDoc.title || untitledTitle,
        id: newDoc.id,
        metadata: newDoc.metadata || {},
        source: 'document',
        sourceType: DocumentSourceType.EDITOR,
        title: newDoc.title || untitledTitle,
        totalCharCount: newDoc.content?.length || 0,
        totalLineCount: 0,
        updatedAt: newDoc.updatedAt ? new Date(newDoc.updatedAt) : new Date(),
      };

      // Replace optimistic document with real document (smooth UX, no flicker)
      replaceTempDocumentWithReal(tempDocumentId, realDocument);

      // Update selected document ID to real ID and update URL
      setSelectedDocumentId(newDoc.id);
      setIsCreatingNew(false);
      updateUrl(newDoc.id);
    } catch (error) {
      console.error('Failed to create document:', error);
      // On error, remove the optimistic document and deselect
      useFileStore.getState().removeTempDocument(tempDocumentId);
      setSelectedDocumentId(null);
      setIsCreatingNew(false);
    }
  };

  const handleDocumentIdChange = (newId: string) => {
    // When a temp document gets a real ID, update the selected document ID
    setSelectedDocumentId(newId);
    setIsCreatingNew(false);
    updateUrl(newId);
  };

  const handleRenameOpenChange = (documentId: string, open: boolean) => {
    setRenamingDocumentId(open ? documentId : null);
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
      console.error('Failed to rename document:', error);
    } finally {
      setRenamingDocumentId(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Panel - Documents List */}
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
        <div className={styles.documentList}>
          {isDocumentListLoading ? (
            <DocumentListSkeleton />
          ) : filteredDocuments.length === 0 ? (
            <div style={{ color: 'var(--lobe-text-secondary)', padding: 24, textAlign: 'center' }}>
              {searchKeywords.trim() ? t('documentList.noResults') : t('documentList.empty')}
            </div>
          ) : (
            <Virtuoso
              components={{
                Footer: () => (
                  <Center style={{ paddingBlock: 16 }}>
                    <Text style={{ fontSize: 12 }} type={'secondary'}>
                      {t('documentList.pageCount', { count: filteredDocuments.length })}
                    </Text>
                  </Center>
                ),
              }}
              data={filteredDocuments}
              itemContent={(_index, document) => {
                const isSelected = selectedDocumentId === document.id;
                const isRenaming = renamingDocumentId === document.id;
                return (
                  <DocumentListItem
                    document={document}
                    isRenaming={isRenaming}
                    isSelected={isSelected}
                    key={document.id}
                    onDelete={() => {
                      if (selectedDocumentId === document.id) {
                        setSelectedDocumentId(null);
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

      {/* Right Panel - Editor */}
      <div className={styles.editorPanel}>
        {selectedDocumentId || isCreatingNew ? (
          <DocumentEditor
            documentId={selectedDocumentId || undefined}
            knowledgeBaseId={knowledgeBaseId}
            onDelete={() => {
              setSelectedDocumentId(null);
              setIsCreatingNew(false);
              updateUrl(null);
            }}
            onDocumentIdChange={handleDocumentIdChange}
          />
        ) : (
          <DocumentEditorPlaceholder
            knowledgeBaseId={knowledgeBaseId}
            onCreateNewNote={handleNewDocument}
            onNoteCreated={(documentId) => {
              setSelectedDocumentId(documentId);
              setIsCreatingNew(false);
            }}
          />
        )}
      </div>
    </div>
  );
});

export default DocumentExplorer;
