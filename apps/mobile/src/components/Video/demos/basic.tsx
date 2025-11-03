import { Flexbox, Text } from '@lobehub/ui-rn';
import React from 'react';

import Video from '../Video';

// 使用公开的视频 URL 示例
const VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export default () => {
  return (
    <Flexbox gap={16}>
      <Text type="secondary">基础视频播放</Text>
      <Video src={VIDEO_URL} />

      <Text type="secondary">自定义宽高比 (1:1)</Text>
      <Video aspectRatio={1} src={VIDEO_URL} width={200} />
    </Flexbox>
  );
};
