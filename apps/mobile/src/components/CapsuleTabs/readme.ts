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
import { CapsuleTabs, CapsuleTabItem } from '@/components/CapsuleTabs';

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

export default CAPSULETABS_README;
