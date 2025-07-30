# Tooltip 组件

参考 Ant Design 的 Tooltip 组件设计，为 React Native 应用提供功能完整的提示框组件。

## 功能特性

- ✅ 12 种位置选择 (top, bottom, left, right 及其变体)
- ✅ 智能位置计算和自动调整
- ✅ 多种触发方式 (点击、长按、受控)
- ✅ 流畅的动画效果
- ✅ 自定义样式和内容
- ✅ 箭头指向支持
- ✅ 屏幕边界检测和位置回退
- ✅ TypeScript 支持

## 基础使用

```tsx
import { Tooltip } from '@/components/Tooltip';

// 基础用法
<Tooltip title="这是一个提示信息">
  <TouchableOpacity style={styles.button}>
    <Text>长按显示提示</Text>
  </TouchableOpacity>
</Tooltip>;
```

## API

### TooltipProps

| 属性            | 类型                         | 默认值                  | 说明                 |
| --------------- | ---------------------------- | ----------------------- | -------------------- |
| title           | `string \| ReactNode`        | -                       | 提示文字或自定义内容 |
| children        | `ReactNode`                  | -                       | 子组件               |
| placement       | `TooltipPlacement`           | `'top'`                 | 气泡框位置           |
| trigger         | `TooltipTrigger`             | `'longPress'`           | 触发行为             |
| arrow           | `boolean`                    | `true`                  | 是否显示箭头         |
| color           | `string`                     | `'rgba(0, 0, 0, 0.85)'` | 背景颜色             |
| visible         | `boolean`                    | -                       | 是否可见（受控模式） |
| onVisibleChange | `(visible: boolean) => void` | -                       | 显示隐藏的回调       |
| overlayStyle    | `ViewStyle`                  | -                       | 自定义提示框样式     |
| textStyle       | `TextStyle`                  | -                       | 自定义文字样式       |
| zIndex          | `number`                     | `1000`                  | 层级                 |

### TooltipPlacement

支持 12 种位置：

```tsx
type TooltipPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';
```

### TooltipTrigger

```tsx
type TooltipTrigger = 'click' | 'longPress' | 'none';
```

- `click`: 点击触发
- `longPress`: 长按触发
- `none`: 手动控制（配合 visible 属性）

## 使用示例

### 1. 不同触发方式

```tsx
// 点击触发
<Tooltip title="点击触发" trigger="click">
  <TouchableOpacity style={styles.button}>
    <Text>点击显示</Text>
  </TouchableOpacity>
</Tooltip>

// 长按触发
<Tooltip title="长按触发" trigger="longPress">
  <TouchableOpacity style={styles.button}>
    <Text>长按显示</Text>
  </TouchableOpacity>
</Tooltip>
```

### 2. 受控模式

```tsx
const [visible, setVisible] = useState(false);

<Tooltip title="受控的提示信息" visible={visible} onVisibleChange={setVisible} trigger="none">
  <TouchableOpacity style={styles.button}>
    <Text>受控组件</Text>
  </TouchableOpacity>
</Tooltip>;
```

### 3. 不同位置

```tsx
<Tooltip title="顶部提示" placement="top">
  <TouchableOpacity style={styles.button}>
    <Text>顶部</Text>
  </TouchableOpacity>
</Tooltip>

<Tooltip title="底部提示" placement="bottom">
  <TouchableOpacity style={styles.button}>
    <Text>底部</Text>
  </TouchableOpacity>
</Tooltip>
```

### 4. 自定义样式

```tsx
<Tooltip
  title="自定义颜色"
  color="#ff4d4f"
  textStyle={{ fontSize: 16, fontWeight: 'bold' }}
  overlayStyle={{ padding: 12 }}
>
  <TouchableOpacity style={styles.button}>
    <Text>自定义样式</Text>
  </TouchableOpacity>
</Tooltip>
```

### 5. 自定义内容

```tsx
<Tooltip
  title={
    <View>
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>自定义标题</Text>
      <Text style={{ color: '#fff', fontSize: 12 }}>这里可以放置任何内容</Text>
    </View>
  }
>
  <TouchableOpacity style={styles.button}>
    <Text>自定义内容</Text>
  </TouchableOpacity>
</Tooltip>
```

### 6. 无箭头

```tsx
<Tooltip title="无箭头提示" arrow={false}>
  <TouchableOpacity style={styles.button}>
    <Text>无箭头</Text>
  </TouchableOpacity>
</Tooltip>
```

## 高级特性

### 智能位置计算

组件会自动检测屏幕边界，当指定位置无法完全显示时，会按照以下优先级自动调整：

1. 尝试首选位置
2. 尝试备选位置 (top → bottom → left → right)
3. 强制调整到屏幕边界内

### 动画效果

- 显示：淡入 + 缩放动画
- 隐藏：淡出 + 缩放动画
- 动画时长：显示 150ms，隐藏 100ms

### 性能优化

- 使用 `useCallback` 优化回调函数
- 使用 `useMemo` 优化位置计算
- 使用 `useNativeDriver` 提升动画性能

## 注意事项

1. 组件使用绝对定位，确保父容器有足够空间
2. 长文本会自动换行，最大宽度为 250px
3. 在滚动容器中使用时，需要注意位置计算的准确性
4. 建议在应用根组件附近使用，避免 z-index 问题

## 依赖

- react-native-safe-area-context (用于安全区域计算)
- React Native 0.60+
