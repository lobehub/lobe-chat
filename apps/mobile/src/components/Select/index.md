---
group: Form
title: Select
description: 选择器组件，基于 BottomSheet 实现的移动端友好的下拉选择。
---

## Features

- ✅ 基于 BottomSheet 的移动端友好交互
- ✅ 支持图标和自定义内容
- ✅ 支持禁用状态（整体和单个选项）
- ✅ 支持受控和非受控模式
- ✅ 支持自定义选项渲染
- ✅ 支持多种尺寸和样式变体
- ✅ TypeScript 支持
- ✅ 主题适配

## Basic Usage

```tsx
import { Select } from '@lobehub/ui-rn';
import { Apple, Coffee } from 'lucide-react-native';

const options = [
  {
    icon: <Apple size={20} />,
    title: '苹果',
    value: 'apple',
  },
  {
    icon: <Coffee size={20} />,
    title: '咖啡',
    value: 'coffee',
  },
];

<Select onChange={(value) => console.log('Selected:', value)} options={options} title="选择项目" />;
```

## API

### SelectProps

| 属性         | 类型                                                   | 默认值             | 说明               |
| ------------ | ------------------------------------------------------ | ------------------ | ------------------ |
| options      | `SelectOptionItem[]`                                   | -                  | 选项列表（必填）   |
| value        | `string \| number`                                     | -                  | 受控模式的值       |
| defaultValue | `string \| number`                                     | `options[0].value` | 默认选中的值       |
| onChange     | `(value: string \| number) => void`                    | -                  | 值变化回调         |
| title        | `string`                                               | `'请选择'`         | BottomSheet 标题   |
| size         | `'small' \| 'middle' \| 'large'`                       | `'middle'`         | 选择器尺寸         |
| variant      | `'filled' \| 'outlined' \| 'borderless'`               | 根据主题自动       | 样式变体           |
| disabled     | `boolean`                                              | `false`            | 是否禁用整个选择器 |
| optionRender | `(item: SelectOptionItem, index: number) => ReactNode` | -                  | 自定义选项渲染函数 |
| style        | `StyleProp<ViewStyle>`                                 | -                  | 自定义样式         |

### SelectOptionItem

| 属性     | 类型                  | 默认值  | 说明             |
| -------- | --------------------- | ------- | ---------------- |
| value    | `string \| number`    | -       | 选项的值（必填） |
| title    | `string \| ReactNode` | -       | 选项标题（必填） |
| icon     | `ReactNode`           | -       | 选项图标         |
| disabled | `boolean`             | `false` | 是否禁用该选项   |

## Examples

### 基础用法

最简单的用法，提供选项列表。

```tsx
import { Select } from '@lobehub/ui-rn';
import { Apple, Coffee, Utensils } from 'lucide-react-native';
import { useState } from 'react';

const [value, setValue] = useState('apple');

const options = [
  { icon: <Apple size={20} />, title: '苹果', value: 'apple' },
  { icon: <Coffee size={20} />, title: '咖啡', value: 'coffee' },
  { icon: <Utensils size={20} />, title: '餐具', value: 'utensils' },
];

<Select onChange={setValue} options={options} value={value} />;
```

### 不同尺寸

通过 `size` 属性控制选择器的尺寸。

```tsx
<Select options={options} size="small" />
<Select options={options} size="middle" />
<Select options={options} size="large" />
```

### 不同变体

通过 `variant` 属性控制样式变体。

```tsx
<Select options={options} variant="filled" />
<Select options={options} variant="outlined" />
<Select options={options} variant="borderless" />
```

### 禁用状态

可以禁用整个选择器，也可以禁用单个选项。

```tsx
// 禁用整个选择器
<Select disabled options={options} />;

// 禁用部分选项
const options = [
  { title: '选项 1', value: '1' },
  { title: '选项 2', value: '2' },
  { title: '禁用选项', value: '3', disabled: true },
];

<Select options={options} />;
```

### 自定义渲染

使用 `optionRender` 自定义选项的渲染方式。

```tsx
<Select
  options={options}
  optionRender={(item) => (
    <View>
      <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
      <Text style={{ fontSize: 12, color: 'gray' }}>Value: {item.value}</Text>
    </View>
  )}
/>
```

### 受控模式

通过 `value` 和 `onChange` 实现受控组件。

```tsx
const [value, setValue] = useState('option1');

<Select onChange={setValue} options={options} value={value} />;
```

### 非受控模式

使用 `defaultValue` 设置初始值。

```tsx
<Select
  defaultValue="option2"
  onChange={(value) => console.log('Changed to:', value)}
  options={options}
/>
```

## Notes

- Select 组件基于 `BottomSheet` 组件实现，在移动端提供了更友好的交互体验
- 点击选择器会弹出 BottomSheet 展示所有选项
- 默认情况下，如果没有提供 `defaultValue` 或 `value`，会自动选中第一个选项
- 当选项被禁用时（`disabled: true`），该选项会显示为灰色且不可点击
- `title` 属性控制 BottomSheet 的标题，默认为 "请选择"
- 可以通过 `optionRender` 完全自定义选项的渲染逻辑

## Related Components

- [BottomSheet](../BottomSheet/index.md) - 底部抽屉组件
- [Block](../Block/index.md) - 容器组件
- [Flexbox](../Flexbox/index.md) - 弹性布局组件
