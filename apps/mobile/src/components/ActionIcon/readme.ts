const ACTION_ICON_README = `# ActionIcon 操作图标组件

用于在界面中展示可点击的图标按钮，支持尺寸、变体、加载和禁用状态等配置，适合放在工具栏、卡片或列表中。

## 功能特性

- ✅ 支持三种内置尺寸，以及自定义尺寸
- ✅ 提供 borderless / filled / outlined 三种视觉变体
- ✅ 内置 Lucide LoaderCircle 加载动画
- ✅ 支持禁用状态和点击反馈
- ✅ 图标可传入组件或 ReactNode
- ✅ 支持自定义图标颜色
- ✅ TypeScript 完整类型定义

## 基础使用

\`\`\`tsx
import { ActionIcon } from '@lobehub/ui-rn';
import { MoreHorizontal } from 'lucide-react-native';

<ActionIcon icon={MoreHorizontal} onPress={() => console.log('more')} />;

// 尺寸
<ActionIcon icon={MoreHorizontal} size="small" />;
<ActionIcon icon={MoreHorizontal} size="middle" />;
<ActionIcon icon={MoreHorizontal} size="large" />;
<ActionIcon icon={MoreHorizontal} size={28} />;

// 变体
<ActionIcon icon={MoreHorizontal} variant="borderless" />;
<ActionIcon icon={MoreHorizontal} variant="filled" />;
<ActionIcon icon={MoreHorizontal} variant="outlined" />;

// 加载与禁用
<ActionIcon icon={MoreHorizontal} loading />;
<ActionIcon icon={MoreHorizontal} disabled />;

// 自定义颜色
<ActionIcon color="#F97316" icon={MoreHorizontal} />;
\`\`\`

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| icon | \`React.ComponentType<{ color?: string; size?: number }> \\| React.ReactNode\` | - | 要渲染的图标，可以是组件或节点 |
| color | \`ColorValue\` | - | 自定义图标颜色 |
| loading | \`boolean\` | \`false\` | 是否展示加载动画 |
| disabled | \`boolean\` | \`false\` | 是否禁用点击 |
| size | \`number \\| 'small' \\| 'middle' \\| 'large' \\| IconSizeConfig\` | \`'middle'\` | 图标尺寸配置 |
| variant | \`'borderless' \\| 'filled' \\| 'outlined'\` | \`'borderless'\` | 视觉风格 |
| style | \`PressableProps['style']\` | - | 自定义样式 |
| onPress | \`() => void\` | - | 点击回调 |

## 使用场景

- 工具栏中的快捷操作
- 列表项右侧的更多操作入口
- 卡片或弹窗中的次级操作按钮
- 自定义的图标按钮集合
`;

export default ACTION_ICON_README;
