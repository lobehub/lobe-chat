import { BottomSheet, Button, Flexbox, Text } from '@lobehub/ui-rn';
import React, { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);

  return (
    <Flexbox gap={16}>
      <Button onPress={() => setOpen(true)}>打开无关闭按钮抽屉</Button>

      <BottomSheet
        onClose={() => setOpen(false)}
        open={open}
        showCloseButton={false}
        title="无关闭按钮"
      >
        <Flexbox gap={16} padding={16}>
          <Text as="h3">无关闭按钮示例</Text>
          <Text type="secondary">这个抽屉没有关闭按钮，只能通过下拉手势或点击背景遮罩来关闭。</Text>
          <Button onPress={() => setOpen(false)}>手动关闭</Button>
        </Flexbox>
      </BottomSheet>
    </Flexbox>
  );
};
