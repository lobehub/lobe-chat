import { Block, Flexbox, MaskShadow, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text>顶部阴影</Text>
        <MaskShadow position="top" size={40}>
          <Block height={120} padding={16}>
            <Text>从底部向顶部渐变淡出</Text>
          </Block>
        </MaskShadow>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>底部阴影</Text>
        <MaskShadow position="bottom" size={40}>
          <Block height={120} padding={16}>
            <Text>从顶部向底部渐变淡出</Text>
          </Block>
        </MaskShadow>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>左侧阴影</Text>
        <MaskShadow position="left" size={40}>
          <Block height={120} padding={16}>
            <Text>从右侧向左侧渐变淡出</Text>
          </Block>
        </MaskShadow>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>右侧阴影</Text>
        <MaskShadow position="right" size={40}>
          <Block height={120} padding={16}>
            <Text>从左侧向右侧渐变淡出</Text>
          </Block>
        </MaskShadow>
      </Flexbox>
    </Flexbox>
  );
};
