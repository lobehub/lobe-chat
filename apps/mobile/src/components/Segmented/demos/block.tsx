import { Flexbox, Segmented, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">默认宽度</Text>
        <Segmented defaultValue="iOS" options={['iOS', 'Android', 'Web']} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">块级元素（占满容器宽度）</Text>
        <Segmented block defaultValue="Android" options={['iOS', 'Android', 'Web']} />
      </Flexbox>
    </Flexbox>
  );
};
