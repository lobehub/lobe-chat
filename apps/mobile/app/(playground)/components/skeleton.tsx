import React from 'react';

import ComponentPlayground, { DemoItem } from '@/mobile/app/(playground)/Playground';
import {
  BasicDemo,
  AvatarDemo,
  ParagraphDemo,
  ComplexDemo,
  AnimatedDemo,
  CompoundDemo,
} from '@/mobile/components/Skeleton/demos';

const SKELETON_README = `# Skeleton 骨架屏组件

React Native版本的骨架屏组件，参考Ant Design设计，用于页面加载状态显示。

## 功能特性

- ✅ 基础骨架屏显示
- ✅ 头像骨架屏支持
- ✅ 标题和段落骨架屏
- ✅ 动画效果支持
- ✅ 自定义行数和宽度
- ✅ 加载状态控制
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import Skeleton from '@/mobile/components/Skeleton';

// 基础用法
<Skeleton />

// 关闭动画
<Skeleton animated={false} />

// 加载完成显示内容
<Skeleton loading={false}>
  <Text>实际内容</Text>
</Skeleton>

// 带头像的骨架屏
<Skeleton avatar />

// 自定义头像
<Skeleton avatar={{ size: 64, shape: 'square' }} />

// 自定义段落
<Skeleton paragraph={{ rows: 5 }} />

// 自定义每行宽度
<Skeleton 
  paragraph={{ 
    width: ['100%', '90%', '75%', '50%'] 
  }} 
/>

// 使用复合组件
<Skeleton.Avatar size={48} shape="circle" />
<Skeleton.Title width="80%" />
<Skeleton.Paragraph rows={4} />
\`\`\`

## API

### SkeletonProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| loading | \`boolean\` | \`true\` | 是否显示加载状态 |
| avatar | \`boolean | { size?: number; shape?: 'circle' | 'square' }\` | \`false\` | 显示头像占位符 |
| title | \`boolean | { width?: number | string }\` | \`true\` | 显示标题占位符 |
| paragraph | \`boolean | { rows?: number; width?: number | string | Array<number | string> }\` | \`true\` | 显示段落占位符 |
| animated | \`boolean\` | \`true\` | 是否显示动画效果 |
| style | \`ViewStyle\` | - | 容器样式 |
| children | \`ReactNode\` | - | 加载完成后显示的内容 |
| backgroundColor | \`string\` | - | 自定义背景色 |
| highlightColor | \`string\` | - | 自定义高亮色 |

### Avatar 配置

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| size | \`number\` | \`40\` | 头像大小 |
| shape | \`'circle' | 'square'\` | \`'circle'\` | 头像形状 |

### Paragraph 配置

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| rows | \`number\` | \`3\` | 段落行数 |
| width | \`number | string | Array<number | string>\` | - | 每行宽度，可以是数组指定每行不同宽度 |

## 复合组件

### Skeleton.Avatar

独立的头像骨架屏组件。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| size | \`number\` | \`40\` | 头像大小 |
| shape | \`'circle' | 'square'\` | \`'circle'\` | 头像形状 |
| animated | \`boolean\` | \`false\` | 是否显示动画效果 |
| style | \`ViewStyle\` | - | 自定义样式 |
| backgroundColor | \`string\` | - | 自定义背景色 |
| highlightColor | \`string\` | - | 自定义高亮色 |

### Skeleton.Title

独立的标题骨架屏组件。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| width | \`number | string\` | \`'60%'\` | 标题宽度 |
| animated | \`boolean\` | \`false\` | 是否显示动画效果 |
| style | \`ViewStyle\` | - | 自定义样式 |
| backgroundColor | \`string\` | - | 自定义背景色 |
| highlightColor | \`string\` | - | 自定义高亮色 |

### Skeleton.Paragraph

独立的段落骨架屏组件。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| rows | \`number\` | \`3\` | 段落行数 |
| width | \`number | string | Array<number | string>\` | - | 每行宽度，可以是数组指定每行不同宽度 |
| animated | \`boolean\` | \`false\` | 是否显示动画效果 |
| style | \`ViewStyle\` | - | 自定义样式 |
| backgroundColor | \`string\` | - | 自定义背景色 |
| highlightColor | \`string\` | - | 自定义高亮色 |

## 使用场景

### 列表加载

适合在列表数据加载时显示骨架屏，提升用户体验。

### 卡片内容

在卡片内容加载时显示对应的骨架屏结构。

### 个人资料

使用头像+文字的组合展示个人资料加载状态。

### 文章内容

使用标题+段落的组合展示文章内容加载状态。

## 动画效果

组件支持渐变动画效果，通过 \`animated\` 属性控制开启或关闭。动画使用 React Native Animated API 实现，性能优良。

## 自定义样式

可以通过 \`backgroundColor\` 和 \`highlightColor\` 属性自定义骨架屏的颜色，也可以通过 \`style\` 属性自定义容器样式。
`;

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AnimatedDemo />, key: 'animated', title: '动画效果' },
  { component: <AvatarDemo />, key: 'avatar', title: '头像骨架屏' },
  { component: <ParagraphDemo />, key: 'paragraph', title: '段落骨架屏' },
  { component: <CompoundDemo />, key: 'compound', title: '复合组件' },
  { component: <ComplexDemo />, key: 'complex', title: '复杂示例' },
];

export default function SkeletonPlaygroundPage() {
  return (
    <ComponentPlayground
      demos={demos}
      readmeContent={SKELETON_README}
      subtitle="React Native版本的骨架屏组件"
      title="Skeleton 骨架屏"
    />
  );
}
