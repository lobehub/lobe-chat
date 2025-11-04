'use client';

import { ActionIcon, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { PlusIcon } from 'lucide-react';
import markdownToTxt from 'markdown-to-txt';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileStore } from '@/store/file';
import { FileListItem } from '@/types/files';

import NoteActions from './NoteActions';
import NoteEditor from './NoteEditorPanel';
import NoteEmptyStatus from './NoteEmptyStatus';
import NoteListSkeleton from './NoteListSkeleton';

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
  noteActions: css`
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
  noteCard: css`
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

      .note-actions {
        opacity: 1;
      }
    }

    &.selected {
      border-color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
      box-shadow: ${token.boxShadowTertiary};
    }
  `,
  noteContent: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  `,
  noteList: css`
    overflow-y: auto;
    flex: 1;
    padding-block: 4px;
  `,
  notePreview: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;

    font-size: 13px;
    line-height: 1.6;
    color: ${token.colorTextSecondary};
  `,
  noteTitle: css`
    overflow: hidden;

    font-size: 14px;
    font-weight: ${token.fontWeightStrong};
    line-height: 1.4;
    color: ${token.colorText};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

interface DocumentExplorerProps {
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

/**
 * View, edit and create documents.
 */
const DocumentExplorer = memo<DocumentExplorerProps>(({ knowledgeBaseId }) => {
  const { t } = useTranslation('file');
  const { styles, cx } = useStyles();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const useFetchKnowledgeItems = useFileStore((s) => s.useFetchKnowledgeItems);
  const getOptimisticNotes = useFileStore((s) => s.getOptimisticNotes);
  const syncNoteMapWithServer = useFileStore((s) => s.syncNoteMapWithServer);
  const createNote = useFileStore((s) => s.createNote);
  const createOptimisticNote = useFileStore((s) => s.createOptimisticNote);
  const replaceTempNoteWithReal = useFileStore((s) => s.replaceTempNoteWithReal);
  // Subscribe to localNoteMap to trigger re-render when notes are updated
  useFileStore((s) => s.localNoteMap);

  const { data: allFiles, isLoading } = useFetchKnowledgeItems({
    knowledgeBaseId,
  });

  // Sync server data to local note map when it changes
  useEffect(() => {
    if (allFiles) {
      syncNoteMapWithServer(allFiles);
    }
  }, [allFiles, syncNoteMapWithServer]);

  // Get optimistic notes (merged local + server)
  // Filter by knowledgeBaseId if provided
  // Since the API call already filters by knowledgeBaseId, we trust that data
  // But we also need to check local optimistic updates
  // Re-compute when localNoteMap changes to ensure list updates when notes are edited
  const notes = getOptimisticNotes();

  // Filter notes based on search keywords
  const filteredNotes = useMemo(() => {
    if (!searchKeywords.trim()) return notes;

    const lowerKeywords = searchKeywords.toLowerCase();
    return notes.filter((note) => {
      const content = note.content?.toLowerCase() || '';
      const name = note.name?.toLowerCase() || '';
      return content.includes(lowerKeywords) || name.includes(lowerKeywords);
    });
  }, [notes, searchKeywords]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const handleNoteSelect = (noteId: string) => {
    if (selectedNoteId === noteId) {
      // Deselect if clicking the same note
      setSelectedNoteId(null);
    } else {
      setSelectedNoteId(noteId);
    }
    setIsCreatingNew(false);
  };

  const handleNewNote = async () => {
    const untitledTitle = t('notesList.untitled');

    // Create optimistic note immediately for instant UX
    const tempNoteId = createOptimisticNote(untitledTitle);
    setSelectedNoteId(tempNoteId);
    setIsCreatingNew(true);

    try {
      // Create real document in background
      const newDoc = await createNote({
        content: '',
        knowledgeBaseId,
        title: untitledTitle,
      });

      // Convert DocumentItem to FileListItem
      const realNote: FileListItem = {
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

      // Replace optimistic note with real note (smooth UX, no flicker)
      replaceTempNoteWithReal(tempNoteId, realNote);

      // Update selected note ID to real ID
      setSelectedNoteId(newDoc.id);
      setIsCreatingNew(false);
    } catch (error) {
      console.error('Failed to create note:', error);
      // On error, remove the optimistic note and deselect
      useFileStore.getState().removeTempNote(tempNoteId);
      setSelectedNoteId(null);
      setIsCreatingNew(false);
    }
  };

  const handleDocumentIdChange = (newId: string) => {
    // When a temp note gets a real ID, update the selected note ID
    setSelectedNoteId(newId);
    setIsCreatingNew(false);
  };

  return (
    <div className={styles.container}>
      {/* Left Panel - Notes List */}
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
            onClick={handleNewNote}
            // size={'large'}
            title={t('header.newNoteButton')}
          />
        </div>
        <div className={styles.noteList}>
          {isLoading ? (
            <NoteListSkeleton />
          ) : filteredNotes.length === 0 ? (
            <div style={{ color: 'var(--lobe-text-secondary)', padding: 24, textAlign: 'center' }}>
              {searchKeywords.trim() ? t('notesList.noResults') : t('notesList.empty')}
            </div>
          ) : (
            filteredNotes.map((note) => {
              const title = note.name || t('notesList.untitled');
              const previewText = getPreviewText(note);
              const emoji = note.metadata?.emoji;
              return (
                <div
                  className={cx(styles.noteCard, selectedNoteId === note.id && 'selected')}
                  key={note.id}
                  onClick={() => handleNoteSelect(note.id)}
                >
                  <div className={cx(styles.noteActions, 'note-actions')}>
                    <NoteActions
                      noteContent={note.content || undefined}
                      noteId={note.id}
                      onDelete={() => {
                        if (selectedNoteId === note.id) {
                          setSelectedNoteId(null);
                          setIsCreatingNew(false);
                        }
                      }}
                    />
                  </div>
                  <div className={styles.noteContent}>
                    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                      {emoji && <span style={{ fontSize: 20 }}>{emoji}</span>}
                      <div className={styles.noteTitle}>{title}</div>
                    </div>
                    {previewText && <div className={styles.notePreview}>{previewText}</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Editor */}
      <div className={styles.editorPanel}>
        {selectedNoteId || isCreatingNew ? (
          <NoteEditor
            content={selectedNote?.content}
            documentId={selectedNoteId || undefined}
            documentTitle={selectedNote?.name}
            editorData={selectedNote?.editorData}
            emoji={selectedNote?.metadata?.emoji}
            knowledgeBaseId={knowledgeBaseId}
            onDocumentIdChange={handleDocumentIdChange}
          />
        ) : (
          <NoteEmptyStatus
            knowledgeBaseId={knowledgeBaseId}
            onCreateNewNote={handleNewNote}
            onNoteCreated={(noteId) => {
              setSelectedNoteId(noteId);
              setIsCreatingNew(false);
            }}
          />
        )}
      </div>
    </div>
  );
});

export default DocumentExplorer;
