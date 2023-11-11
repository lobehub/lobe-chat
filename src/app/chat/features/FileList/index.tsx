import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/files';

import FileItem from './FileItem';
import Lightbox from './Lightbox';

const FileList = memo(() => {
  const inputFilesList = useFileStore((s) => s.inputFilesList);

  const [showLightbox, setShowLightbox] = useState(false);

  const [currentImageIndex, setCurrentIndex] = useState(0);

  const gotoPrevious = () => currentImageIndex > 0 && setCurrentIndex(currentImageIndex - 1);

  const gotoNext = () =>
    currentImageIndex + 1 < inputFilesList.length && setCurrentIndex(currentImageIndex + 1);

  return (
    <>
      <Flexbox gap={8} horizontal>
        {inputFilesList.map((i, index) => (
          <FileItem
            id={i}
            key={i}
            onClick={() => {
              console.log(index);
              setCurrentIndex(index);
              setShowLightbox(true);
            }}
          />
        ))}
      </Flexbox>
      <Lightbox
        index={currentImageIndex}
        onNext={gotoNext}
        onOpenChange={setShowLightbox}
        onPrev={gotoPrevious}
        open={showLightbox}
      />
    </>
  );
});

export default FileList;
