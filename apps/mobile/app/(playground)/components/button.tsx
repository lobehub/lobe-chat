import React from 'react';

import ComponentPlayground, { DemoItem } from '@/mobile/app/(playground)/Playground';
import { BasicDemo, SizesDemo, StatesDemo, BlockDemo } from '@/mobile/components/Button/demos';

const BUTTON_README = `# Button 按钮组件

React Native版本的按钮组件，参考Ant Design设计，支持多种类型、尺寸和状态。

## 功能特性

- ✅ 多种按钮类型（Primary、Default、Text、Link）
- ✅ 三种尺寸（Small、Middle、Large）
- ✅ 加载状态支持
- ✅ 禁用状态支持
- ✅ 自定义样式支持
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import Button from '@/mobile/components/Button';

// 基础用法
<Button onPress={() => console.log('clicked')}>
  Default Button
</Button>

// Primary 按钮
<Button type="primary" onPress={() => console.log('clicked')}>
  Primary Button
</Button>

// 不同尺寸
<Button size="small">Small</Button>
<Button size="middle">Middle</Button>
<Button size="large">Large</Button>

// 加载状态
<Button loading onPress={() => console.log('clicked')}>
  Loading Button
</Button>

// 禁用状态
<Button disabled onPress={() => console.log('clicked')}>
  Disabled Button
</Button>

// 块级按钮
<Button block onPress={() => console.log('clicked')}>
  Block Button
</Button>
\`\`\`

## API

### ButtonProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | \`'primary' \\| 'default' \\| 'text' \\| 'link'\` | \`'default'\` | 按钮类型 |
| size | \`'small' \\| 'middle' \\| 'large'\` | \`'middle'\` | 按钮尺寸 |
| loading | \`boolean\` | \`false\` | 是否加载中 |
| disabled | \`boolean\` | \`false\` | 是否禁用 |
| block | \`boolean\` | \`false\` | 是否为块级按钮 |
| onPress | \`() => void\` | - | 点击回调 |
| style | \`ViewStyle\` | - | 容器样式 |
| textStyle | \`TextStyle\` | - | 文本样式 |
| children | \`ReactNode\` | - | 按钮内容 |

## 按钮类型

- \`primary\`: 主要按钮，用于主要操作
- \`default\`: 默认按钮，用于次要操作
- \`text\`: 文本按钮，用于轻量级操作
- \`link\`: 链接按钮，用于跳转操作

## 尺寸规格

- \`small\`: 小尺寸（24px 高度）
- \`middle\`: 中等尺寸（32px 高度）
- \`large\`: 大尺寸（40px 高度）
`;

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <SizesDemo />, key: 'sizes', title: '不同尺寸' },
  { component: <StatesDemo />, key: 'states', title: '按钮状态' },
  { component: <BlockDemo />, key: 'block', title: '块级按钮' },
];

export default function ButtonPlaygroundPage() {
  return (
    <ComponentPlayground
      demos={demos}
      readmeContent={BUTTON_README}
      subtitle="React Native版本的按钮组件"
      title="Button 按钮"
    />
  );
}
