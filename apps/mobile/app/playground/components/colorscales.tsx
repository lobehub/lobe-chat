import React from 'react';
import { ScrollView, View, Text } from 'react-native';

import ColorScales from '@/components/ColorScales';
import { useThemeToken, colorScales } from '@/theme';

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

// Token 使用演示
const TokenDemo = () => {
  const token = useThemeToken();

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} style={{ flex: 1 }}>
      <View style={{ gap: 16 }}>
        <Text style={{ color: token.colorText, fontSize: 18, fontWeight: 'bold' }}>
          颜色级别 Token 使用示例
        </Text>

        {/* Primary 颜色示例 */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: token.colorText, fontSize: 16, fontWeight: '600' }}>
            Primary 色系
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((level) => (
              <View key={level} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: (token as any)[`primary${level}`],
                    borderRadius: 4,
                    height: 32,
                    marginBottom: 4,
                    width: 32,
                  }}
                />
                <Text style={{ color: token.colorTextSecondary, fontSize: 10 }}>
                  primary{level}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Red 颜色示例 */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: token.colorText, fontSize: 16, fontWeight: '600' }}>Red 色系</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((level) => (
              <View key={level} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: (token as any)[`red${level}`],
                    borderRadius: 4,
                    height: 32,
                    marginBottom: 4,
                    width: 32,
                  }}
                />
                <Text style={{ color: token.colorTextSecondary, fontSize: 10 }}>red{level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 透明色示例 */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: token.colorText, fontSize: 16, fontWeight: '600' }}>
            透明色系 (Alpha)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[1, 3, 5, 7, 9, 11].map((level) => (
              <View key={level} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: (token as any)[`primary${level}A`],
                    borderColor: token.colorBorder,
                    borderRadius: 4,
                    borderWidth: 1,
                    height: 32,
                    marginBottom: 4,
                    width: 32,
                  }}
                />
                <Text style={{ color: token.colorTextSecondary, fontSize: 10 }}>
                  primary{level}A
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 使用说明 */}
        <View style={{ gap: 8, marginTop: 16 }}>
          <Text style={{ color: token.colorText, fontSize: 16, fontWeight: '600' }}>使用说明</Text>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, lineHeight: 20 }}>
            现在你可以直接使用以下颜色 token：{'\n'}• token.primary1 ~ token.primary11{'\n'}•
            token.red1A ~ token.red11A{'\n'}• token.blue1Dark ~ token.blue11Dark{'\n'}•
            token.green1DarkA ~ token.green11DarkA{'\n'}
            等等，支持所有颜色类型的所有级别
          </Text>
        </View>
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
- ✅ 垂直滚动支持（移动端优化）
- ✅ TypeScript 支持
- ✅ **新增：颜色级别 Token 自动生成**

## 基础使用

\`\`\`tsx
import { ColorScales } from '@/theme/color';
import { colorScales } from '@/theme/color';

export default () => (
  <ColorScales 
    name="primary" 
    scale={colorScales.primary} 
    midHighLight={9} 
  />
);
\`\`\`

## 颜色级别 Token 使用

现在你可以直接在组件中使用颜色级别 token：

\`\`\`tsx
import { useThemeToken } from '@/theme';

const MyComponent = () => {
  const token = useThemeToken();
  
  return (
    <View style={{
      backgroundColor: token.primary1,     // 主色级别1
      borderColor: token.red5,            // 红色级别5
      shadowColor: token.blue3A,          // 蓝色级别3透明
    }}>
      <Text style={{ color: token.gray9 }}>
        使用颜色级别 token
      </Text>
    </View>
  );
};
\`\`\`

## 可用的 Token 格式

- **基础色**: \`token.{colorName}{level}\` (例如: \`token.primary5\`)
- **透明色**: \`token.{colorName}{level}A\` (例如: \`token.red3A\`)
- **深色模式**: \`token.{colorName}{level}Dark\` (例如: \`token.blue7Dark\`)
- **深色透明**: \`token.{colorName}{level}DarkA\` (例如: \`token.green9DarkA\`)

其中：
- \`colorName\`: primary, red, blue, green, cyan, geekblue, gold, gray, lime, magenta, orange, purple, volcano, yellow
- \`level\`: 1-11

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
- 支持垂直滚动查看完整色板

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
  {
    component: <TokenDemo />,
    key: 'token',
    title: 'Token 使用',
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
