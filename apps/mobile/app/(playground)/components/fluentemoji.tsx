import React from 'react';

import ComponentPlayground, { DemoItem } from '../Playground';
import { BasicDemo, SizesDemo, ComparisonDemo, TypeDemo } from '@/components/FluentEmoji/demos';

const FLUENTEMOJI_README = `# FluentEmoji 表情符号组件

微软 Fluent 风格的 3D 表情符号组件，支持自定义大小和回退。

## 功能特性

- ✅ Fluent 3D 表情符号设计
- ✅ 自定义尺寸支持
- ✅ 原始表情符号回退
- ✅ 高质量图像渲染
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import FluentEmoji from '@/components/FluentEmoji';

// 基础用法
<FluentEmoji emoji="😊" size={40} />

// 自定义尺寸
<FluentEmoji emoji="🚀" size={64} />

// 使用原始表情符号
<FluentEmoji emoji="🎁" size={48} plainEmoji />

// 错误回退
<FluentEmoji emoji="🎨" size={40} fallback="🎨" />
\`\`\`

## API

### FluentEmojiProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| emoji | \`string\` | - | 表情符号字符 |
| size | \`number\` | \`24\` | 表情符号尺寸 |
| plainEmoji | \`boolean\` | \`false\` | 是否使用原始表情符号 |
| fallback | \`string\` | - | 加载失败时的回退表情符号 |
| style | \`ImageStyle\` | - | 图像样式 |

## 设计理念

FluentEmoji 组件提供了微软 Fluent 设计体系的 3D 表情符号，相比传统的平面表情符号，具有：

- 更丰富的视觉层次
- 更现代的设计风格  
- 更好的用户体验
- 跨平台的一致性

当 3D 表情符号加载失败时，会自动回退到原始的 Unicode 表情符号，确保功能的可用性。
`;

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <ComparisonDemo />, key: 'comparison', title: '3D vs 原始' },
  { component: <TypeDemo />, key: 'type', title: '不同类型' },
];

export default function FluentEmojiPlaygroundPage() {
  return (
    <ComponentPlayground
      demos={demos}
      readmeContent={FLUENTEMOJI_README}
      subtitle="微软 Fluent 风格的 3D 表情符号"
      title="FluentEmoji 表情符号"
    />
  );
}
