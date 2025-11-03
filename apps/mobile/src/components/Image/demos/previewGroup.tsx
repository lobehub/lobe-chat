import { Flexbox, Image, Text } from '@lobehub/ui-rn';
import React from 'react';

const images = [
  'https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d',
  'https://img.shields.io/badge/LobeHub-Readme%20Generator-white?labelColor=black&style=flat-square',
  'https://avatars.githubusercontent.com/u/17870709?v=4',
];

export default () => {
  return (
    <Flexbox gap={16}>
      <Text type="secondary">点击任意图片预览，支持左右滑动切换</Text>

      <Image.PreviewGroup>
        <Flexbox gap={8} horizontal wrap="wrap">
          {images.map((url, index) => (
            <Image
              contentFit="cover"
              key={index}
              source={{ uri: url }}
              style={{ borderRadius: 8, height: 100, width: 100 }}
            />
          ))}
        </Flexbox>
      </Image.PreviewGroup>

      <Text type="secondary">禁用预览组</Text>

      <Image.PreviewGroup preview={false}>
        <Flexbox gap={8} horizontal wrap="wrap">
          {images.map((url, index) => (
            <Image
              contentFit="cover"
              key={index}
              source={{ uri: url }}
              style={{ borderRadius: 8, height: 100, width: 100 }}
            />
          ))}
        </Flexbox>
      </Image.PreviewGroup>
    </Flexbox>
  );
};
