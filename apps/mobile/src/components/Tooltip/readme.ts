const TOOLTIP_README = `# Tooltip 组件

参考 Ant Design 的 Tooltip 组件设计，为 React Native 应用提供功能完整的提示框组件。

## 功能特性

- ✅ 12种位置选择 (top, bottom, left, right 及其变体)
- ✅ 智能位置计算和自动调整
- ✅ 多种触发方式 (点击、长按、受控)  
- ✅ 流畅的动画效果
- ✅ 自定义样式和内容
- ✅ 箭头指向支持
- ✅ 屏幕边界检测和位置回退
- ✅ TypeScript 支持

## 基础使用

\`\`\`tsx
import { Tooltip } from '@/components/Tooltip';

// 基础用法
<Tooltip title="这是一个提示信息">
  <TouchableOpacity style={styles.button}>
    <Text>长按显示提示</Text>
  </TouchableOpacity>
</Tooltip>
\`\`\`

## API

### TooltipProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | \`string \\| ReactNode\` | - | 提示文字或自定义内容 |
| children | \`ReactNode\` | - | 子组件 |
| placement | \`TooltipPlacement\` | \`'top'\` | 气泡框位置 |
| trigger | \`TooltipTrigger\` | \`'longPress'\` | 触发行为 |
| arrow | \`boolean\` | \`true\` | 是否显示箭头 |
| color | \`string\` | \`'rgba(0, 0, 0, 0.85)'\` | 背景颜色 |

### TooltipPlacement

支持12种位置：

\`\`\`tsx
type TooltipPlacement = 
  | 'top' | 'topLeft' | 'topRight'
  | 'bottom' | 'bottomLeft' | 'bottomRight' 
  | 'left' | 'leftTop' | 'leftBottom'
  | 'right' | 'rightTop' | 'rightBottom';
\`\`\`

### TooltipTrigger

\`\`\`tsx
type TooltipTrigger = 'click' | 'longPress' | 'none';
\`\`\`
`;

export default TOOLTIP_README;
