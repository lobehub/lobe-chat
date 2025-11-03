import { Flexbox, LoadingDots, Text, useTheme } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  const token = useTheme();

  return (
    <Flexbox gap={24}>
      <Flexbox gap={8}>
        <Text type="secondary">主色调</Text>
        <LoadingDots color={token.colorPrimary} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">成功色</Text>
        <LoadingDots color={token.colorSuccess} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">警告色</Text>
        <LoadingDots color={token.colorWarning} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">错误色</Text>
        <LoadingDots color={token.colorError} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">自定义颜色</Text>
        <LoadingDots color="#ff6b6b" />
      </Flexbox>
    </Flexbox>
  );
};
