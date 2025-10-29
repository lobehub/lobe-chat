'use client';

import { Button, Icon, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { FilePenLine, PlusIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';
import { FileListItem } from '@/types/files';

import NoteEditorPanel from './NoteEditorPanel';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    display: flex;
    height: 100%;
    width: 100%;
  `,
  emptyState: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${token.colorTextDescription};
    gap: 16px;
  `,
  listPanel: css`
    width: 280px;
    min-width: 280px;
    border-right: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    display: flex;
    flex-direction: column;
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
    }

    &.selected {
      border-color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
      box-shadow: ${token.boxShadowTertiary};
    }
  `,
  noteList: css`
    flex: 1;
    overflow-y: auto;
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

    article {
      font-size: 13px;
      line-height: 1.6;

      h1, h2, h3, h4, h5, h6 {
        margin-block-start: 8px;
        margin-block-end: 4px;
        font-size: 14px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
      }

      p {
        margin-block-end: 8px;
      }

      ul, ol {
        margin-block-end: 8px;
        padding-inline-start: 20px;
      }

      code {
        padding: 2px 4px;
        border-radius: 3px;
        background: ${token.colorFillTertiary};
        font-size: 12px;
      }
    }

    &::after {
      pointer-events: none;
      content: '';
      position: absolute;
      inset-block-end: 0;
      inset-inline: 0;
      height: 40px;
      background: linear-gradient(to bottom, transparent, ${token.colorFillQuaternary});
    }
  `,
  editorPanel: css`
    flex: 1;
    background: ${token.colorBgContainer};
    overflow: hidden;
  `,
  header: css`
    padding: 16px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
  `,
}));

interface NoteSplitViewProps {
  knowledgeBaseId?: string;
}

const NoteSplitView = memo<NoteSplitViewProps>(({ knowledgeBaseId }) => {
  const { t } = useTranslation('file');
  const { styles, cx } = useStyles();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const useFetchFileManage = useFileStore((s) => s.useFetchFileManage);
  const { data: allFiles } = useFetchFileManage({
    knowledgeBaseId,
  });

  // Filter only notes (custom/note type)
  const notes = (allFiles || []).filter((file) => file.fileType === 'custom/note');

  const selectedNote = notes.find((note) => note.id === selectedNoteId);

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    setIsCreatingNew(false);
  };

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setIsCreatingNew(true);
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(null);
    setIsCreatingNew(false);
  };

  const handleSaveNote = () => {
    // After save, close the editor
    handleCloseEditor();
  };

  // Helper to extract preview text from note content
  const getPreviewText = (item: FileListItem): string => {
    try {
      if (item.editorData && typeof item.editorData === 'object') {
        const editorData = item.editorData;
        if (editorData.root?.children) {
          const extractFromNode = (node: any): string => {
            if (node.text) return node.text;
            if (node.children && Array.isArray(node.children)) {
              return node.children.map((child: any) => extractFromNode(child)).join('');
            }
            return '';
          };
          return editorData.root.children
            .map((node: any) => extractFromNode(node))
            .join(' ')
            .slice(0, 60);
        }
      }
    } catch {
      // Fallback to empty preview
    }
    return '';
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
          {notes.length === 0 ? (
            <Flexbox padding={24} style={{ color: 'var(--lobe-text-secondary)', textAlign: 'center' }}>
              {t('notesList.empty')}
            </Flexbox>
          ) : (
            notes.map((note) => {
              const previewText = getPreviewText(note);
              return (
                <div
                  className={cx(
                    styles.noteCard,
                    selectedNoteId === note.id && 'selected',
                  )}
                  key={note.id}
                  onClick={() => handleNoteSelect(note.id)}
                >
                  {previewText ? (
                    <div className={styles.notePreview}>
                      <Markdown fontSize={12} headerMultiple={0.15} marginMultiple={0.5}>
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
            onClose={handleCloseEditor}
            onSave={handleSaveNote}
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
