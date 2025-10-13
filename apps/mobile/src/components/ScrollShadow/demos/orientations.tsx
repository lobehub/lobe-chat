import { Block, Flexbox, ScrollShadow, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text>垂直滚动</Text>
        <Block>
          <ScrollShadow hideScrollBar orientation="vertical" style={{ height: 150, width: '100%' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Flexbox key={i} padding={12}>
                <Text>项目 {i + 1}</Text>
              </Flexbox>
            ))}
          </ScrollShadow>
        </Block>
      </Flexbox>

      <Flexbox gap={8}>
        <Text>水平滚动</Text>
        <Block>
          <ScrollShadow
            hideScrollBar
            orientation="horizontal"
            style={{ height: 80, width: '100%' }}
          >
            <Flexbox gap={8} horizontal padding={12}>
              {Array.from({ length: 10 }).map((_, i) => (
                <Block key={i} padding={12} style={{ minWidth: 100 }}>
                  <Text>项目 {i + 1}</Text>
                </Block>
              ))}
            </Flexbox>
          </ScrollShadow>
        </Block>
      </Flexbox>
    </Flexbox>
  );
};
