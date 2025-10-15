import { Button, Tooltip } from '@lobehub/ui';
import { Checkbox, Image } from 'antd';
import { createStyles } from 'antd-style';
import { isNull } from 'lodash-es';
import { FileBoxIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { fileManagerSelectors, useFileStore } from '@/store/file';
import { FileListItem } from '@/types/files';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';

import ChunksBadge from '../FileListItem/ChunkTag';
import DropdownMenu from '../FileListItem/DropdownMenu';

// Image file types
const IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// Markdown file types
const MARKDOWN_TYPES = ['text/markdown', 'text/x-markdown'];

// Helper to check if filename ends with .md
const isMarkdownFile = (name: string, fileType?: string) => {
  return (
    name.toLowerCase().endsWith('.md') ||
    name.toLowerCase().endsWith('.markdown') ||
    (fileType && MARKDOWN_TYPES.includes(fileType))
  );
};

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    cursor: pointer;
    position: relative;
    overflow: visible;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
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
    top: 8px;
    left: 8px;
    z-index: 2;
    opacity: 0;
    transition: opacity ${token.motionDurationMid};
  `,
  dropdown: css`
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
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
  content: css`
    position: relative;
  `,
  contentWithPadding: css`
    padding: 12px;
  `,
  iconWrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    background: ${token.colorFillQuaternary};
    border-radius: ${token.borderRadius}px;
    margin-bottom: 12px;
  `,
  imageWrapper: css`
    position: relative;
    width: 100%;
    overflow: hidden;
    background: ${token.colorFillQuaternary};
    border-radius: ${token.borderRadiusLG}px;
    min-height: 120px;

    img {
      width: 100%;
      height: auto;
      display: block;
    }
  `,
  floatingChunkBadge: css`
    position: absolute;
    bottom: 8px;
    right: 8px;
    z-index: 3;
    opacity: 0;
    transition: opacity ${token.motionDurationMid};
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
    padding: 4px 8px;
    box-shadow: ${token.boxShadow};
  `,
  imagePlaceholder: css`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    background: ${token.colorFillQuaternary};
  `,
  markdownPreview: css`
    position: relative;
    width: 100%;
    padding: 16px;
    background: ${token.colorFillQuaternary};
    border-radius: ${token.borderRadiusLG}px;
    min-height: 120px;
    max-height: 300px;
    overflow: hidden;
    font-size: 13px;
    line-height: 1.6;
    color: ${token.colorTextSecondary};
    white-space: pre-wrap;
    word-wrap: break-word;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(to bottom, transparent, ${token.colorFillQuaternary});
      pointer-events: none;
    }
  `,
  markdownLoading: css`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    background: ${token.colorFillQuaternary};
    border-radius: ${token.borderRadiusLG}px;
    color: ${token.colorTextTertiary};
    font-size: 12px;
  `,
  name: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorText};
    margin-bottom: 12px;
    word-break: break-word;
  `,
  actions: css`
    opacity: 0;
    transition: opacity ${token.motionDurationMid};
  `,
}));

interface MasonryFileItemProps extends FileListItem {
  knowledgeBaseId?: string;
  onSelectedChange: (id: string, selected: boolean) => void;
  selected?: boolean;
}

