# Space 间距

设置组件之间的间距。

## 何时使用

避免组件紧贴在一起，拉开统一的空间。

- 适合行内元素的水平间距。
- 可以设置各种水平对齐方式。
- 支持垂直间距。
- 支持自动换行。
- 支持在元素之间添加分隔符。

## 代码示例

### 基础用法

```jsx
import { Space, Text } from '@/components';

export default () => (
  <Space>
    <Text>Item 1</Text>
    <Text>Item 2</Text>
    <Text>Item 3</Text>
  </Space>
);
```

### 垂直间距

```jsx
import { Space, Text } from '@/components';

export default () => (
  <Space direction="vertical">
    <Text>Item 1</Text>
    <Text>Item 2</Text>
    <Text>Item 3</Text>
  </Space>
);
```

### 间距大小

支持 `small`、`middle`、`large` 和自定义尺寸。

```jsx
import { Space, Text } from '@/components';

export default () => (
  <>
    <Space size="small">
      <Text>small</Text>
      <Text>small</Text>
    </Space>

    <Space size="middle">
      <Text>middle</Text>
      <Text>middle</Text>
    </Space>

    <Space size="large">
      <Text>large</Text>
      <Text>large</Text>
    </Space>

    <Space size={20}>
      <Text>自定义尺寸</Text>
      <Text>自定义尺寸</Text>
    </Space>
  </>
);
```

### 对齐方式

设置对齐模式。

```jsx
import { Space, View, Text } from 'react-native';

export default () => (
  <Space align="center">
    <View style={{ height: 20 }}>
      <Text>Short</Text>
    </View>
    <View style={{ height: 40 }}>
      <Text>Medium</Text>
    </View>
    <View style={{ height: 60 }}>
      <Text>Long</Text>
    </View>
  </Space>
);
```

### 自动换行

自动换行。

```jsx
import { Space, View, Text } from 'react-native';

export default () => (
  <Space wrap>
    {Array.from({ length: 20 }).map((_, i) => (
      <View key={i} style={{ padding: 8, backgroundColor: '#f0f0f0' }}>
        <Text>Item {i}</Text>
      </View>
    ))}
  </Space>
);
```

### 分隔符

在元素之间设置分隔符。

```jsx
import { Space, Text } from '@/components';

export default () => (
  <Space split={<Text>|</Text>}>
    <Text>Item 1</Text>
    <Text>Item 2</Text>
    <Text>Item 3</Text>
  </Space>
);
```

## API

### Space

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| align | 对齐方式 | `'start' \| 'end' \| 'center' \| 'baseline'` | - |
| direction | 间距方向 | `'vertical' \| 'horizontal'` | `'horizontal'` |
| size | 间距大小 | `'small' \| 'middle' \| 'large' \| number \| [number, number]` | `'small'` |
| split | 设置拆分 | ReactNode | - |
| wrap | 是否自动换行，仅在 `horizontal` 时有效 | boolean | false |
| style | 自定义样式 | StyleProp<ViewStyle> | - |

```

```
