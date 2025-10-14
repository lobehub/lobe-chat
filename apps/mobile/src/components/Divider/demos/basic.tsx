import { Divider, Flexbox, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Text>第一段内容</Text>
      <Divider />
      <Text>第二段内容</Text>
      <Divider />
      <Text>第三段内容</Text>
    </Flexbox>
  );
};
