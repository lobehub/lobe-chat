import { Flexbox, LoadingDots, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={32}>
      <Flexbox align="center" gap={12}>
        <Text type="secondary">默认点状 (dots)</Text>
        <LoadingDots variant="dots" />
      </Flexbox>

      <Flexbox align="center" gap={12}>
        <Text type="secondary">脉冲效果 (pulse)</Text>
        <LoadingDots size={12} variant="pulse" />
      </Flexbox>

      <Flexbox align="center" gap={12}>
        <Text type="secondary">波浪效果 (wave)</Text>
        <LoadingDots size={10} variant="wave" />
      </Flexbox>

      <Flexbox align="center" gap={12}>
        <Text type="secondary">轨道旋转 (orbit)</Text>
        <LoadingDots size={8} variant="orbit" />
      </Flexbox>

      <Flexbox align="center" gap={12}>
        <Text type="secondary">打字机效果 (typing)</Text>
        <LoadingDots variant="typing" />
      </Flexbox>
    </Flexbox>
  );
};
