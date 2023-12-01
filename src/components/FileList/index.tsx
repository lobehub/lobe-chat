import { ImageGallery } from '@lobehub/ui';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FileItem from './FileItem';
import { useStyles } from './style';

interface FileListProps {
  alwaysShowClose?: boolean;
  editable?: boolean;
  items: string[];
}

const FileList = memo<FileListProps>(({ items, editable = true, alwaysShowClose }) => {
  const { styles } = useStyles();

  const content = useMemo(
    () => (
      <ImageGallery enable={items?.length > 1}>
        {items.map((i) => (
          <FileItem alwaysShowClose={alwaysShowClose} editable={editable} id={i} key={i} />
        ))}
      </ImageGallery>
    ),
    [items],
  );

  if (editable)
    return (
      <Flexbox gap={8} horizontal>
        {content}
      </Flexbox>
    );

  return <div className={styles.container}>{content}</div>;
});

export default FileList;
