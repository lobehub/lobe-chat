import React from 'react';
import { View } from 'react-native';
import Tag from '../index';

const PresetDemo = () => {
  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Tag color="success">Success</Tag>
        <Tag color="processing">Processing</Tag>
        <Tag color="error">Error</Tag>
        <Tag color="warning">Warning</Tag>
        <Tag color="default">Default</Tag>
      </View>
    </View>
  );
};

export default PresetDemo;
