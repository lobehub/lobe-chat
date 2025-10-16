import { BottomSheet, Button, Flexbox, Text } from '@lobehub/ui-rn';
import { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);

  const snapPoints = ['25%', '50%', '75%', '90%'];

  return (
    <Flexbox gap={16}>
      <Button onPress={() => setOpen(true)}>打开多快照点抽屉</Button>

      <BottomSheet
        initialSnapIndex={1}
        onClose={() => setOpen(false)}
        open={open}
        snapPoints={snapPoints}
        title="多快照点示例"
      >
        <Flexbox gap={16} padding={16}>
          <Text as="h3">多快照点抽屉</Text>
          <Text type="secondary">
            这个抽屉有 4 个快照点：25%、50%、75% 和 90%。你可以通过拖动在不同高度之间切换。
          </Text>
          <Button onPress={() => setOpen(false)}>关闭</Button>
        </Flexbox>
      </BottomSheet>
    </Flexbox>
  );
};
