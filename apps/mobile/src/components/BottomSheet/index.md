---
group: Overlay
title: BottomSheet
description: 底部抽屉组件，用于从屏幕底部滑出内容，支持手势操作和多个快照点。基于 @gorhom/bottom-sheet 实现。
---

## Features

- ✅ 基于 `@gorhom/bottom-sheet` 构建，性能优异
- ✅ 支持多个快照点（snap points）
- ✅ 手势操作，支持拖动关闭
- ✅ 可自定义标题和关闭按钮
- ✅ 背景遮罩支持
- ✅ 动态内容高度
- ✅ 主题自适应
- ✅ TypeScript 支持

## Basic Usage

```tsx
import { BottomSheet } from '@lobehub/ui-rn';
import { useState } from 'react';
import { Button, Text, View } from 'react-native';

export default () => {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Button title="打开底部抽屉" onPress={() => setOpen(true)} />

      <BottomSheet open={open} title="底部抽屉标题" onClose={() => setOpen(false)}>
        <Text>这是底部抽屉的内容</Text>
      </BottomSheet>
    </View>
  );
};
```

## Custom Snap Points

你可以自定义快照点来控制抽屉的展开高度：

```tsx
<BottomSheet
  open={open}
  snapPoints={['25%', '50%', '90%']}
  initialSnapIndex={1}
  title="自定义快照点"
  onClose={() => setOpen(false)}
>
  <Text>拖动抽屉可以在 25%、50% 和 90% 高度之间切换</Text>
</BottomSheet>
```

## Without Close Button

不显示关闭按钮：

```tsx
<BottomSheet open={open} title="无关闭按钮" showCloseButton={false} onClose={() => setOpen(false)}>
  <Text>这个抽屉没有关闭按钮</Text>
</BottomSheet>
```

## Disable Pan to Close

禁用下拉关闭手势：

```tsx
<BottomSheet
  open={open}
  title="禁用下拉关闭"
  enablePanDownToClose={false}
  onClose={() => setOpen(false)}
>
  <Text>无法通过下拉手势关闭，只能点击关闭按钮</Text>
</BottomSheet>
```

## With Complex Content

底部抽屉可以包含复杂的内容：

```tsx
import { BottomSheet } from '@lobehub/ui-rn';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

<BottomSheet
  open={open}
  title="复杂内容"
  snapPoints={['50%', '90%']}
  onClose={() => setOpen(false)}
>
  <ScrollView style={styles.scrollContent}>
    {Array.from({ length: 20 }).map((_, i) => (
      <View key={i} style={styles.item}>
        <Text>列表项 {i + 1}</Text>
      </View>
    ))}
  </ScrollView>
</BottomSheet>;

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
```

## API

### BottomSheetProps

| 属性                  | 类型                                 | 默认值           | 说明                                         |
| --------------------- | ------------------------------------ | ---------------- | -------------------------------------------- |
| children              | `ReactNode`                          | -                | 底部抽屉的内容                               |
| title                 | `string \| ReactNode`                | -                | 底部抽屉标题                                 |
| showCloseButton       | `boolean`                            | `true`           | 是否显示关闭按钮                             |
| onClose               | `() => void`                         | -                | 关闭回调                                     |
| open                  | `boolean`                            | `false`          | 打开状态                                     |
| snapPoints            | `(string \| number)[]`               | `['50%', '90%']` | 快照点位置，可以是百分比字符串或数字（像素） |
| initialSnapIndex      | `number`                             | `0`              | 初始快照点索引                               |
| enablePanDownToClose  | `boolean`                            | `true`           | 是否启用手势关闭                             |
| enableBackdrop        | `boolean`                            | `true`           | 是否启用背景遮罩                             |
| backdropComponent     | `React.FC<BottomSheetBackdropProps>` | -                | 自定义背景遮罩组件                           |
| containerStyle        | `ViewStyle`                          | -                | 容器样式                                     |
| contentContainerStyle | `ViewStyle`                          | -                | 内容容器样式                                 |
| style                 | `ViewStyle`                          | -                | 底部抽屉样式                                 |
| onChange              | `(index: number) => void`            | -                | 快照点变化回调                               |
| animationConfigs      | `AnimationConfigs`                   | -                | 动画配置                                     |

## Notes

### Provider 配置

此组件依赖 `BottomSheetModalProvider`，确保在应用的根组件中已经配置：

```tsx
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function App() {
  return <BottomSheetModalProvider>{/* 你的应用内容 */}</BottomSheetModalProvider>;
}
```

在本项目中，`BottomSheetModalProvider` 已经在 `src/app/_layout.tsx` 中配置好了。

### Snap Points

- 快照点（Snap Points）定义了底部抽屉可以停靠的高度位置
- 可以使用百分比字符串（如 `'50%'`）或具体数字（如 `300`）
- 建议至少提供 2 个快照点
- 快照点应该从小到大排列

### 手势操作

- 拖动抽屉把手可以在不同快照点之间切换
- 向下拖动超过最小快照点会关闭抽屉（如果 `enablePanDownToClose` 为 `true`）
- 点击背景遮罩也会关闭抽屉（如果 `enableBackdrop` 为 `true`）

## Related Components

- [ActionIcon](./ActionIcon) - 用于关闭按钮
- [Text](./Text) - 用于标题文本
- [Flexbox](./Flexbox) - 用于布局
