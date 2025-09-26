import { FluentEmoji } from '@lobehub/ui-rn';
import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';

const ComparisonDemo = () => {
  const token = useTheme();

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
