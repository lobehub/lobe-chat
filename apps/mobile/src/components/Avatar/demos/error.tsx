import { Avatar, Text, useTheme } from '@lobehub/ui-rn';
import React from 'react';
import { View } from 'react-native';

const ErrorDemo = () => {
  const token = useTheme();

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
        错误处理
      </Text>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 16,
        }}
      >
        <Avatar alt="Invalid Image" avatar="https://invalid-url/image.jpg" size={48} />
        <Avatar alt="Empty URL" avatar="" size={48} />
      </View>
    </View>
  );
};

export default ErrorDemo;
