import React from 'react';

import ComponentPlayground, { DemoItem } from '@/mobile/app/(playground)/Playground';
import { BasicDemo, ScrollingDemo, CategoriesDemo } from '@/mobile/components/CapsuleTabs/demos';

const CAPSULETABS_README = `# CapsuleTabs 组件

水平滚动的胶囊选项卡组件，支持自定义样式和选择状态。

## 功能特性

- ✅ 胶囊样式的选项卡设计
- ✅ 水平滚动支持
- ✅ 选择状态管理
- ✅ 自定义样式
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import { CapsuleTabs, CapsuleTabItem } from '@/mobile/components/CapsuleTabs';

const items: CapsuleTabItem[] = [
  { key: 'all', label: 'All' },
  { key: 'work', label: 'Work' },
  { key: 'personal', label: 'Personal' },
];

const [selectedKey, setSelectedKey] = useState('all');

<CapsuleTabs
  items={items}
  selectedKey={selectedKey}
  onSelect={setSelectedKey}
/>
\`\`\`

## API

### CapsuleTabsProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| items | \`CapsuleTabItem[]\` | - | 选项卡数据 |
| selectedKey | \`string\` | - | 当前选中的选项卡key |
| onSelect | \`(key: string) => void\` | - | 选择回调函数 |
| showsHorizontalScrollIndicator | \`boolean\` | \`false\` | 是否显示水平滚动条 |

### CapsuleTabItem

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| key | \`string\` | 选项卡唯一标识 |
| label | \`string\` | 选项卡显示文本 |
`;

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <ScrollingDemo />, key: 'scrolling', title: '水平滚动' },
  { component: <CategoriesDemo />, key: 'categories', title: '实际应用场景' },
];

export default function CapsuleTabsPlaygroundPage() {
  return (
    <ComponentPlayground
      demos={demos}
      readmeContent={CAPSULETABS_README}
      subtitle="水平滚动的胶囊选项卡组件"
      title="CapsuleTabs 胶囊选项卡"
    />
  );
}
