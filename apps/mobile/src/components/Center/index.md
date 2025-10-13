# Center 居中组件

用于将子元素在容器中居中显示的组件，支持水平居中、垂直居中或完全居中。

## 功能特性

- ✅ 简单的居中布局
- ✅ 完全兼容 React Native
- ✅ 支持单独控制水平和垂直居中
- ✅ 支持设置最小尺寸
- ✅ 内置测试 ID 支持
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

```tsx
import { Center } from '@lobehub/ui-rn';

// 完全居中
<Center>
  <Component />
</Center>

// 只水平居中
<Center horizontal={true} vertical={false}>
  <Component />
</Center>

// 只垂直居中
<Center horizontal={false} vertical={true}>
  <Component />
</Center>

// 设置最小尺寸
<Center minHeight={150} minWidth={200}>
  <Component />
</Center>

// 填充模式
<Center block style={{ height: 200 }}>
  <Component />
</Center>
```

## API

### CenterProps

| 属性       | 类型                     | 默认值    | 说明               |                |
| ---------- | ------------------------ | --------- | ------------------ | -------------- |
| horizontal | \`boolean\`              | \`true\`  | 是否在水平方向居中 |                |
| vertical   | \`boolean\`              | \`true\`  | 是否在垂直方向居中 |                |
| block      | \`boolean\`              | \`false\` | 是否填充可用空间   |                |
| minHeight  | \`number \\              | string\`  | -                  | 容器的最小高度 |
| minWidth   | \`number \\              | string\`  | -                  | 容器的最小宽度 |
| children   | \`ReactNode\`            | -         | 子元素             |                |
| style      | \`StyleProp<ViewStyle>\` | -         | 自定义样式         |                |
| testID     | \`string\`               | -         | 测试 ID            |                |

## 使用场景

### 完全居中

适用于需要在容器中央显示内容的场景，如加载指示器、空状态提示等。

```tsx
<Center style={{ height: 200, backgroundColor: '#f0f0f0' }}>
  <LoadingSpinner />
</Center>
```

### 水平居中

适用于需要在水平方向居中，但垂直位置固定的场景，如页面标题。

```tsx
<Center horizontal={true} vertical={false} style={{ height: 100 }}>
  <Text>页面标题</Text>
</Center>
```

### 垂直居中

适用于需要在垂直方向居中，但水平位置固定的场景，如侧边栏内容。

```tsx
<Center horizontal={false} vertical={true} style={{ height: 100 }}>
  <NavigationMenu />
</Center>
```

### 多子元素居中

当有多个子元素时，它们会在容器中整体居中显示。

```tsx
<Center>
  <Text>标题</Text>
  <Text>副标题</Text>
  <Button title="操作按钮" />
</Center>
```

### 嵌套使用

可以与其他布局组件配合使用，实现复杂的布局效果。

```tsx
<Center style={{ height: 300, backgroundColor: '#f5f5f5' }}>
  <Center style={{ width: 200, height: 200, backgroundColor: 'white' }}>
    <Text>嵌套居中内容</Text>
  </Center>
</Center>
```
