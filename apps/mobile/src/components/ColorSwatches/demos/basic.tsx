import React, { useState } from 'react';
import { View, Text } from 'react-native';

import ColorSwatches from '../index';

const BasicDemo = () => {
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  // 基础颜色数组
  const colors = [
    {
      color: 'rgba(0, 0, 0, 0)',
      title: '默认',
    },
    {
      color: '#ff4d4f',
      title: '红色',
    },
    {
      color: '#ff7a45',
      title: '橙色',
    },
    {
      color: '#ffa940',
      title: '金色',
    },
    {
      color: '#73d13d',
      title: '绿色',
    },
    {
      color: '#40a9ff',
      title: '蓝色',
    },
    {
      color: '#b37feb',
      title: '紫色',
    },
  ];

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        ColorSwatches 基础演示
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 15 }}>选择的颜色: {selectedColor || '无'}</Text>

      <ColorSwatches
        colors={colors}
        gap={8}
        onChange={setSelectedColor}
        size={32}
        value={selectedColor}
      />

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>方形样式:</Text>
        <ColorSwatches
          colors={colors.slice(1, 5)}
          gap={6}
          onChange={(color) => console.log('方形选择:', color)}
          shape="square"
          size={28}
        />
      </View>
    </View>
  );
};

export default BasicDemo;
