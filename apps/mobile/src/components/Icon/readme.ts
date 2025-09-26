const ICON_README = `# Icon 图标组件

用于封装常用的图标渲染逻辑，统一尺寸、旋转动画与颜色控制。支持直接传入 Lucide 图标组件或任意 React 节点，并可选开启旋转动画。

## 功能特性

- ✅ 默认适配 \`lucide-react-native\` 图标，同时支持传入自定义组件或节点
- ✅ 统一的颜色与尺寸控制
- ✅ 可选的旋转动画（\`spin\`）
- ✅ TypeScript 类型提示友好
- ✅ 可与 ActionIcon 等按钮类组件搭配使用

## 基础使用

\`\`\`tsx
import { Icon } from '@lobehub/ui-rn';
import { Star } from 'lucide-react-native';

<Icon icon={Star} />;
<Icon icon={Star} size="large" color="#FADB14" />;
<Icon icon={Star} spin />;

// 也可以传入 React 节点
import { createElement } from 'react';

<Icon icon={createElement(Star, { size: 20 })} />;
\`\`\`

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| icon | \`LucideIcon \\| React.ComponentType<any> \\| React.ReactNode\` | - | 要渲染的图标 |
| size | \`number \\| 'small' \\| 'middle' \\| 'large' \\| IconSizeConfig\` | \`'middle'\` | 图标尺寸（宽高） |
| color | \`ColorValue\` | - | 图标颜色，可覆盖主题色 |
| spin | \`boolean\` | \`false\` | 是否启用旋转动画 |
| style | \`StyleProp<ViewStyle>\` | - | 外层容器样式 |

## 使用场景

- 单独渲染图标展示状态
- 作为 ActionIcon 或 Button 的补充构件
- 在加载状态中展示旋转的提示图标
- 与颜色面板搭配展示示例色彩
`;

export default ICON_README;
