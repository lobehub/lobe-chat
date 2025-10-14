import { Empty, Flexbox, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Empty
      description={
        <Flexbox align="center" gap={4}>
          <Text as="h4">暂无内容</Text>
          <Text fontSize={12} type="secondary">
            请添加一些内容开始使用
          </Text>
        </Flexbox>
      }
    />
  );
};
