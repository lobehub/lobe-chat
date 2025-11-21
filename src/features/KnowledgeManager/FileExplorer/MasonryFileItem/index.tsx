import { Checkbox } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo, useEffect, useRef, useState } from 'react';

import { documentService } from '@/services/document';
import { FileListItem } from '@/types/files';

import NoteEditorModal from '../../DocumentExplorer/NoteEditorModal';
import DropdownMenu from '../FileListItem/DropdownMenu';
import DefaultFileItem from './DefaultFileItem';
import ImageFileItem from './ImageFileItem';
import MarkdownFileItem from './MarkdownFileItem';
import NoteFileItem from './NoteFileItem';

// Image file types
const IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

// Markdown file types
const MARKDOWN_TYPES = new Set(['text/markdown', 'text/x-markdown']);

// Custom note file type
const CUSTOM_NOTE_TYPE = 'custom/document';

// Helper to check if filename ends with .md or is a custom note
const isMarkdownFile = (name: string, fileType?: string) => {
  return (
    name.toLowerCase().endsWith('.md') ||
    name.toLowerCase().endsWith('.markdown') ||
    (fileType && MARKDOWN_TYPES.has(fileType))
  );
};

// Helper to check if it's a custom note that should be rendered
const isCustomNote = (fileType?: string) => {
  return fileType === CUSTOM_NOTE_TYPE;
};

// Helper function to extract text from editor's JSON format for preview
const extractTextFromEditorJSON = (editorData: any): string => {
  if (!editorData || !editorData.root || !editorData.root.children) {
    return '';
  }

  const extractFromNode = (node: any): string => {
    if (!node) return '';

    // If node has text, return it
    if (node.text) return node.text;

    // If node has children, recursively extract text
    if (node.children && Array.isArray(node.children)) {
      return node.children.map((child: any) => extractFromNode(child)).join('');
    }

    return '';
  };

  return editorData.root.children.map((node: any) => extractFromNode(node)).join('\n');
};

