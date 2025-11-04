'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';

import { FileListItem } from '@/types/files';

import RecentDocumentCard from './RecentDocumentCard';
import RecentFilesSkeleton from './RecentFilesSkeleton';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    position: relative;
    overflow: hidden;
  `,
  fadeEdge: css`
    pointer-events: none;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;

    width: 80px;

    background: linear-gradient(to left, ${token.colorBgContainerSecondary}, transparent);
  `,
  scrollContainer: css`
    display: flex;
    gap: 16px;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 8px;
    scroll-behavior: smooth;

    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
}));

interface RecentDocumentsProps {
  documents: FileListItem[];
  isLoading?: boolean;
  onOpenDocument: (id: string) => void;
}

const RecentDocuments = memo<RecentDocumentsProps>(({ documents, isLoading, onOpenDocument }) => {
  const { styles } = useStyles();

  if (isLoading) {
    return <RecentFilesSkeleton />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        {documents.map((document) => (
          <RecentDocumentCard
            document={document}
            key={document.id}
            onClick={() => onOpenDocument(document.id)}
          />
        ))}
      </div>
      <div className={styles.fadeEdge} />
    </div>
  );
});

export default RecentDocuments;
