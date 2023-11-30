import { createStyles } from 'antd-style';
import { memo } from 'react';

import { MIN_IMAGE_SIZE } from '@/app/chat/components/FileList/FileItem.style';
import LightBox from '@/app/chat/components/FileList/Lightbox';

import FileItem from './FileItem';

const MAX_SIZE = 640;
const GAP = 8;

const useStyles = createStyles(({ css }) => ({
  container: css`
    display: grid;
    grid-gap: ${GAP}px;
    grid-template-columns: repeat(6, 1fr);

    width: 100%;
    max-width: ${MAX_SIZE}px;

    & > div {
      grid-column: span 2;

      width: 100%;
      min-width: ${MIN_IMAGE_SIZE}px;
      min-height: ${MIN_IMAGE_SIZE}px;
      max-height: ${(MAX_SIZE - GAP) / 2}px;
    }

    & > div:nth-child(1):nth-last-child(2),
    & > div:nth-child(2):nth-last-child(1) {
      grid-column: span 3;
      max-height: ${(MAX_SIZE - 2 * GAP) / 3}px;
    }

    & > :nth-child(1):nth-last-child(1) {
      grid-column: span 6;
      max-height: ${MAX_SIZE}px;
    }
  `,
}));

interface FileListProps {
  alwaysShowClose?: boolean;
  editable?: boolean;
  items: string[];
}

const FileList = memo<FileListProps>(({ items, editable = true, alwaysShowClose }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <LightBox items={items}>
        {items.map((i) => (
          <FileItem alwaysShowClose={alwaysShowClose} editable={editable} id={i} key={i} />
        ))}
      </LightBox>
    </div>
  );
});

export default FileList;
