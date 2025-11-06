'use client';

import { ActionIcon, SearchBar, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { PlusIcon } from 'lucide-react';
import markdownToTxt from 'markdown-to-txt';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useFileStore } from '@/store/file';
import { FileListItem } from '@/types/files';

import NoteActions from './DocumentActions';
import DocumentEditor from './DocumentEditor';
import NoteListSkeleton from './DocumentListSkeleton';
import NoteEmptyStatus from './NoteEmptyStatus';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    width: 100%;
    height: 100%;
  `,
  documentActions: css`
    position: absolute;
    z-index: 1;
    inset-block-start: 8px;
    inset-inline-end: 8px;

    padding: 0;
    border-radius: ${token.borderRadiusSM}px;

    opacity: 0;
    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowSecondary};

    transition: opacity ${token.motionDurationMid};
  `,
  documentCard: css`
    cursor: pointer;
    user-select: none;

    position: relative;

    overflow: hidden;

    margin: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    transition: all ${token.motionDurationMid};

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: ${token.boxShadowTertiary};

      .document-actions {
        opacity: 1;
      }
    }

    &.selected {
      border-color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
      box-shadow: ${token.boxShadowTertiary};
    }
  `,
  documentContent: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  `,
  documentList: css`
    overflow-y: auto;
    flex: 1;
    padding-block: 4px;
  `,
  documentPreview: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;

    font-size: 13px;
    line-height: 1.6;
    color: ${token.colorTextSecondary};
  `,
  documentTitle: css`
    overflow: hidden;

    font-size: 14px;
    font-weight: ${token.fontWeightStrong};
    line-height: 1.4;
    color: ${token.colorText};
    text-overflow: ellipsis;
    white-space: nowrap;
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

// Helper to extract title from markdown content
const extractTitle = (content: string): string | null => {
  if (!content) return null;

  // Find first markdown header (# title)
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
};

// Helper to extract preview text from note content
const getPreviewText = (item: FileListItem): string => {
  if (!item.content) return '';

  // Convert markdown to plain text
  let plainText = markdownToTxt(item.content);

  // Remove the title line if it exists
  const title = extractTitle(item.content);
  if (title) {
    plainText = plainText.replace(title, '').trim();
  }

  // Limit to first 200 characters for preview
  return plainText.slice(0, 200);
};

const updateUrl = (docId: string | null) => {
  const newPath = docId ? `/knowledge/${docId}` : '/knowledge/';
  window.history.replaceState({}, '', newPath);
};

/**
 * View, edit and create documents.
 */
