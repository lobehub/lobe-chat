import React from 'react';
import { View } from 'react-native';
import Tag from '../index';

const ColorsDemo = () => {
  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {/* Preset colors */}
        <Tag color="red">Red</Tag>
        <Tag color="volcano">Volcano</Tag>
        <Tag color="orange">Orange</Tag>
        <Tag color="gold">Gold</Tag>
        <Tag color="yellow">Yellow</Tag>
        <Tag color="lime">Lime</Tag>
        <Tag color="green">Green</Tag>
        <Tag color="cyan">Cyan</Tag>
        <Tag color="blue">Blue</Tag>
        <Tag color="geekblue">Geekblue</Tag>
        <Tag color="purple">Purple</Tag>
        <Tag color="magenta">Magenta</Tag>
        <Tag color="gray">Gray</Tag>

        {/* Default (no color) */}
        <Tag>Default</Tag>
      </View>
    </View>
  );
};

export default ColorsDemo;
