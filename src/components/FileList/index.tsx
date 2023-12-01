import { memo } from 'react';

import LightBox from '@/components/FileList/Lightbox';

import FileItem from './FileItem';
import { useStyles } from './style';

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