const DocumentExplorer = memo<DocumentExplorerProps>(({ knowledgeBaseId, documentId }) => {
  const { t } = useTranslation('file');
  const { styles, cx } = useStyles();

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);
  const getOptimisticDocuments = useFileStore((s) => s.getOptimisticDocuments);
  const syncDocumentMapWithServer = useFileStore((s) => s.syncDocumentMapWithServer);
  const createDocument = useFileStore((s) => s.createDocument);
  const createOptimisticDocument = useFileStore((s) => s.createOptimisticDocument);
  const replaceTempDocumentWithReal = useFileStore((s) => s.replaceTempDocumentWithReal);
  // Subscribe to localDocumentMap to trigger re-render when documents are updated
  useFileStore((s) => s.localDocumentMap);

  const { data: allFiles, isLoading } = useFetchKnowledgeItems({
    knowledgeBaseId,
  });

  // Sync server data to local document map when it changes
  useEffect(() => {
    if (allFiles) {
      syncDocumentMapWithServer(allFiles);
    }
  }, [allFiles, syncDocumentMapWithServer]);

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
        const name = document.name?.toLowerCase() || '';
        return content.includes(lowerKeywords) || name.includes(lowerKeywords);
      });
    }

    // Sort by creation date (newest first)
    return result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [documents, searchKeywords]);

  const selectedDocument = documents.find((document) => document.id === selectedDocumentId);

  const handleDocumentSelect = (documentId: string) => {
    if (selectedDocumentId === documentId) {
      // Deselect if clicking the same document
      setSelectedDocumentId(null);
    } else {
      setSelectedDocumentId(documentId);
      updateUrl(documentId);
    }
    setIsCreatingNew(false);
  };

  const handleNewDocument = async () => {
    const untitledTitle = t('notesList.untitled');

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

      // Convert DocumentItem to FileListItem
      const realDocument: FileListItem = {
        chunkCount: null,
        chunkingError: null,
        chunkingStatus: null,
        content: newDoc.content || '',
        createdAt: newDoc.createdAt ? new Date(newDoc.createdAt) : new Date(),
        editorData:
          typeof newDoc.editorData === 'string'
            ? JSON.parse(newDoc.editorData)
            : newDoc.editorData || null,
        embeddingError: null,
        embeddingStatus: null,
        fileType: 'custom/note',
        finishEmbedding: false,
        id: newDoc.id,
        metadata: newDoc.metadata as any,
        name: newDoc.title || untitledTitle,
        size: newDoc.content?.length || 0,
        sourceType: 'document',
        updatedAt: newDoc.updatedAt ? new Date(newDoc.updatedAt) : new Date(),
        url: '',
      };

      // Replace optimistic document with real document (smooth UX, no flicker)
      replaceTempDocumentWithReal(tempDocumentId, realDocument);

      // Update selected document ID to real ID
      setSelectedDocumentId(newDoc.id);
      setIsCreatingNew(false);
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

  return (
    <div className={styles.container}>
      {/* Left Panel - Documents List */}
      <div className={styles.listPanel}>
        <div className={styles.header}>
          <SearchBar
            allowClear
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder={t('searchFilePlaceholder')}
            style={{ flex: 1 }}
            value={searchKeywords}
            variant={'borderless'}
          />
          <ActionIcon
            icon={PlusIcon}
            onClick={handleNewDocument}
            // size={'large'}
            title={t('header.newNoteButton')}
          />
        </div>
        <div className={styles.documentList}>
          {isLoading ? (
            <NoteListSkeleton />
          ) : filteredDocuments.length === 0 ? (
            <div style={{ color: 'var(--lobe-text-secondary)', padding: 24, textAlign: 'center' }}>
              {searchKeywords.trim() ? t('notesList.noResults') : t('notesList.empty')}
            </div>
          ) : (
            <Virtuoso
              components={{
                Footer: () => (
                  <Center style={{ paddingBlock: 16 }}>
                    <Text style={{ fontSize: 12 }} type={'secondary'}>
                      {t('notesList.documentCount', { count: filteredDocuments.length })}
                    </Text>
                  </Center>
                ),
              }}
              data={filteredDocuments}
              itemContent={(_index, document) => {
                const title = document.name || t('notesList.untitled');
                const previewText = getPreviewText(document);
                const emoji = document.metadata?.emoji;
                return (
                  <div
                    className={cx(
                      styles.documentCard,
                      selectedDocumentId === document.id && 'selected',
                    )}
                    key={document.id}
                    onClick={() => handleDocumentSelect(document.id)}
                  >
                    <div className={cx(styles.documentActions, 'document-actions')}>
                      <NoteActions
                        documentContent={document.content || undefined}
                        documentId={document.id}
                        onDelete={() => {
                          if (selectedDocumentId === document.id) {
                            setSelectedDocumentId(null);
                            setIsCreatingNew(false);
                          }
                        }}
                      />
                    </div>
                    <div className={styles.documentContent}>
                      <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                        {emoji && <span style={{ fontSize: 20 }}>{emoji}</span>}
                        <div className={styles.documentTitle}>{title}</div>
                      </div>
                      {previewText && <div className={styles.documentPreview}>{previewText}</div>}
                    </div>
                  </div>
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
            content={selectedDocument?.content}
            documentId={selectedDocumentId || undefined}
            documentTitle={selectedDocument?.name}
            editorData={selectedDocument?.editorData}
            emoji={selectedDocument?.metadata?.emoji}
            knowledgeBaseId={knowledgeBaseId}
            onDocumentIdChange={handleDocumentIdChange}
          />
        ) : (
          <NoteEmptyStatus
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
