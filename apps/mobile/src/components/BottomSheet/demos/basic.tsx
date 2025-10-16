import { BottomSheet, Button, Flexbox, Text } from '@lobehub/ui-rn';
import React, { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);

  return (
    <Flexbox gap={16}>
      <Button onPress={() => setOpen(true)}>打开底部抽屉</Button>
      <BottomSheet onClose={() => setOpen(false)} open={open} title="基础用法">
        <Flexbox gap={16} padding={16}>
          <Text as="h3">欢迎使用底部抽屉</Text>
          <Text type="secondary">
            这是一个基础的底部抽屉示例，你可以通过拖动或点击关闭按钮来关闭它。
          </Text>
          <Button onPress={() => setOpen(false)}>关闭</Button>
        </Flexbox>
      </BottomSheet>
    </Flexbox>
  );
};
