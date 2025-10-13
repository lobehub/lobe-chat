import { Block, Flexbox, MaskShadow, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text>小阴影 (20%)</Text>
        <MaskShadow position="bottom" size={20}>
          <Block height={120} padding={16}>
            <Text>较短的渐变过渡区域</Text>
          </Block>
        </MaskShadow>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>中等阴影 (40%)</Text>
        <MaskShadow position="bottom" size={40}>
          <Block height={120} padding={16}>
            <Text>默认的渐变过渡大小</Text>
          </Block>
        </MaskShadow>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>大阴影 (60%)</Text>
        <MaskShadow position="bottom" size={60}>
          <Block height={120} padding={16}>
            <Text>较长的渐变过渡区域</Text>
          </Block>
        </MaskShadow>
      </Flexbox>
    </Flexbox>
  );
};
