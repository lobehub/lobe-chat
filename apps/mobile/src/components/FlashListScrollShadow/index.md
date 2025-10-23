---
group: Display
title: FlashListScrollShadow
description: A high-performance scrollable container component with gradient shadow effects at scroll edges, optimized for large lists using FlashList.
---

## Features

- ✅ 高性能列表渲染，基于 FlashList
- ✅ 自动检测滚动位置并显示 / 隐藏阴影
- ✅ 支持垂直和水平滚动方向
- ✅ 可自定义阴影大小和偏移量
- ✅ 支持始终显示、从不显示或自动模式
- ✅ TypeScript 类型支持
- ✅ 主题适配
- ✅ Ref 转发支持

## Basic Usage

```tsx
import FlashListScrollShadow from '@/components/FlashListScrollShadow';

<FlashListScrollShadow
  data={items}
  renderItem={({ item }) => <Text>{item.title}</Text>}
  estimatedItemSize={50}
/>;
```

## Props

### FlashListScrollShadowProps

继承自 `FlashListProps<T>` 并扩展以下属性：

| 属性                 | 类型                                    | 默认值       | 说明                       |
| -------------------- | --------------------------------------- | ------------ | -------------------------- |
| `orientation`        | `'vertical' \| 'horizontal'`            | `'vertical'` | 滚动方向                   |
| `size`               | `number`                                | `40`         | 阴影大小（0-100 的百分比） |
| `offset`             | `number`                                | `0`          | 滚动偏移量阈值             |
| `visibility`         | `'auto' \| 'always' \| 'never'`         | `'auto'`     | 阴影可见性模式             |
| `isEnabled`          | `boolean`                               | `true`       | 是否启用阴影效果           |
| `hideScrollBar`      | `boolean`                               | `false`      | 是否隐藏滚动条             |
| `onVisibilityChange` | `(visibility: VisibilityState) => void` | -            | 阴影可见性变化回调         |
| `ref`                | `ForwardedRef<FlashList<T>>`            | -            | FlashList 引用             |

### VisibilityState

```typescript
{
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}
```

## Examples

### Vertical List

```tsx
<FlashListScrollShadow
  data={items}
  renderItem={({ item }) => (
    <View style={{ padding: 16 }}>
      <Text>{item.title}</Text>
    </View>
  )}
  estimatedItemSize={60}
/>
```

### Horizontal List

```tsx
<FlashListScrollShadow
  data={items}
  orientation="horizontal"
  renderItem={({ item }) => (
    <View style={{ padding: 16 }}>
      <Text>{item.title}</Text>
    </View>
  )}
  estimatedItemSize={120}
/>
```

### Custom Shadow Size

```tsx
<FlashListScrollShadow
  data={items}
  renderItem={renderItem}
  estimatedItemSize={50}
  size={60} // 更大的阴影区域
/>
```

### Always Show Shadow

```tsx
<FlashListScrollShadow
  data={items}
  renderItem={renderItem}
  estimatedItemSize={50}
  visibility="always"
/>
```

### With Ref

```tsx
const listRef = useRef<FlashList<Item>>(null);

const scrollToTop = () => {
  listRef.current?.scrollToOffset({ offset: 0, animated: true });
};

<FlashListScrollShadow ref={listRef} data={items} renderItem={renderItem} estimatedItemSize={50} />;
```

## Notes

- 需要提供 `estimatedItemSize` 以获得最佳性能
- 阴影效果使用 `MaskedView` 和 `LinearGradient` 实现
- 当列表内容小于容器时，不会显示阴影
- 使用 `react-merge-refs` 支持 ref 转发和内部 ref 合并

## Performance Tips

1. 确保 `renderItem` 组件使用 `memo` 优化
2. 为列表项提供 `keyExtractor`
3. 使用准确的 `estimatedItemSize` 值
4. 避免在 `renderItem` 中执行昂贵的计算
5. 对于简单列表，考虑使用 `ScrollShadow` 组件

## Related Components

- [ScrollShadow](./ScrollShadow) - 基于 ScrollView 的滚动阴影组件，适用于简单内容
