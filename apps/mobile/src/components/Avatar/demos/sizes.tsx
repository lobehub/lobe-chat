import React from 'react';
import { View, Text } from 'react-native';
import Avatar from '../index';
import { useThemeToken } from '@/theme';

const SizesDemo = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 16 }}>
      <Text
        style={{
          color: token.colorText,
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 12,
        }}
      >
        不同尺寸
      </Text>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 16,
        }}
      >
        <Avatar alt="LobeHub" avatar="https://github.com/lobehub.png" size={24} />
        <Avatar alt="LobeHub" avatar="https://github.com/lobehub.png" size={32} />
        <Avatar alt="LobeHub" avatar="https://github.com/lobehub.png" size={48} />
        <Avatar alt="LobeHub" avatar="https://github.com/lobehub.png" size={64} />
      </View>
    </View>
  );
};

export default SizesDemo;
