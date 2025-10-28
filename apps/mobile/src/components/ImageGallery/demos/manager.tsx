import { Button, Flexbox } from '@lobehub/ui-rn';
import React from 'react';

import { imageGallery } from '@/libs/imageGallery';

const showSingleImage = () => {
  imageGallery.show(
    ['https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d'],
    0,
  );
};

const showMultipleImages = () => {
  imageGallery.show(
    [
      'https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d',
      'https://img.shields.io/badge/LobeHub-Readme%20Generator-white?labelColor=black&style=flat-square',
      'https://avatars.githubusercontent.com/u/17870709?v=4',
    ],
    0,
  );
};

export default () => {
  return (
    <Flexbox gap={16}>
      <Button onPress={showSingleImage}>使用管理器查看单张图片</Button>
      <Button onPress={showMultipleImages}>使用管理器查看多张图片</Button>
    </Flexbox>
  );
};
