import React from 'react';
import { ScrollView, View } from 'react-native';

import { colorScales, ColorScales } from '@/theme/color';

import ComponentPlayground, { type DemoItem } from '../Playground';

// 基础演示组件
const BasicDemo = () => {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} style={{ flex: 1 }}>
      <View style={{ gap: 32 }}>
        <ColorScales midHighLight={9} name="primary" scale={colorScales.primary} />
        <ColorScales midHighLight={9} name="red" scale={colorScales.red} />
        <ColorScales midHighLight={9} name="blue" scale={colorScales.blue} />
        <ColorScales midHighLight={9} name="green" scale={colorScales.green} />
      </View>
    </ScrollView>
  );
};

// 完整色板演示
const FullDemo = () => {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} style={{ flex: 1 }}>
      <View style={{ gap: 32 }}>
        {Object.entries(colorScales).map(([name, scale]) => (
          <ColorScales key={name} midHighLight={9} name={name} scale={scale} />
        ))}
      </View>
    </ScrollView>
  );
};

const COLORSCALES_README = `# ColorScales 色板组件

React Native版本的色板展示组件，基于 LobeUI 的 ColorScales 组件重写。

## 功能特性

- ✅ 展示完整的颜色级别
- ✅ 支持 light/lightA/dark/darkA 四种模式
- ✅ 高亮中间色级
- ✅ 点击复制颜色值
- ✅ 透明色支持
- ✅ 水平滚动支持
- ✅ TypeScript 支持

## 基础使用

\`\`\`tsx
import { ColorScales } from '@/color';
import { colorScales } from '@/theme/color';

export default () => (
  <ColorScales 
    name="primary" 
    scale={colorScales.primary} 
    midHighLight={9} 
  />
);
\`\`\`

## API

### ColorScales

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| name | \`string\` | - | 色板名称 |
| scale | \`ColorScaleItem\` | - | 色板数据对象 |
| midHighLight | \`number\` | - | 高亮的中间色级索引 |

### ColorScaleItem

\`\`\`tsx
interface ColorScaleItem {
  light: string[];   // 浅色模式颜色数组
  lightA: string[];  // 浅色模式透明颜色数组
  dark: string[];    // 深色模式颜色数组
  darkA: string[];   // 深色模式透明颜色数组
}
\`\`\`

## 色板类型

组件支持四种色板模式：

- **light**: 浅色模式实色
- **lightA**: 浅色模式透明色
- **dark**: 深色模式实色  
- **darkA**: 深色模式透明色

## 交互功能

- 点击任意色块可复制对应的 token 值
- 复制格式：\`token.colorName + index + (A?) /* #hex */\`
- 支持水平滚动查看完整色板

## 可用色板

当前支持的色板包括：
${Object.keys(colorScales)
  .map((name) => `- ${name}`)
  .join('\n')}
`;

const demos: DemoItem[] = [
  {
    component: <BasicDemo />,
    key: 'basic',
    title: '基础演示',
  },
  {
    component: <FullDemo />,
    key: 'full',
    title: '完整色板',
  },
];

export default function ColorScalesPlayground() {
  return (
    <ComponentPlayground
      demos={demos}
      readmeContent={COLORSCALES_README}
      subtitle="基于 LobeUI 重写的 React Native 色板展示组件"
      title="ColorScales 色板"
    />
  );
}
