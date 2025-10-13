import { Block, Flexbox, MaskShadow, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={8}>
      <Text>底部阴影</Text>
      <MaskShadow position="bottom" size={40}>
        <Block height={200} padding={16}>
          <Flexbox gap={8}>
            <Text>内容从顶部逐渐淡出到底部，创造出渐变遮罩效果</Text>
          </Flexbox>
        </Block>
      </MaskShadow>
    </Flexbox>
  );
};
