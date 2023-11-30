import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import FileItem from './FileItem';
import Lightbox from './Lightbox';

// TODO：后续看情况是否做图片过多的滚动功能
// const useStyles = createStyles(({ css }) => ({
//   container: css`
//     width: ${IMAGE_SIZE * 5 + 4 * 8 + IMAGE_SIZE / 2}px;
//     overflow-x: scroll;
//     height: ${IMAGE_SIZE + 12}px;
//   `,
// }));

interface FileListProps {
  alwaysShowClose?: boolean;
  editable?: boolean;
  items: string[];
}

const FileList = memo<FileListProps>(({ items, editable = true, alwaysShowClose }) => {
  // const { styles } = useStyles();

  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentIndex] = useState(0);

  const gotoPrevious = () => currentImageIndex > 0 && setCurrentIndex(currentImageIndex - 1);
  const gotoNext = () =>
    currentImageIndex + 1 < items.length && setCurrentIndex(currentImageIndex + 1);

  return (
    <>
      <Flexbox align={'flex-end'} gap={8} horizontal>
        {items.map((i, index) => (
          <FileItem
            alwaysShowClose={alwaysShowClose}
            editable={editable}
            id={i}
            key={i}
            onClick={() => {
              setCurrentIndex(index);
              setShowLightbox(true);
            }}
          />
        ))}
      </Flexbox>
      <Lightbox
        index={currentImageIndex}
        items={items}
        onNext={gotoNext}
        onOpenChange={setShowLightbox}
        onPrev={gotoPrevious}
        open={showLightbox}
      />
    </>
  );
});

export default FileList;
