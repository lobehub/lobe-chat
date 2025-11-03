import { Flexbox, LoadingDots, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={24}>
      <Flexbox gap={8}>
        <Text type="secondary">默认加载动画</Text>
        <LoadingDots />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">AI 思考中 (pulse)</Text>
        <Flexbox align="center" gap={8} horizontal>
          <Text>AI 正在思考</Text>
          <LoadingDots size={10} variant="pulse" />
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">打字效果 (typing)</Text>
        <Flexbox align="center" gap={8} horizontal>
          <Text>正在输入</Text>
          <LoadingDots size={6} variant="typing" />
        </Flexbox>
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">处理中 (orbit)</Text>
        <Flexbox align="center" gap={16} horizontal>
          <Text>处理中</Text>
          <LoadingDots size={8} variant="orbit" />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};
