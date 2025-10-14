import { Divider, Flexbox, Text, useTheme } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  const token = useTheme();

  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">默认分割线</Text>
        <Divider />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">自定义颜色</Text>
        <Divider style={{ backgroundColor: token.colorPrimary }} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">自定义粗细</Text>
        <Divider style={{ height: 2 }} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">虚线样式（需要额外配置）</Text>
        <Divider style={{ backgroundColor: token.colorBorder, height: 1 }} />
      </Flexbox>
    </Flexbox>
  );
};
