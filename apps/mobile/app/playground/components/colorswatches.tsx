import React from 'react';

import ComponentPlayground, { DemoItem } from '../Playground';
import BasicDemo from '@/components/ColorSwatches/demos/basic';
import { Header } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyles } from './style';

const COLORSWATCHES_README = `# ColorSwatches 颜色选择器组件

React Native版本的颜色选择器组件，基于 LobeUI 的 ColorSwatches 组件重写。

## 功能特性

- ✅ 支持多种颜色预设
- ✅ 圆形/方形两种样式
- ✅ 可自定义尺寸和间距
- ✅ 透明色支持
- ✅ 选中状态显示
- ✅ 可访问性支持
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import { ColorSwatches } from '@/components';

// 基础用法
<ColorSwatches
  colors={[
    { color: '#ff0000', title: '红色' },
    { color: '#00ff00', title: '绿色' },
    { color: '#0000ff', title: '蓝色' },
  ]}
  onChange={(color) => console.log(color)}
/>

// 方形样式
<ColorSwatches
  colors={colors}
  shape="square"
  size={28}
  gap={8}
  onChange={handleColorChange}
/>

// 透明色支持
<ColorSwatches
  colors={[
    { color: 'rgba(0, 0, 0, 0)', title: '透明' },
    { color: '#ff0000', title: '红色' },
  ]}
  onChange={handleColorChange}
/>
\`\`\`

## API

### ColorSwatchesProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| colors | \`ColorSwatchesItemType[]\` | - | 颜色数组 |
| value | \`string\` | - | 当前选中的颜色 |
| defaultValue | \`string\` | - | 默认选中的颜色 |
| onChange | \`(color?: string) => void\` | - | 颜色改变回调 |
| size | \`number\` | \`24\` | 色块尺寸 |
| shape | \`'circle' \\| 'square'\` | \`'circle'\` | 色块形状 |
| gap | \`number\` | \`6\` | 色块间距 |
| enableColorSwatches | \`boolean\` | \`true\` | 是否显示色块 |
| style | \`ViewStyle\` | - | 容器样式 |

### ColorSwatchesItemType

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| color | \`string\` | 颜色值 |
| title | \`ReactNode\` | 颜色标题（用于无障碍） |
| key | \`string \\| number\` | 唯一标识 |

## 核心特性

### 颜色系统集成

ColorSwatches 与项目的颜色系统完全集成，支持：
- 预定义色彩调色板
- 主题色适配
- 深色模式支持

### 透明色处理

组件对透明色有特殊处理：
- 自动检测透明色
- 特殊样式标识透明色
- 正确的对比色计算

### 可访问性

组件提供完善的可访问性支持：
- 屏幕阅读器支持
- 键盘导航
- 色彩描述标签

## 样式定制

### 尺寸配置

- \`size\`: 控制色块大小
- \`gap\`: 控制色块间距
- \`shape\`: 控制色块形状（圆形/方形）

### 自定义样式

通过 \`style\` prop 可以自定义容器样式：

\`\`\`tsx
<ColorSwatches
  colors={colors}
  style={{
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  }}
/>
\`\`\`
`;

const demos: DemoItem[] = [
  {
    component: <BasicDemo />,
    key: 'basic',
    title: '基础演示',
  },
];

export default function ColorSwatchesPlayground() {
  const { styles } = useStyles();
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaView}>
      <Header showBack title="ColorSwatches 颜色选择器" />
      <ComponentPlayground
        demos={demos}
        readmeContent={COLORSWATCHES_README}
        subtitle="基于 LobeUI 重写的 React Native 颜色选择器组件"
        title="ColorSwatches 颜色选择器"
      />
    </SafeAreaView>
  );
}
