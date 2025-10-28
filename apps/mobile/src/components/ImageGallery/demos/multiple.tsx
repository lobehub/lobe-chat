import { Button, Flexbox } from '@lobehub/ui-rn';
import React, { useState } from 'react';

import ImageGallery from '../ImageGallery';

const images = [
  'https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d',
  'https://img.shields.io/badge/LobeHub-Readme%20Generator-white?labelColor=black&style=flat-square',
  'https://avatars.githubusercontent.com/u/17870709?v=4',
];

export default () => {
  const [visible, setVisible] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const showImage = (index: number) => {
    setInitialIndex(index);
    setVisible(true);
  };

  return (
    <Flexbox gap={16}>
      <Flexbox gap={8} horizontal>
        <Button onPress={() => showImage(0)}>查看第 1 张</Button>
        <Button onPress={() => showImage(1)}>查看第 2 张</Button>
        <Button onPress={() => showImage(2)}>查看第 3 张</Button>
      </Flexbox>
      {visible && (
        <ImageGallery
          images={images}
          initialIndex={initialIndex}
          onClose={() => setVisible(false)}
        />
      )}
    </Flexbox>
  );
};
