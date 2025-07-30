import React from 'react';

import ComponentPlayground, { DemoItem } from '@/mobile/app/(playground)/Playground';
import { BasicDemo, SizesDemo, BordersDemo, ErrorDemo } from '@/mobile/components/Avatar/demos';

const AVATAR_README = `# Avatar 头像组件

可定制的头像组件，支持自定义尺寸、边框和错误处理。

## 功能特性

- ✅ 支持网络图片和本地图片
- ✅ 自定义尺寸
- ✅ 边框样式定制
- ✅ 图片加载错误处理
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import Avatar from '@/mobile/components/Avatar';

// 基础用法
<Avatar 
  avatar="https://github.com/lobehub.png" 
  alt="LobeHub" 
/>

// 自定义尺寸
<Avatar 
  avatar="https://github.com/lobehub.png" 
  alt="LobeHub" 
  size={48}
/>

// 添加边框
<Avatar 
  avatar="https://github.com/lobehub.png" 
  alt="LobeHub" 
  size={48}
  borderColor="#1677ff"
  borderWidth={2}
/>
\`\`\`

## API

### AvatarProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| avatar | \`string\` | - | 头像图片URL |
| alt | \`string\` | - | 图片描述文本 |
| size | \`number\` | \`40\` | 头像尺寸 |
| borderColor | \`string\` | - | 边框颜色 |
| borderWidth | \`number\` | - | 边框宽度 |
| style | \`ViewStyle\` | - | 容器样式 |
`;

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <BordersDemo />, key: 'borders', title: '边框样式' },
  { component: <ErrorDemo />, key: 'error', title: '错误处理' },
];

export default function AvatarPlaygroundPage() {
  return (
    <ComponentPlayground
      demos={demos}
      readmeContent={AVATAR_README}
      subtitle="可定制的头像组件"
      title="Avatar 头像"
    />
  );
}
