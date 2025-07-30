import React from 'react';
import { View } from 'react-native';
import { useThemeToken } from '@/theme';
import Tag from '../index';

const ColorsDemo = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Tag
          style={{ backgroundColor: token.colorSuccessBg }}
          textStyle={{ color: token.colorSuccess }}
        >
          Success
        </Tag>
        <Tag
          style={{ backgroundColor: token.colorWarningBg }}
          textStyle={{ color: token.colorWarning }}
        >
          Warning
        </Tag>
        <Tag
          style={{ backgroundColor: token.colorErrorBg }}
          textStyle={{ color: token.colorError }}
        >
          Error
        </Tag>
        <Tag style={{ backgroundColor: token.colorInfoBg }} textStyle={{ color: token.colorInfo }}>
          Info
        </Tag>
      </View>
    </View>
  );
};

export default ColorsDemo;
