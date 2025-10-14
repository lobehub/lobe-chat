import { Flexbox, Segmented, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">Default 形状</Text>
        <Segmented defaultValue="iOS" options={['iOS', 'Android', 'Web']} shape="default" />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">Round 形状</Text>
        <Segmented defaultValue="Android" options={['iOS', 'Android', 'Web']} shape="round" />
      </Flexbox>
    </Flexbox>
  );
};
