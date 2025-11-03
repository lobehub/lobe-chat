import { Flexbox, LoadingDots, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={24}>
      <Flexbox gap={8}>
        <Text type="secondary">小尺寸 (6px)</Text>
        <LoadingDots size={6} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">默认尺寸 (8px)</Text>
        <LoadingDots size={8} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">中等尺寸 (10px)</Text>
        <LoadingDots size={10} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">大尺寸 (12px)</Text>
        <LoadingDots size={12} />
      </Flexbox>
    </Flexbox>
  );
};
