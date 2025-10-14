import { Divider, Flexbox, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox align="center" gap={16} horizontal>
      <Text>选项 A</Text>
      <Divider style={{ height: 20 }} type="vertical" />
      <Text>选项 B</Text>
      <Divider style={{ height: 20 }} type="vertical" />
      <Text>选项 C</Text>
    </Flexbox>
  );
};