const MasonryFileItem = memo<MasonryFileItemProps>(
  ({
    chunkingError,
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
  }) => {
    const { t } = useTranslation('components');
    const { styles, cx } = useStyles();
    const router = useRouter();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [markdownContent, setMarkdownContent] = useState<string>('');
    const [isLoadingMarkdown, setIsLoadingMarkdown] = useState(false);
    const [isCreatingFileParseTask, parseFiles] = useFileStore((s) => [
      fileManagerSelectors.isCreatingFileParseTask(id)(s),
      s.parseFilesToChunks,
    ]);

    const isSupportedForChunking = !isChunkingUnsupported(fileType);
    const isImage = fileType && IMAGE_TYPES.includes(fileType);
    const isMarkdown = isMarkdownFile(name, fileType);

    // Fetch markdown content
    useEffect(() => {
      if (isMarkdown && url) {
        setIsLoadingMarkdown(true);
        fetch(url)
          .then((res) => res.text())
          .then((text) => {
            // Take first 500 characters for preview
            const preview = text.slice(0, 500);
            setMarkdownContent(preview);
          })
          .catch((error) => {
            console.error('Failed to fetch markdown content:', error);
            setMarkdownContent('');
          })
          .finally(() => {
            setIsLoadingMarkdown(false);
          });
      }
    }, [isMarkdown, url]);

    return (
      <div className={cx(styles.card, selected && styles.selected)}>
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

        <Tooltip title={name}>
          <div
            className={cx(styles.content, !isImage && !isMarkdown && styles.contentWithPadding)}
            onClick={() => {
              router.push(`/files/${id}`);
            }}
          >
            {isImage && url ? (
              <>
                <div className={styles.imageWrapper}>
                  <Image
                    alt={name}
                    fallback={
                      <div className={styles.imagePlaceholder}>
                        <FileIcon fileName={name} fileType={fileType} size={64} />
                      </div>
                    }
                    onLoad={() => setImageLoaded(true)}
                    preview={{
                      src: url,
                    }}
                    src={url}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      opacity: imageLoaded ? 1 : 0,
                      transition: 'opacity 0.3s',
                    }}
                    wrapperStyle={{
                      width: '100%',
                      display: 'block',
                    }}
                  />
                </div>
                {/* Floating chunk badge for images */}
                {!isNull(chunkingStatus) && chunkingStatus && (
                  <div
                    className={cx('floatingChunkBadge', styles.floatingChunkBadge)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ChunksBadge
                      chunkCount={chunkCount}
                      chunkingError={chunkingError}
                      chunkingStatus={chunkingStatus}
                      embeddingError={embeddingError}
                      embeddingStatus={embeddingStatus}
                      finishEmbedding={finishEmbedding}
                      id={id}
                    />
                  </div>
                )}
              </>
            ) : isMarkdown ? (
              <>
                {isLoadingMarkdown ? (
                  <div className={styles.markdownLoading}>Loading preview...</div>
                ) : markdownContent ? (
                  <div className={styles.markdownPreview}>{markdownContent}</div>
                ) : (
                  <div className={styles.iconWrapper}>
                    <FileIcon fileName={name} fileType={fileType} size={64} />
                  </div>
                )}
                {/* Floating chunk badge for markdown files */}
                {!isNull(chunkingStatus) && chunkingStatus && (
                  <div
                    className={cx('floatingChunkBadge', styles.floatingChunkBadge)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ChunksBadge
                      chunkCount={chunkCount}
                      chunkingError={chunkingError}
                      chunkingStatus={chunkingStatus}
                      embeddingError={embeddingError}
                      embeddingStatus={embeddingStatus}
                      finishEmbedding={finishEmbedding}
                      id={id}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.iconWrapper}>
                  <FileIcon fileName={name} fileType={fileType} size={64} />
                </div>
                <div className={styles.name}>{name}</div>
                <Flexbox
                  className="actions"
                  gap={8}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{ minHeight: 32 }}
                >
                  {isCreatingFileParseTask || isNull(chunkingStatus) || !chunkingStatus ? (
                    <Tooltip
                      title={t(
                        isSupportedForChunking
                          ? 'FileManager.actions.chunkingTooltip'
                          : 'FileManager.actions.chunkingUnsupported',
                      )}
                    >
                      <Button
                        block
                        disabled={!isSupportedForChunking}
                        icon={FileBoxIcon}
                        loading={isCreatingFileParseTask}
                        onClick={() => {
                          parseFiles([id]);
                        }}
                        size={'small'}
                        type={'text'}
                      >
                        {t(
                          isCreatingFileParseTask
                            ? 'FileManager.actions.createChunkingTask'
                            : 'FileManager.actions.chunking',
                        )}
                      </Button>
                    </Tooltip>
                  ) : (
                    <ChunksBadge
                      chunkCount={chunkCount}
                      chunkingError={chunkingError}
                      chunkingStatus={chunkingStatus}
                      embeddingError={embeddingError}
                      embeddingStatus={embeddingStatus}
                      finishEmbedding={finishEmbedding}
                      id={id}
                    />
                  )}
                </Flexbox>
              </>
            )}
          </div>
        </Tooltip>
      </div>
    );
  },
);

export default MasonryFileItem;
