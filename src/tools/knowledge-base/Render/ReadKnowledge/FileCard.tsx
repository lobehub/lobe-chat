'use client';

import { Alert, Text } from '@lobehub/ui';
import { Descriptions } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';

import { FileContentDetail } from '../../type';

const useStyles = createStyles(({ token, css }) => {
  return {
    cardBody: css`
      padding-block: 12px 8px;
      padding-inline: 16px;
    `,
    container: css`
      overflow: hidden;

      min-width: 360px;
      max-width: 360px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: 12px;
    `,
    description: css`
      margin-block: 0 4px !important;
      color: ${token.colorTextTertiary};
    `,
    footer: css`
      padding-block: 8px;
      padding-inline: 16px;
      border-radius: 8px;

      text-align: center;

      background-color: ${token.colorFillQuaternary};
    `,
    footerText: css`
      font-size: 12px !important;
      color: ${token.colorTextTertiary} !important;
    `,
    icon: css`
      color: ${token.colorTextSecondary};
    `,
    preview: css`
      overflow: hidden;

      max-height: 80px;
      padding: 8px;
      border-radius: 6px;

      font-family: ${token.fontFamilyCode};
      font-size: 12px;
      line-height: 1.5;
      color: ${token.colorTextSecondary};
    `,
    title: css`
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;

      margin-block-end: 0;
    `,
    titleRow: css`
      color: ${token.colorText};
    `,
  };
});

interface FileCardProps {
  file: FileContentDetail;
}

const FileCard = memo<FileCardProps>(({ file }) => {
  const { t } = useTranslation('tool');
  const { styles } = useStyles();

  if (file.error) {
    return (
      <Flexbox className={styles.container} gap={8}>
        <Flexbox className={styles.cardBody} gap={8}>
          <Flexbox align={'center'} className={styles.titleRow} gap={8} horizontal>
            <FileIcon fileName={file.filename} size={16} />
            <div className={styles.title}>{file.filename}</div>
          </Flexbox>
        </Flexbox>
        <div className={styles.footer}>
          <Alert message={file.error} type={'error'} variant={'borderless'} />
        </div>
      </Flexbox>
    );
  }

  return (
    <Flexbox className={styles.container} justify={'space-between'}>
      <Flexbox className={styles.cardBody} gap={8}>
        <Flexbox align={'center'} className={styles.titleRow} gap={8} horizontal>
          <FileIcon fileName={file.filename} size={16} />
          <div className={styles.title}>{file.filename}</div>
        </Flexbox>
        {file.preview && (
          <Text className={styles.preview} ellipsis={{ rows: 4 }}>
            {file.preview}...
          </Text>
        )}
      </Flexbox>
      <div className={styles.footer}>
        <Descriptions
          classNames={{
            content: styles.footerText,
            label: styles.footerText,
          }}
          column={2}
          items={[
            {
              children: file.totalCharCount?.toLocaleString(),
              label: t('lobe-knowledge-base.readKnowledge.meta.chars'),
            },
            {
              children: file.totalLineCount?.toLocaleString(),
              label: t('lobe-knowledge-base.readKnowledge.meta.lines'),
            },
          ]}
          size="small"
        />
      </div>
    </Flexbox>
  );
});

export default FileCard;
