const CARD_README = `# Card 卡片组件

用于展示分组信息的通用容器，支持标题与额外操作条、可选封面，以及 Block 的全部变体属性。

## 功能特性

- ✅ 标题与右侧额外操作共享一行排布
- ✅ 可选封面区域，自动处理圆角裁剪
- ✅ 内容插槽可放置任意 React Node
- ✅ 支持可选分隔线、背景变体、阴影等 Block 能力
- ✅ TypeScript 类型完备

## 基础用法

\`\`\`tsx
import { Button, Card, Space, Tag } from '@lobehub/ui-rn';
import { Text } from 'react-native';

export default () => (
  <Card
    extra={<Tag color="processing">Beta</Tag>}
    title="Custom Server"
  >
    <Text>自托管服务器允许将对话与模型设置同步到私有环境。</Text>
    <Space size="small">
      <Button size="small" type="default">
        Cancel
      </Button>
      <Button size="small" type="primary">
        Apply
      </Button>
    </Space>
  </Card>
);
\`\`\`

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| \`title\` | \`ReactNode\` | - | 卡片标题，文本时自动使用主题排版 |
| \`extra\` | \`ReactNode\` | - | 标题右侧的操作区 |
| \`cover\` | \`ReactNode\` | - | 封面内容，位于卡片顶部并保留圆角 |
| \`divider\` | \`boolean\` | \`true\` | 控制标题与内容之间分隔线 |

> 其余属性继承自 [Block](../Block) 组件，包含 \`variant\`、\`shadow\`、\`glass\`、\`onPress\`、\`padding\` 等能力。

## 分隔线控制

分隔线默认开启，可通过布尔值整体关闭。

\`\`\`tsx
<Card divider={false} title="无分隔线">
  <Text>标题与内容之间不会渲染分隔线。</Text>
</Card>
\`\`\`

## 封面配合

\`\`\`tsx
<Card
  cover={<Image source={{ uri: '...' }} style={{ height: 160 }} />}
  title="带封面的卡片"
/>
\`\`\`

封面区域会自动裁剪成圆角矩形，更适合作为图文卡片使用。
`;

export default CARD_README;
