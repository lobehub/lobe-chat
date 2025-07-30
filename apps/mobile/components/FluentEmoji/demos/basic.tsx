import React from 'react';
import { View, Text } from 'react-native';
import { useThemeToken } from '@/mobile/theme';
import FluentEmoji from '../index';

const BasicDemo = () => {
  const token = useThemeToken();

  const basicEmojis = ['😊', '🚀', '🔥', '🎉', '💡', '🌈', '🍕', '🎮'];

  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'center',
        }}
      >
        {basicEmojis.map((emoji, index) => (
          <View key={index} style={{ alignItems: 'center' }}>
            <FluentEmoji emoji={emoji} size={40} />
            <Text
              style={{
                color: token.colorTextSecondary,
                fontSize: 12,
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              {emoji}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default BasicDemo;
