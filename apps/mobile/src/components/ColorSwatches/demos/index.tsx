import React, { useState } from 'react';
import { View, Text } from 'react-native';

import ColorSwatches from '../index';
import { colorScales } from '@/theme/color';

const ColorSwatchesDemo = () => {
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  // 从颜色系统中获取预定义颜色
  const colors = [
    {
      color: 'rgba(0, 0, 0, 0)',
      title: '默认',
    },
    {
      color: colorScales.red.light[9],
      title: '红色',
    },
    {
      color: colorScales.orange.light[9],
      title: '橙色',
    },
    {
      color: colorScales.gold.light[9],
      title: '金色',
    },
    {
      color: colorScales.yellow.light[9],
      title: '黄色',
    },
    {
      color: colorScales.lime.light[9],
      title: '青柠',
    },
    {
      color: colorScales.green.light[9],
      title: '绿色',
    },
    {
      color: colorScales.cyan.light[9],
      title: '青色',
    },
    {
      color: colorScales.blue.light[9],
      title: '蓝色',
    },
    {
      color: colorScales.geekblue.light[9],
      title: '极客蓝',
    },
    {
      color: colorScales.purple.light[9],
      title: '紫色',
    },
    {
      color: colorScales.magenta.light[9],
      title: '品红',
    },
    {
      color: colorScales.volcano.light[9],
      title: '火山红',
    },
  ];

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        ColorSwatches 组件演示
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 10 }}>选择的颜色: {selectedColor || '无'}</Text>

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
          colors={colors.slice(0, 8)}
          gap={6}
          onChange={(color) => console.log('方形选择:', color)}
          shape="square"
          size={28}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>小尺寸圆形:</Text>
        <ColorSwatches
          colors={colors.slice(0, 10)}
          gap={4}
          onChange={(color) => console.log('小尺寸选择:', color)}
          shape="circle"
          size={20}
        />
      </View>
    </View>
  );
};

export default ColorSwatchesDemo;
