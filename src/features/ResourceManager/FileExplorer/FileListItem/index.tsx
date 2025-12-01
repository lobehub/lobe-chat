import { Button, Icon, Tooltip } from '@lobehub/ui';
import { App, Checkbox, Input } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { isNull } from 'lodash-es';
import { FileBoxIcon, FileText, FolderIcon } from 'lucide-react';
import { rgba } from 'polished';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useFolderPath } from '@/app/[variants]/(main)/resource/hooks/useFolderPath';
import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/store';
import FileIcon from '@/components/FileIcon';
import { fileManagerSelectors, useFileStore } from '@/store/file';
import { FileListItem } from '@/types/files';
import { formatSize } from '@/utils/format';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';

import ChunksBadge from './ChunkTag';
import DropdownMenu from './DropdownMenu';

dayjs.extend(relativeTime);

// Helper to extract title from markdown content
const extractTitle = (content: string): string | null => {
  if (!content) return null;

  // Find first markdown header (# title)
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
};

export const FILE_DATE_WIDTH = 160;
export const FILE_SIZE_WIDTH = 140;

const useStyles = createStyles(({ css, token, cx, isDarkMode }) => {
  const hover = css`
    opacity: 0;
  `;
  return {
    checkbox: hover,
    container: css`
      cursor: pointer;
      border-block-end: 1px solid ${isDarkMode ? token.colorSplit : rgba(token.colorSplit, 0.06)};

      &:hover {
        background: ${token.colorFillTertiary};

        .${cx(hover)} {
          opacity: 1;
        }
      }

      .chunk-tag {
        opacity: 1;
      }
    `,

    hover,
    item: css`
      padding-block: 0;
      padding-inline: 0 24px;
      color: ${token.colorTextSecondary};
    `,
    name: css`
      overflow: hidden;
      flex: 1;

      min-width: 0;
      margin-inline-start: 12px;

      color: ${token.colorText};
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
    nameContainer: css`
      overflow: hidden;
      flex: 1;
      min-width: 0;
      max-width: 600px;
    `,
    selected: css`
      background: ${token.colorFillTertiary};

      &:hover {
        background: ${token.colorFillSecondary};
      }
    `,
  };
});

interface FileRenderItemProps extends FileListItem {
  index: number;
  knowledgeBaseId?: string;
  onSelectedChange: (id: string, selected: boolean, shiftKey: boolean, index: number) => void;
  pendingRenameItemId?: string | null;
  selected?: boolean;
  slug?: string | null;
}

const FileRenderItem = memo<FileRenderItemProps>(
  ({
    size,
    chunkingError,
    embeddingError,
    embeddingStatus,
    finishEmbedding,
    chunkCount,
    url,
    name,
    fileType,
    id,
    createdAt,
    selected,
    chunkingStatus,
    onSelectedChange,
    knowledgeBaseId,
    index,
    content,
    metadata,
    sourceType,
    slug,
    pendingRenameItemId,
  }) => {
    const { t } = useTranslation(['components', 'file']);
    const { styles, cx } = useStyles();
    const { message } = App.useApp();
    const navigate = useNavigate();
    const [, setSearchParams] = useSearchParams();
    const { knowledgeBaseId: currentKnowledgeBaseId } = useFolderPath();
    const [isCreatingFileParseTask, parseFiles, renameFolder, setPendingRenameItemId] =
      useFileStore((s) => [
        fileManagerSelectors.isCreatingFileParseTask(id)(s),
        s.parseFilesToChunks,
        s.renameFolder,
        s.setPendingRenameItemId,
      ]);

    const [isRenaming, setIsRenaming] = useState(false);
    const [renamingValue, setRenamingValue] = useState(name);
    const inputRef = useRef<any>(null);

    const isSupportedForChunking = !isChunkingUnsupported(fileType);
    const isNote = sourceType === 'document' || fileType === 'custom/document';
    const isFolder = fileType === 'custom/folder';

    // Extract title and emoji for notes
    const displayTitle = useMemo(() => {
      if (isNote && content) {
        const extractedTitle = extractTitle(content);
        return extractedTitle || name || t('file:documentList.untitled');
      }
      return name;
    }, [isNote, content, name, t]);

    const emoji = isNote ? metadata?.emoji : null;

    const displayTime =
      dayjs().diff(dayjs(createdAt), 'd') < 7
        ? dayjs(createdAt).fromNow()
        : dayjs(createdAt).format('YYYY-MM-DD');

    const handleRenameStart = () => {
      setIsRenaming(true);
      setRenamingValue(name);
      // Focus input after render
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    };

    const setMode = useResourceManagerStore((s) => s.setMode);
    const setCurrentViewItemId = useResourceManagerStore((s) => s.setCurrentViewItemId);

    const handleRenameConfirm = async () => {
      if (!renamingValue.trim()) {
        message.error(t('FileManager.actions.renameError'));
        return;
      }

      if (renamingValue.trim() === name) {
        setIsRenaming(false);
        return;
      }

      try {
        await renameFolder(id, renamingValue.trim());
        message.success(t('FileManager.actions.renameSuccess'));
        setIsRenaming(false);
      } catch (error) {
        console.error('Rename error:', error);
        message.error(t('FileManager.actions.renameError'));
      }
    };

    const handleRenameCancel = () => {
      setIsRenaming(false);
      setRenamingValue(name);
    };

    // Auto-start renaming if this is the pending rename item
    useEffect(() => {
      if (pendingRenameItemId === id && isFolder && !isRenaming) {
        handleRenameStart();
        // Clear the pending rename item after triggering
        setPendingRenameItemId(null);
      }
    }, [pendingRenameItemId, id, isFolder]);

    return (
      <Flexbox
        align={'center'}
        className={cx(styles.container, selected && styles.selected)}
        height={48}
        horizontal
        paddingInline={8}
      >
        <Flexbox
          align={'center'}
          className={styles.item}
          distribution={'space-between'}
          flex={1}
          horizontal
          onClick={() => {
            if (isFolder) {
              // Navigate to folder using slug-based routing (Google Drive style)
              const folderSlug = slug || id;
              const baseKnowledgeBaseId = knowledgeBaseId || currentKnowledgeBaseId;

              if (baseKnowledgeBaseId) {
                navigate(`/resource/library/${baseKnowledgeBaseId}/${folderSlug}`);
              }
            } else if (isNote) {
              setCurrentViewItemId(id);
              setMode('page');
              setSearchParams(
                (prev) => {
                  const newParams = new URLSearchParams(prev);
                  newParams.set('file', id);
                  return newParams;
                },
                { replace: true },
              );
            } else {
              // Set mode to file and store the file ID
              setCurrentViewItemId(id);
              setMode('file');
              // Also update URL query parameter for shareable links
              setSearchParams(
                (prev) => {
                  const newParams = new URLSearchParams(prev);
                  newParams.set('file', id);
                  return newParams;
                },
                { replace: true },
              );
            }
          }}
        >
          <Flexbox align={'center'} className={styles.nameContainer} horizontal>
            <Center
              height={48}
              onClick={(e) => {
                e.stopPropagation();

                onSelectedChange(id, !selected, e.shiftKey, index);
              }}
              style={{ paddingInline: 4 }}
            >
              <Checkbox
                checked={selected}
                className={selected ? '' : styles.hover}
                style={{ borderRadius: '50%' }}
              />
            </Center>
            <Flexbox
              align={'center'}
              justify={'center'}
              style={{ fontSize: 24, marginInline: 8, width: 24 }}
            >
              {isFolder ? (
                <Icon icon={FolderIcon} size={24} />
              ) : isNote ? (
                emoji ? (
                  <span style={{ fontSize: 24 }}>{emoji}</span>
                ) : (
                  <Center height={24} width={24}>
                    <Icon icon={FileText} size={24} />
                  </Center>
                )
              ) : (
                <FileIcon fileName={name} fileType={fileType} size={24} />
              )}
            </Flexbox>
            {isRenaming && isFolder ? (
              <Input
                onBlur={handleRenameConfirm}
                onChange={(e) => setRenamingValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRenameConfirm();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleRenameCancel();
                  }
                }}
                ref={inputRef}
                size="small"
                style={{ flex: 1, maxWidth: 400 }}
                value={renamingValue}
              />
            ) : (
              <span className={styles.name}>{displayTitle}</span>
            )}
          </Flexbox>
          <Flexbox
            align={'center'}
            gap={8}
            horizontal
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {!isFolder &&
              (isCreatingFileParseTask || isNull(chunkingStatus) || !chunkingStatus ? (
                <div className={isCreatingFileParseTask ? undefined : styles.hover}>
                  <Tooltip
                    styles={{
                      root: { pointerEvents: 'none' },
                    }}
                    title={t(
                      isSupportedForChunking
                        ? 'FileManager.actions.chunkingTooltip'
                        : 'FileManager.actions.chunkingUnsupported',
                    )}
                  >
                    <Button
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
                </div>
              ) : (
                <div style={{ cursor: 'default' }}>
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
              ))}
            <div className={styles.hover}>
              <DropdownMenu
                fileType={fileType}
                filename={name}
                id={id}
                knowledgeBaseId={knowledgeBaseId}
                onRenameStart={isFolder ? handleRenameStart : undefined}
                url={url}
              />
            </div>
          </Flexbox>
        </Flexbox>
        <Flexbox className={styles.item} width={FILE_DATE_WIDTH}>
          {displayTime}
        </Flexbox>
        <Flexbox className={styles.item} width={FILE_SIZE_WIDTH}>
          {isFolder ? '-' : formatSize(size)}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default FileRenderItem;
