import React from 'react';
import { View, Text } from 'react-native';
import { useThemeToken } from '@/theme';
import FluentEmoji from '../index';

const SizesDemo = () => {
  const token = useThemeToken();

  const sizes = [24, 32, 48, 64];

  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {sizes.map((size) => (
          <View key={size} style={{ alignItems: 'center' }}>
            <FluentEmoji emoji="😀" size={size} />
            <Text
              style={{
                color: token.colorTextSecondary,
                fontSize: 12,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {size}px
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SizesDemo;
