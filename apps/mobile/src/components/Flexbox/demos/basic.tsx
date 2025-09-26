import { Center, Flexbox, useTheme } from '@lobehub/ui-rn';
import React from 'react';
import { Text } from 'react-native';

const BasicDemo = () => {
  const theme = useTheme();

  return (
    <Flexbox
      gap={40}
      horizontal
      justify={'space-between'}
      padding={16}
      style={{ backgroundColor: theme.colorBgContainer, borderRadius: 8 }}
      width={'100%'}
    >
      <Center height={40} style={{ backgroundColor: 'cadetblue', borderRadius: 8 }} width={40}>
        <Text style={{ color: 'white' }}>A</Text>
      </Center>
      <Center height={40} style={{ backgroundColor: 'cadetblue', borderRadius: 8 }} width={40}>
        <Text style={{ color: 'white' }}>B</Text>
      </Center>
    </Flexbox>
  );
};

export default BasicDemo;
