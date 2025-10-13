import { Block, Flexbox, ScrollShadow, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text>自动 (auto) - 根据滚动状态自动显示阴影</Text>
        <Block>
          <ScrollShadow hideScrollBar style={{ height: 120, width: '100%' }} visibility="auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <Flexbox key={i} padding={12}>
                <Text>项目 {i + 1}</Text>
              </Flexbox>
            ))}
          </ScrollShadow>
        </Block>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>始终显示 (always) - 无论滚动状态如何都显示阴影</Text>
        <Block>
          <ScrollShadow hideScrollBar style={{ height: 120, width: '100%' }} visibility="always">
            {Array.from({ length: 8 }).map((_, i) => (
              <Flexbox key={i} padding={12}>
                <Text>项目 {i + 1}</Text>
              </Flexbox>
            ))}
          </ScrollShadow>
        </Block>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>从不显示 (never) - 不显示任何阴影</Text>
        <Block>
          <ScrollShadow hideScrollBar style={{ height: 120, width: '100%' }} visibility="never">
            {Array.from({ length: 8 }).map((_, i) => (
              <Flexbox key={i} padding={12}>
                <Text>项目 {i + 1}</Text>
              </Flexbox>
            ))}
          </ScrollShadow>
        </Block>
      </Flexbox>
    </Flexbox>
  );
};
