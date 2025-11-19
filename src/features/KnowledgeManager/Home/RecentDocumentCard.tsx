'use client';

import { createStyles } from 'antd-style';
import markdownToTxt from 'markdown-to-txt';
import { memo } from 'react';

import { FileListItem } from '@/types/files';

// Helper to extract title from markdown content
const extractTitle = (content: string): string | null => {
  if (!content) return null;

  // Find first markdown header (# title)
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
};

// Helper to extract preview text from note content
const getPreviewText = (item: FileListItem): string => {
  if (!item.content) return '';

  // Convert markdown to plain text
  let plainText = markdownToTxt(item.content);

  // Remove the title line if it exists
  const title = extractTitle(item.content);
  if (title) {
    plainText = plainText.replace(title, '').trim();
  }

  // Limit to first 200 characters for preview
  return plainText.slice(0, 200);
};

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    cursor: pointer;
    user-select: none;

    position: relative;

    overflow: hidden;
    flex-shrink: 0;

    width: 280px;
    height: 180px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    transition: all ${token.motionDurationMid};

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: ${token.boxShadowTertiary};
    }
  `,
  noteContent: css`
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 8px;

    height: 100%;
    padding: 12px;
  `,
  notePreview: css`
    overflow: hidden;
    display: -webkit-box;
    flex: 1;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;

    font-size: 13px;
    line-height: 1.6;
    color: ${token.colorTextSecondary};
  `,
  noteTitle: css`
    overflow: hidden;

    font-size: 14px;
    font-weight: ${token.fontWeightStrong};
    line-height: 1.4;
    color: ${token.colorText};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

interface RecentDocumentCardProps {
  document: FileListItem;
  onClick: () => void;
}

const RecentDocumentCard = memo<RecentDocumentCardProps>(({ document, onClick }) => {
  const { styles } = useStyles();

  const title = document.name || '';
  const previewText = getPreviewText(document);
  const emoji = document.metadata?.emoji;

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.noteContent}>
        <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
          {emoji && <span style={{ fontSize: 20 }}>{emoji}</span>}
          <div className={styles.noteTitle}>{title}</div>
        </div>
        {previewText && <div className={styles.notePreview}>{previewText}</div>}
      </div>
    </div>
  );
});

export default RecentDocumentCard;
