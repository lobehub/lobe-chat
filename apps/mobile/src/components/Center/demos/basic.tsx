import React from 'react';
import { Text } from 'react-native';

import { Center } from '@/components';

export default () => {
  return (
    <Center padding={24} style={{ backgroundColor: 'cadetblue', borderRadius: 8 }} width={'100%'}>
      <Text style={{ color: 'white' }}>A</Text>
    </Center>
  );
};
