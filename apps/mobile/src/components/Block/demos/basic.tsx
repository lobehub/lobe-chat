import { Block, Flexbox } from '@lobehub/ui-rn';
import React from 'react';
import { Text } from 'react-native';

const BasicDemo = () => {
  return (
    <Flexbox gap={16}>
      <Block padding={16}>
        <Text>Variant Filled Block</Text>
      </Block>
      <Block padding={16} variant={'outlined'}>
        <Text>Variant Outlined Block</Text>
      </Block>
      <Block padding={16} variant={'borderless'}>
        <Text>Variant Borderless Block</Text>
      </Block>
      <Block padding={16} shadow variant={'outlined'}>
        <Text>Shadow Block</Text>
      </Block>
    </Flexbox>
  );
};

export default BasicDemo;
