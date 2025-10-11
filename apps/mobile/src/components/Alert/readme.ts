const ALERT_README = `# Alert 提示组件

基于 Ant Design Alert 设计的 React Native 提示组件，用于展示重要的操作反馈信息。

## 功能特性

- ✅ 支持 \`info\`、\`success\`、\`warning\`、\`error\` 四种状态样式
- ✅ 允许展示说明文本、操作按钮与自定义图标
- ✅ 支持可关闭提示以及关闭回调
- ✅ 主题适配，自动继承语义色
- ✅ 完整的 TypeScript 类型定义

## 基础使用

\`\`\`tsx
import { Alert } from '@lobehub/ui-rn';

<Alert message="默认提醒" />

import { Alert, Button, Icon } from '@lobehub/ui-rn';
import { Info } from 'lucide-react-native';

<Alert
  description="支持描述信息，适用于需要提供额外说明的场景。"
  message="信息提示"
/>
\`\`\`

## 类型示例

\`\`\`tsx
<Alert message="信息提示" type="info" />
<Alert message="成功提示" type="success" />
<Alert message="警告提示" type="warning" />
<Alert message="错误提示" type="error" />
\`\`\`

## 可关闭

\`\`\`tsx
<Alert closable message="操作成功" type="success" />

<Alert
  closable
  description="提示信息在关闭时会触发 onClose 回调。"
  message="需要操作的提示"
  onClose={() => console.log('Alert closed')}
/>
\`\`\`

## 自定义图标与操作

\`\`\`tsx
<Alert
  action={<Button size="small" type="primary">查看详情</Button>}
  description="可以将操作按钮放置在提示内部，引导用户下一步操作。"
  icon={<Icon icon={Info} size={20} />}
  message="自定义内容"
  type="info"
/>
\`\`\`

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| \`message\` | \`ReactNode\` | (必填) | 提示标题内容 |
| \`description\` | \`ReactNode\` | - | 额外的描述内容 |
| \`type\` | \`'info' \\| 'success' \\| 'warning' \\| 'error'\` | \`'info'\` | 提示的语义类型 |
| \`showIcon\` | \`boolean\` | \`true\` | 是否展示状态图标 |
| \`icon\` | \`ReactNode\` | - | 自定义图标 |
| \`action\` | \`ReactNode\` | - | 额外操作区域 |
| \`closable\` | \`boolean\` | \`false\` | 是否显示关闭按钮 |
| \`closeIcon\` | \`IconRenderable\` | - | 自定义关闭图标 |
| \`onClose\` | \`() => void\` | - | 点击关闭时的回调 |
| \`style\` | \`StyleProp<ViewStyle>\` | - | 容器样式 |

`;

export default ALERT_README;
