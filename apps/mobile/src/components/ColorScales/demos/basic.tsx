import React from 'react';
import { ScrollView, View } from 'react-native';

import ColorScales from '../index';
import { colorScales } from '@/theme';

const BasicDemo = () => {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} style={{ flex: 1 }}>
      <View style={{ gap: 32 }}>
        <ColorScales midHighLight={9} name="primary" scale={colorScales.primary} />
        <ColorScales midHighLight={9} name="red" scale={colorScales.red} />
        <ColorScales midHighLight={9} name="blue" scale={colorScales.blue} />
        <ColorScales midHighLight={9} name="green" scale={colorScales.green} />
      </View>
    </ScrollView>
  );
};

export default BasicDemo;