const useStyles = createStyles(({ css, token }) => ({
  actions: css`
    opacity: 0;
    transition: opacity ${token.motionDurationMid};
  `,
  card: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    transition: all ${token.motionDurationMid};

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: ${token.boxShadowTertiary};

      .actions {
        opacity: 1;
      }

      .checkbox {
        opacity: 1;
      }

      .dropdown {
        opacity: 1;
      }

      .floatingChunkBadge {
        opacity: 1;
      }
    }
  `,
  checkbox: css`
    position: absolute;
    z-index: 2;
    inset-block-start: 8px;
    inset-inline-start: 8px;

    opacity: 0;

    transition: opacity ${token.motionDurationMid};
  `,
  content: css`
    position: relative;
  `,
  contentWithPadding: css`
    padding: 12px;
  `,
  dropdown: css`
    position: absolute;
    z-index: 2;
    inset-block-start: 8px;
    inset-inline-end: 8px;

    opacity: 0;

    transition: opacity ${token.motionDurationMid};
  `,
  selected: css`
    border-color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};

    .checkbox {
      opacity: 1;
    }
  `,
}));

interface MasonryFileItemProps extends FileListItem {
  knowledgeBaseId?: string;
  onOpen: (id: string) => void;
  onSelectedChange: (id: string, selected: boolean) => void;
  selected?: boolean;
}

const MasonryFileItem = memo<MasonryFileItemProps>(
  ({
    chunkingError,
    editorData,
    embeddingError,
    embeddingStatus,
    finishEmbedding,
    chunkCount,
    url,
    name,
    fileType,
    id,
    selected,
    chunkingStatus,
    onSelectedChange,
    knowledgeBaseId,
    size,
    onOpen,
    metadata,
  }) => {
    const { styles, cx } = useStyles();
    const [markdownContent, setMarkdownContent] = useState<string>('');
    const [isLoadingMarkdown, setIsLoadingMarkdown] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    const isImage = fileType && IMAGE_TYPES.has(fileType);
    const isMarkdown = isMarkdownFile(name, fileType);
    const isNote = isCustomNote(fileType);

    const cardRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    // Use Intersection Observer to detect when card enters viewport
    useEffect(() => {
      if (!cardRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isInView) {
              setIsInView(true);
            }
          });
        },
        {
          rootMargin: '200px', // Increased margin to load content earlier
          threshold: 0.01, // Lower threshold for earlier triggering
        },
      );

      observer.observe(cardRef.current);

      return () => {
        observer.disconnect();
      };
    }, [isInView]);

    // Fetch markdown content only when in viewport
    useEffect(() => {
      if ((isMarkdown || isNote) && isInView && !markdownContent) {
        setIsLoadingMarkdown(true);

        const fetchContent = async () => {
          try {
            let text: string;

            if (isNote) {
              // For custom notes, fetch from document service
              const document = await documentService.getDocumentById(id);
              const content = document?.content || '';

              // Try to parse as JSON (editor's native format) and convert to markdown for preview
              try {
                const editorData = JSON.parse(content);
                // Since we can't easily convert JSON to markdown here without an editor instance,
                // we'll extract plain text from the JSON structure for preview
                text = extractTextFromEditorJSON(editorData);
              } catch {
                // If it's not JSON, use it as-is (might be old markdown format)
                text = content;
              }
            } else if (url) {
              // For regular markdown files, fetch from URL
              const res = await fetch(url);
              text = await res.text();
            } else {
              text = '';
            }

            // For custom notes, take more content for better preview; for regular markdown, take first 500 chars
            const preview = isNote ? text.slice(0, 1000) : text.slice(0, 500);
            setMarkdownContent(preview);
          } catch (error) {
            console.error('Failed to fetch markdown content:', error);
            setMarkdownContent('');
          } finally {
            setIsLoadingMarkdown(false);
          }
        };

        fetchContent();
      }
    }, [isMarkdown, isNote, url, isInView, markdownContent, id]);

    return (
      <div className={cx(styles.card, selected && styles.selected)} ref={cardRef}>
        <div
          className={cx('checkbox', styles.checkbox)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectedChange(id, !selected);
          }}
        >
          <Checkbox checked={selected} />
        </div>

        <div className={cx('dropdown', styles.dropdown)} onClick={(e) => e.stopPropagation()}>
          <DropdownMenu filename={name} id={id} knowledgeBaseId={knowledgeBaseId} url={url} />
        </div>

        <div
          className={cx(
            styles.content,
            !isImage && !isMarkdown && !isNote && styles.contentWithPadding,
          )}
          onClick={() => {
            if (isNote) {
              setIsNoteModalOpen(true);
            } else {
              onOpen(id);
            }
          }}
        >
          {(() => {
            switch (true) {
              case isImage && !!url: {
                return (
                  <ImageFileItem
                    chunkCount={chunkCount ?? undefined}
                    chunkingError={chunkingError}
                    chunkingStatus={chunkingStatus ?? undefined}
                    embeddingError={embeddingError}
                    embeddingStatus={embeddingStatus ?? undefined}
                    fileType={fileType}
                    finishEmbedding={finishEmbedding}
                    id={id}
                    isInView={isInView}
                    name={name}
                    size={size}
                    url={url}
                  />
                );
              }
              case isNote: {
                return (
                  <NoteFileItem
                    chunkCount={chunkCount ?? undefined}
                    chunkingError={chunkingError}
                    chunkingStatus={chunkingStatus ?? undefined}
                    embeddingError={embeddingError}
                    embeddingStatus={embeddingStatus ?? undefined}
                    fileType={fileType}
                    finishEmbedding={finishEmbedding}
                    id={id}
                    isLoadingMarkdown={isLoadingMarkdown}
                    markdownContent={markdownContent}
                    metadata={metadata}
                    name={name}
                  />
                );
              }
              case isMarkdown: {
                return (
                  <MarkdownFileItem
                    chunkCount={chunkCount ?? undefined}
                    chunkingError={chunkingError}
                    chunkingStatus={chunkingStatus ?? undefined}
                    embeddingError={embeddingError}
                    embeddingStatus={embeddingStatus ?? undefined}
                    fileType={fileType}
                    finishEmbedding={finishEmbedding}
                    id={id}
                    isLoadingMarkdown={isLoadingMarkdown}
                    markdownContent={markdownContent}
                    name={name}
                    size={size}
                  />
                );
              }
              default: {
                return (
                  <DefaultFileItem
                    chunkCount={chunkCount ?? undefined}
                    chunkingError={chunkingError}
                    chunkingStatus={chunkingStatus ?? undefined}
                    embeddingError={embeddingError}
                    embeddingStatus={embeddingStatus ?? undefined}
                    fileType={fileType}
                    finishEmbedding={finishEmbedding}
                    id={id}
                    name={name}
                    size={size}
                  />
                );
              }
            }
          })()}
        </div>

        {/* Note Editor Modal */}
        {isNote && (
          <NoteEditorModal
            documentId={id}
            documentTitle={name}
            editorData={editorData}
            knowledgeBaseId={knowledgeBaseId}
            onClose={() => {
              setIsNoteModalOpen(false);
            }}
            open={isNoteModalOpen}
          />
        )}
      </div>
    );
  },
);

export default MasonryFileItem;
