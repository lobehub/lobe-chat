import { BottomSheet, Button, Flexbox, Text } from '@lobehub/ui-rn';
import React, { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);

  return (
    <Flexbox gap={16}>
      <Button onPress={() => setOpen(true)}>打开禁用下拉关闭的抽屉</Button>

      <BottomSheet
        enablePanDownToClose={false}
        onClose={() => setOpen(false)}
        open={open}
        title="禁用下拉关闭"
      >
        <Flexbox gap={16} padding={16}>
          <Text as="h3">禁用下拉关闭</Text>
          <Text type="secondary">
            这个抽屉禁用了下拉关闭手势，只能通过点击关闭按钮或背景遮罩来关闭。
          </Text>
          <Text fontSize={12} type="warning">
            注意：无法通过下拉手势关闭此抽屉。
          </Text>
          <Button onPress={() => setOpen(false)}>关闭</Button>
        </Flexbox>
      </BottomSheet>
    </Flexbox>
  );
};
