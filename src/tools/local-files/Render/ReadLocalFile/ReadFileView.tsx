import { LocalReadFileResult } from '@lobechat/electron-client-ipc';
import { ActionIcon, Icon, Markdown } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { AlignLeft, Asterisk, ChevronDownIcon, ExternalLink, FolderOpen } from 'lucide-react';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { localFileService } from '@/services/electron/localFileService';

const useStyles = createStyles(({ css, token, cx }) => ({
  actions: cx(
    'local-file-actions',
    css`
      cursor: pointer;
      color: ${token.colorTextTertiary};
      opacity: 0;
      transition: opacity 0.2s ${token.motionEaseInOut};
    `,
  ),
  container: css`
    padding: 8px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
    transition: all 0.2s ${token.motionEaseInOut};

    &:hover {
      border-color: ${token.colorBorder};

      .local-file-actions {
        opacity: 1;
      }
    }
  `,
  fileName: css`
    flex: 1;
    margin-inline-start: 8px;
    color: ${token.colorTextSecondary};

    &:hover {
      color: ${token.colorText};
    }
  `,
  header: css`
    cursor: pointer;
  `,
  meta: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  path: css`
    margin-block-start: 4px;
    padding-inline: 4px;

    font-size: 12px;
    color: ${token.colorTextSecondary};
    word-break: break-all;
  `,
  previewBox: css`
    position: relative;

    overflow: hidden;

    margin-block-start: 8px;
    padding: 8px;
    border-radius: 8px;

    background: ${token.colorFillQuaternary};
  `,
  previewText: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    line-height: 1.6;
    word-break: break-all;
    white-space: pre-wrap;
  `,
}));

// Assuming the result object might include the original path and an optional warning
interface ReadFileViewProps extends LocalReadFileResult {
  path: string; // The full path requested
}

const ReadFileView = memo<ReadFileViewProps>(
  ({
    filename,
    path,
    fileType,
    charCount,
    lineCount, // Assuming the 250 is total lines?
    content, // The actual content preview
  }) => {
    const { t } = useTranslation('tool');
    const { styles } = useStyles();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleExpand = () => {
      setIsExpanded(!isExpanded);
    };

    const handleOpenFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      localFileService.openLocalFile({ path });
    };

    const handleOpenFolder = (e: React.MouseEvent) => {
      e.stopPropagation();
      localFileService.openLocalFolder({ isDirectory: false, path });
    };

    return (
      <Flexbox className={styles.container}>
        <Flexbox
          align={'center'}
          className={styles.header}
          horizontal
          justify={'space-between'}
          onClick={handleToggleExpand}
        >
          <Flexbox align={'center'} flex={1} gap={0} horizontal style={{ overflow: 'hidden' }}>
            <FileIcon fileName={filename} fileType={fileType} size={24} variant={'pure'} />
            <Flexbox horizontal>
              <Typography.Text className={styles.fileName} ellipsis>
                {filename}
              </Typography.Text>
              {/* Actions on Hover */}
              <Flexbox className={styles.actions} gap={8} horizontal style={{ marginLeft: 8 }}>
                <ActionIcon
                  icon={ExternalLink}
                  onClick={handleOpenFile}
                  size="small"
                  title={t('localFiles.openFile')}
                />
                <ActionIcon
                  icon={FolderOpen}
                  onClick={handleOpenFolder}
                  size="small"
                  title={t('localFiles.openFolder')}
                />
              </Flexbox>
            </Flexbox>
          </Flexbox>
          <Flexbox align={'center'} className={styles.meta} gap={8} horizontal>
            <Flexbox align={'center'} gap={4} horizontal>
              <Icon icon={Asterisk} size={'small'} />
              <span>{charCount}</span>
            </Flexbox>
            <Flexbox align={'center'} gap={4} horizontal>
              <Icon icon={AlignLeft} size={'small'} />
              <span>
                {content?.split('\n').length || 0} / {lineCount}
              </span>
              {/* Display preview lines / total lines */}
            </Flexbox>
            <ActionIcon
              active={isExpanded}
              icon={ChevronDownIcon}
              onClick={handleToggleExpand}
              size="small"
              style={{
                marginLeft: 8,
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </Flexbox>
        </Flexbox>

        {/* Path */}
        <Typography.Text className={styles.path} ellipsis type={'secondary'}>
          {path}
        </Typography.Text>

        {/* Content Preview (Collapsible) */}
        {isExpanded && (
          <Flexbox className={styles.previewBox}>
            {fileType === 'md' ? (
              <Markdown style={{ maxHeight: 240, overflow: 'auto' }}>{content}</Markdown>
            ) : (
              <Typography.Paragraph
                className={styles.previewText}
                ellipsis={{ expandable: true, rows: 10, symbol: t('localFiles.read.more') }}
                style={{ maxHeight: 240, overflow: 'auto' }}
              >
                {content}
              </Typography.Paragraph>
            )}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default ReadFileView;
