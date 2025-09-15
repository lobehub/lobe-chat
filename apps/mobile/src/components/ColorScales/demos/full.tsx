import React from 'react';
import { ScrollView, View } from 'react-native';

import ColorScales from '../index';
import { colorScales } from '@/theme';

const FullDemo = () => {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} style={{ flex: 1 }}>
      <View style={{ gap: 32 }}>
        {Object.entries(colorScales).map(([name, scale]) => (
          <ColorScales key={name} midHighLight={9} name={name} scale={scale} />
        ))}
      </View>
    </ScrollView>
  );
};

export default FullDemo;
