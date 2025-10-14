import { Flexbox, Segmented, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">Small</Text>
        <Segmented defaultValue="Daily" options={['Daily', 'Weekly', 'Monthly']} size="small" />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">Middle (默认)</Text>
        <Segmented defaultValue="Weekly" options={['Daily', 'Weekly', 'Monthly']} size="middle" />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">Large</Text>
        <Segmented defaultValue="Monthly" options={['Daily', 'Weekly', 'Monthly']} size="large" />
      </Flexbox>
    </Flexbox>
  );
};
