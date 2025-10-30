'use client';

import { ActionIcon, Icon, Markdown, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FilePenLine, PlusIcon } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileStore } from '@/store/file';
import { FileListItem } from '@/types/files';

import NoteActions from './NoteActions';
import NoteEditorPanel from './NoteEditorPanel';
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
  emptyState: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;

    height: 100%;

    color: ${token.colorTextDescription};
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

    opacity: 0;

    transition: opacity ${token.motionDurationMid};
  `,
  noteCard: css`
    cursor: pointer;

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
  noteList: css`
    overflow-y: auto;
    flex: 1;
    padding-block: 4px;
  `,
  notePreview: css`
    position: relative;

    overflow: hidden;

    min-height: 100px;
    max-height: 200px;
    padding: 12px;

    font-size: 13px;
    line-height: 1.6;
    color: ${token.colorTextSecondary};
    word-wrap: break-word;
    white-space: pre-wrap;

    background: ${token.colorFillQuaternary};

    &::after {
      pointer-events: none;
      content: '';

      position: absolute;
      inset-block-end: 0;
      inset-inline: 0;

      height: 40px;

      background: linear-gradient(to bottom, transparent, ${token.colorFillQuaternary});
    }

    article {
      font-size: 13px;
      line-height: 1.6;

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-block: 8px 4px;
        font-size: 14px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }

      p {
        margin-block-end: 8px;
      }

      ul,
      ol {
        margin-block-end: 8px;
        padding-inline-start: 20px;
      }

      code {
        padding-block: 2px;
        padding-inline: 4px;
        border-radius: 3px;

        font-size: 12px;

        background: ${token.colorFillTertiary};
      }
    }
  `,
}));

interface NoteSplitViewProps {
  knowledgeBaseId?: string;
}

// Helper to extract preview text from note content
const getPreviewText = (item: FileListItem): string => {
  // Use the content field directly (markdown text from documents table)
  if (item.content) {
    // Limit to first 200 characters for preview
    return item.content.slice(0, 200);
  }
  return '';
};

const NoteSplitView = memo<NoteSplitViewProps>(({ knowledgeBaseId }) => {
  const { t } = useTranslation('file');
  const { styles, cx } = useStyles();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const useFetchFileManage = useFileStore((s) => s.useFetchFileManage);
  const getOptimisticNotes = useFileStore((s) => s.getOptimisticNotes);
  const syncNoteMapWithServer = useFileStore((s) => s.syncNoteMapWithServer);
  const createOptimisticNote = useFileStore((s) => s.createOptimisticNote);
  // Subscribe to localNoteMap to trigger re-render when notes are updated
  useFileStore((s) => s.localNoteMap);

  const { data: allFiles, isLoading } = useFetchFileManage({
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
    setSelectedNoteId(noteId);
    setIsCreatingNew(false);
  };

  const handleNewNote = () => {
    // Create optimistic note immediately
    const newNoteId = createOptimisticNote();
    setSelectedNoteId(newNoteId);
    setIsCreatingNew(true);
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
              const previewText = getPreviewText(note);
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
                  {previewText ? (
                    <div className={styles.notePreview}>
                      <Markdown fontSize={12} headerMultiple={0.1} marginMultiple={0.5}>
                        {previewText}
                      </Markdown>
                    </div>
                  ) : (
                    <div className={styles.notePreview}>
                      <div style={{ color: 'var(--lobe-text-tertiary)', fontStyle: 'italic' }}>
                        No content
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Editor */}
      <div className={styles.editorPanel}>
        {selectedNoteId || isCreatingNew ? (
          <NoteEditorPanel
            documentId={selectedNoteId || undefined}
            documentTitle={selectedNote?.name}
            editorData={selectedNote?.editorData}
            knowledgeBaseId={knowledgeBaseId}
            onDocumentIdChange={handleDocumentIdChange}
          />
        ) : (
          <div className={styles.emptyState}>
            <Icon icon={FilePenLine} size={48} />
            <div style={{ fontSize: 16 }}>{t('notesList.selectNote')}</div>
          </div>
        )}
      </div>
    </div>
  );
});

export default NoteSplitView;
