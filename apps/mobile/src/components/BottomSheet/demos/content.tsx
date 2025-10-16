import { Block, BottomSheet, Button, Flexbox, Text } from '@lobehub/ui-rn';
import React, { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);

  return (
    <Flexbox gap={16}>
      <Button onPress={() => setOpen(true)}>打开复杂内容抽屉</Button>
      <BottomSheet onClose={() => setOpen(false)} open={open} snapPoints={['80%']} title="商品列表">
        <Flexbox gap={12} padding={16}>
          {Array.from({ length: 15 }).map((_, i) => (
            <Block gap={8} key={i} padding={16} variant="outlined">
              <Text as="h4">商品 {i + 1}</Text>
              <Text fontSize={12} type="secondary">
                这是商品描述文本，包含了商品的详细信息和特点。
              </Text>
              <Flexbox align="center" horizontal justify="space-between">
                <Text fontSize={16} strong type="danger">
                  ¥ {(Math.random() * 1000).toFixed(2)}
                </Text>
                <Button size="small">加入购物车</Button>
              </Flexbox>
            </Block>
          ))}
        </Flexbox>
      </BottomSheet>
    </Flexbox>
  );
};
