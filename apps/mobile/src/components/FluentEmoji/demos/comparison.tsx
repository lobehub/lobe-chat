import React from 'react';
import { View, Text } from 'react-native';
import { useThemeToken } from '@/theme';
import FluentEmoji from '../index';

const ComparisonDemo = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 32,
          justifyContent: 'center',
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <FluentEmoji emoji="🎁" size={48} />
          <Text
            style={{
              color: token.colorText,
              fontSize: 14,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            3D (默认)
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <FluentEmoji emoji="🎁" size={48} type="pure" />
          <Text
            style={{
              color: token.colorText,
              fontSize: 14,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            原始表情
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ComparisonDemo;
