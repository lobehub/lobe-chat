'use client';

import { Button, Icon, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FilePenLine, PlusIcon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
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
    padding: 16px;
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

  const useFetchFileManage = useFileStore((s) => s.useFetchFileManage);
  const getOptimisticNotes = useFileStore((s) => s.getOptimisticNotes);
  const syncNoteMapWithServer = useFileStore((s) => s.syncNoteMapWithServer);
  const createOptimisticNote = useFileStore((s) => s.createOptimisticNote);

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
  const notes = getOptimisticNotes();

  console.log('notes', notes);

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
          <Button block icon={PlusIcon} onClick={handleNewNote} type="primary">
            {t('header.newNoteButton')}
          </Button>
        </div>
        <div className={styles.noteList}>
          {isLoading ? (
            <NoteListSkeleton />
          ) : notes.length === 0 ? (
            <div style={{ color: 'var(--lobe-text-secondary)', padding: 24, textAlign: 'center' }}>
              {t('notesList.empty')}
            </div>
          ) : (
            notes.map((note) => {
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
