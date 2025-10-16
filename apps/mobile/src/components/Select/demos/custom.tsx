import { Block, Flexbox, Select, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  const options = [
    {
      title: 'React',
      value: 'react',
    },
    {
      title: 'Vue',
      value: 'vue',
    },
    {
      title: 'Angular',
      value: 'angular',
    },
  ];

  return (
    <Flexbox gap={16}>
      <Select
        optionRender={(item) => (
          <Block padding={8}>
            <Text strong>{item.title as string}</Text>
            <Text fontSize={12} type="secondary">
              Framework: {item.value}
            </Text>
          </Block>
        )}
        options={options}
        title="自定义渲染"
      />
    </Flexbox>
  );
};
