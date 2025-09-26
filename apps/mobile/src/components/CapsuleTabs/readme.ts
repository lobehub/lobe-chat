const CAPSULETABS_README = `# CapsuleTabs 组件

水平滚动的胶囊选项卡组件，支持自定义样式、图标组合和选择状态。

## 功能特性

- ✅ 胶囊样式的选项卡设计
- ✅ 水平滚动支持
- ✅ 选择状态管理
- ✅ 图标和文本的组合展示
- ✅ 自定义样式
- ✅ 支持大 / 中 / 小三种尺寸
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import { Briefcase, Home } from 'lucide-react-native';

import { CapsuleTabs, CapsuleTabItem } from '@lobehub/ui-rn';

const items: CapsuleTabItem[] = [
  { key: 'all', label: 'All', icon: Home },
  { key: 'work', label: 'Work', icon: Briefcase },
  { key: 'personal', label: 'Personal' },
];

const [selectedKey, setSelectedKey] = useState('all');

<CapsuleTabs
  items={items}
  selectedKey={selectedKey}
  onSelect={setSelectedKey}
/>
\`\`\`

## 尺寸

通过 \`size\` 属性可以快速切换组件高度与字号，提供 \`large\`、\`middle\` 和 \`small\` 三种预设。

\`\`\`tsx
<CapsuleTabs items={items} selectedKey={selectedKey} onSelect={setSelectedKey} size="large" />
<CapsuleTabs items={items} selectedKey={selectedKey} onSelect={setSelectedKey} size="middle" />
<CapsuleTabs items={items} selectedKey={selectedKey} onSelect={setSelectedKey} size="small" />
\`\`\`

## API

### CapsuleTabsProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| items | \`CapsuleTabItem[]\` | - | 选项卡数据 |
| selectedKey | \`string\` | - | 当前选中的选项卡key |
| onSelect | \`(key: string) => void\` | - | 选择回调函数 |
| size | \`'large' | 'middle' | 'small'\` | \`'middle'\` | 控制胶囊高度与字体大小 |
| showsHorizontalScrollIndicator | \`boolean\` | \`false\` | 是否显示水平滚动条 |

### CapsuleTabItem

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| key | \`string\` | 选项卡唯一标识 |
| label | \`string\` | 选项卡显示文本 |
| icon | \`IconRenderable\` | 可选，选项卡前置图标 |
`;

export default CAPSULETABS_README;
