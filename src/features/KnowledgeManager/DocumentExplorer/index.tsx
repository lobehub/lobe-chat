'use client';

import { ActionIcon, Icon, SearchBar, Text } from '@lobehub/ui';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { FileText, PlusIcon } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useFileStore } from '@/store/file';
import { FileListItem } from '@/types/files';

import NoteActions from './DocumentActions';
import DocumentEditor from './DocumentEditor';
import DocumentEditorPlaceholder from './DocumentEditorPlaceholder';
import NoteListSkeleton from './DocumentListSkeleton';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    width: 100%;
    height: 100%;
  `,
  documentActions: css`
    display: flex;
    align-items: center;

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

    display: flex;
    gap: 12px;
    align-items: center;

    min-height: 36px;
    margin-block: 4px;
    margin-inline: 8px;
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;

    color: ${token.colorTextSecondary};

    background: transparent;

    transition: all ${token.motionDurationMid};

    &:hover {
      background: ${token.colorFillTertiary};

      .document-actions {
        opacity: 1;
      }
    }

    &.selected {
      color: ${token.colorText};
      background: ${token.colorFillSecondary};
    }
  `,
  documentContent: css`
    display: flex;
    flex: 1;
    gap: 12px;
    align-items: center;

    min-width: 0;
  `,
  documentList: css`
    overflow-y: auto;
    flex: 1;
    padding-block: 4px;
  `,
  documentTitle: css`
    overflow: hidden;
    flex: 1;

    min-width: 0;

    font-size: 14px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  editorPanel: css`
    overflow: hidden;
    flex: 1;
    background: ${token.colorBgContainer};
  `,
  emoji: css`
    font-size: 16px;
    line-height: 1;
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
  icon: css`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${token.colorTextSecondary};
  `,
  listPanel: css`
    display: flex;
    flex-direction: column;

    width: 280px;
    min-width: 280px;
    border-inline-end: 1px solid ${token.colorBorderSecondary};

    background: ${token.colorBgContainer};
  `,
  renameInput: css`
    flex: 1;
    min-width: 0;
    height: 20px;
    padding: 0;

    input {
      height: 20px;
      padding: 0;
      border: none;

      font-size: 14px;
      line-height: 20px;

      background: transparent;
      box-shadow: none !important;

      &:focus {
        border: none;
        box-shadow: none !important;
      }
    }
  `,
}));

interface DocumentExplorerProps {
  documentId?: string;
  knowledgeBaseId?: string;
}

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
  const [renamingDocumentId, setRenamingDocumentId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const renameInputRef = useRef<any>(null);

  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);
  const getOptimisticDocuments = useFileStore((s) => s.getOptimisticDocuments);
  const syncDocumentMapWithServer = useFileStore((s) => s.syncDocumentMapWithServer);
  const createDocument = useFileStore((s) => s.createDocument);
  const createOptimisticDocument = useFileStore((s) => s.createOptimisticDocument);
  const replaceTempDocumentWithReal = useFileStore((s) => s.replaceTempDocumentWithReal);
  const updateDocumentOptimistically = useFileStore((s) => s.updateDocumentOptimistically);
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

  const handleStartRename = (documentId: string, currentName: string) => {
    setRenamingDocumentId(documentId);
    setRenameValue(currentName);
    // Focus the input after state update
    setTimeout(() => {
      renameInputRef.current?.select();
    }, 0);
  };

  const handleRenameSubmit = async () => {
    if (!renamingDocumentId || !renameValue.trim()) {
      setRenamingDocumentId(null);
      return;
    }

    try {
      await updateDocumentOptimistically(renamingDocumentId, { name: renameValue.trim() });
    } catch (error) {
      console.error('Failed to rename document:', error);
    } finally {
      setRenamingDocumentId(null);
    }
  };

  const handleRenameCancel = () => {
    setRenamingDocumentId(null);
    setRenameValue('');
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
              {searchKeywords.trim() ? t('documentList.noResults') : t('documentList.empty')}
            </div>
          ) : (
            <Virtuoso
              components={{
                Footer: () => (
                  <Center style={{ paddingBlock: 16 }}>
                    <Text style={{ fontSize: 12 }} type={'secondary'}>
                      {t('documentList.documentCount', { count: filteredDocuments.length })}
                    </Text>
                  </Center>
                ),
              }}
              data={filteredDocuments}
              itemContent={(_index, document) => {
                const title = document.name || t('documentList.untitled');
                const emoji = document.metadata?.emoji;
                const isSelected = selectedDocumentId === document.id;
                const isRenaming = renamingDocumentId === document.id;
                return (
                  <div
                    className={cx(styles.documentCard, isSelected && 'selected')}
                    key={document.id}
                    onClick={() => !isRenaming && handleDocumentSelect(document.id)}
                  >
                    <div className={styles.documentContent}>
                      {emoji ? (
                        <span className={styles.emoji}>{emoji}</span>
                      ) : (
                        <Icon className={styles.icon} icon={FileText} size={16} />
                      )}
                      {isRenaming ? (
                        <Input
                          autoFocus
                          className={styles.renameInput}
                          onBlur={handleRenameSubmit}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameSubmit();
                            } else if (e.key === 'Escape') {
                              handleRenameCancel();
                            }
                          }}
                          onPressEnter={handleRenameSubmit}
                          ref={renameInputRef}
                          value={renameValue}
                        />
                      ) : (
                        <div className={styles.documentTitle}>{title}</div>
                      )}
                    </div>
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
                        onRename={() => handleStartRename(document.id, title)}
                      />
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
