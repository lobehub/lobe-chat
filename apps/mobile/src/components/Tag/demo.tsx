import React from 'react';
import { View } from 'react-native';
import { Tag } from './index';

export const TagDemo = () => {
  return (
    <View style={{ flex: 1, gap: 10, padding: 20 }}>
      {/* Status Colors */}
      <Tag color="success">Success</Tag>
      <Tag color="processing">Processing</Tag>
      <Tag color="error">Error</Tag>
      <Tag color="warning">Warning</Tag>
      <Tag color="default">Default</Tag>

      {/* Preset Colors */}
      <Tag color="blue">Blue</Tag>
      <Tag color="green">Green</Tag>
      <Tag color="red">Red</Tag>

      {/* Without Border */}
      <Tag border={false} color="success">
        Success (No Border)
      </Tag>
      <Tag border={false} color="error">
        Error (No Border)
      </Tag>
    </View>
  );
};

export default TagDemo;
