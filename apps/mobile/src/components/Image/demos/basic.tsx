import { Flexbox, Text } from '@lobehub/ui-rn';
import React from 'react';

import Image from '../Image';

const IMAGE_URL = 'https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d';
const SMALL_IMAGE =
  'https://img.shields.io/badge/LobeHub-Readme%20Generator-white?labelColor=black&style=flat-square';

export default () => {
  return (
    <Flexbox gap={16}>
      <Text type="secondary">智能自适应（大图自动缩放，保持宽高比）</Text>
      <Image source={{ uri: IMAGE_URL }} />

      <Text type="secondary">小图显示原尺寸</Text>
      <Image borderRadius={0} source={{ uri: SMALL_IMAGE }} />

      <Text type="secondary">使用 width prop 指定宽度</Text>
      <Image borderRadius={8} source={{ uri: IMAGE_URL }} width={200} />
    </Flexbox>
  );
};
