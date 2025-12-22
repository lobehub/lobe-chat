'use client';

import { Flexbox, Tag, Text } from '@lobehub/ui';
import { Descriptions } from 'antd';
import { createStyles } from 'antd-style';
import { FileText, NotebookText } from 'lucide-react';
import { memo } from 'react';

import { NotebookDocument } from '../../../types';

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
      color: ${token.colorPrimary};
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
      font-weight: 500;
    `,
    titleRow: css`
      color: ${token.colorText};
    `,
    typeTag: css`
      font-size: 11px;
    `,
  };
});

interface DocumentCardProps {
  document: NotebookDocument;
  labels: {
    type: string;
    words: string;
  };
}

const DocumentCard = memo<DocumentCardProps>(({ document, labels }) => {
  const { styles } = useStyles();

  // Get preview from content (first 200 chars)
  const preview = document.content?.slice(0, 200);

  return (
    <Flexbox className={styles.container} justify={'space-between'}>
      <Flexbox className={styles.cardBody} gap={8}>
        <Flexbox align={'center'} className={styles.titleRow} gap={8} horizontal>
          {document.type === 'note' ? (
            <NotebookText className={styles.icon} size={16} />
          ) : (
            <FileText className={styles.icon} size={16} />
          )}
          <div className={styles.title}>{document.title}</div>
          <Tag className={styles.typeTag} size={'small'}>
            {document.type}
          </Tag>
        </Flexbox>
        {preview && (
          <Text className={styles.preview} ellipsis={{ rows: 4 }}>
            {preview}...
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
              children: document.type,
              label: labels.type,
            },
            {
              children: document.wordCount?.toLocaleString(),
              label: labels.words,
            },
          ]}
          size="small"
        />
      </div>
    </Flexbox>
  );
});

export default DocumentCard;
