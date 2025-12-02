'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';

import { FileListItem } from '@/types/files';

import RecentFileCard from './RecentFileCard';
import RecentFilesSkeleton from './RecentFilesSkeleton';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    position: relative;
    overflow: hidden;
  `,
  fadeEdge: css`
    pointer-events: none;

    position: absolute;
    inset-block: 0 0;
    inset-inline-end: 0;

    width: 80px;

    background: linear-gradient(to left, ${token.colorBgContainerSecondary}, transparent);
  `,
  scrollContainer: css`
    scroll-behavior: smooth;

    /* Hide scrollbar */
    scrollbar-width: none;

    overflow: auto hidden;
    display: flex;
    gap: 16px;

    padding-block-end: 8px;
    padding-inline-end: 80px;

    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
}));

interface RecentFilesProps {
  files: FileListItem[];
  isLoading?: boolean;
  onOpenFile: (id: string) => void;
}

const RecentFiles = memo<RecentFilesProps>(({ files, isLoading, onOpenFile }) => {
  const { styles } = useStyles();

  if (isLoading) {
    return <RecentFilesSkeleton />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        {files.map((file) => (
          <RecentFileCard file={file} key={file.id} onClick={() => onOpenFile(file.id)} />
        ))}
      </div>
      <div className={styles.fadeEdge} />
    </div>
  );
});

export default RecentFiles;
