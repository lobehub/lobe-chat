'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { FileListItem } from '@/types/files';

import RecentFileCard from './RecentFileCard';
import RecentFilesSkeleton from './RecentFilesSkeleton';

const useStyles = createStyles(({ css }) => ({
  grid: css`
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 16px;

    @media (width >= 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (width >= 900px) {
      grid-template-columns: repeat(3, 1fr);
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
    <Flexbox className={styles.grid}>
      {files.map((file) => (
        <RecentFileCard file={file} key={file.id} onClick={() => onOpenFile(file.id)} />
      ))}
    </Flexbox>
  );
});

export default RecentFiles;

