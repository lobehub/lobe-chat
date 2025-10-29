import { Flexbox, SendButton, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Text strong>禁用状态</Text>

      <Flexbox gap={12} horizontal>
        <SendButton disabled generating onStop={() => {}} />
        <Text type="secondary">禁用停止按钮</Text>
      </Flexbox>
    </Flexbox>
  );
};
