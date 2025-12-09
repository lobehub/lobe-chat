import { Button, Icon, Tooltip } from '@lobehub/ui';
import { Checkbox } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { isNull } from 'lodash-es';
import { FileBoxIcon, FileText } from 'lucide-react';
import { rgba } from 'polished';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { useSearchParams } from 'react-router-dom';

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
      margin-inline: 16px;
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
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;

      margin-inline-start: 12px;

      color: ${token.colorText};
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
  selected?: boolean;
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
  }) => {
    const { t } = useTranslation(['components', 'file']);
    const { styles, cx } = useStyles();
    const [, setSearchParams] = useSearchParams();
    const [isCreatingFileParseTask, parseFiles] = useFileStore((s) => [
      fileManagerSelectors.isCreatingFileParseTask(id)(s),
      s.parseFilesToChunks,
    ]);

    const isSupportedForChunking = !isChunkingUnsupported(fileType);
    const isNote = sourceType === 'document' || fileType === 'custom/document';

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
            setSearchParams(
              (prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.set('file', id);
                return newParams;
              },
              { replace: true },
            );
          }}
        >
          <Flexbox align={'center'} horizontal>
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
              {isNote ? (
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
            <span className={styles.name}>{displayTitle}</span>
          </Flexbox>
          <Flexbox
            align={'center'}
            gap={8}
            horizontal
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {isCreatingFileParseTask || isNull(chunkingStatus) || !chunkingStatus ? (
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
            )}
            <div className={styles.hover}>
              <DropdownMenu filename={name} id={id} knowledgeBaseId={knowledgeBaseId} url={url} />
            </div>
          </Flexbox>
        </Flexbox>
        <Flexbox className={styles.item} width={FILE_DATE_WIDTH}>
          {displayTime}
        </Flexbox>
        <Flexbox className={styles.item} width={FILE_SIZE_WIDTH}>
          {formatSize(size)}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default FileRenderItem;
