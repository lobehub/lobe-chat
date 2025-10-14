---
group: Form
title: Segmented
description: 分段控制器组件，用于展示并选择多个选项中的一个，适用于在少量选项之间切换。
---

## Features

- ✅ 平滑的选中指示器滑动动画
- ✅ 文本颜色和字重渐变动画
- ✅ 支持字符串、数字和自定义节点作为选项
- ✅ 支持图标配置（可单独使用或与文本组合）
- ✅ 支持垂直和水平排列
- ✅ 提供多种尺寸（small、middle、large）
- ✅ 支持圆角和默认两种形状
- ✅ 支持禁用状态和单个选项禁用
- ✅ 受控和非受控两种模式
- ✅ TypeScript 支持
- ✅ 主题适配

## Basic Usage

```tsx
import { Segmented } from '@lobehub/ui-rn';
import { useState } from 'react';

const Demo = () => {
  const [value, setValue] = useState('iOS');

  return <Segmented options={['iOS', 'Android', 'Web']} value={value} onChange={setValue} />;
};
```

## API

### SegmentedProps

| 属性         | 类型                                          | 默认值      | 描述                         |
| ------------ | --------------------------------------------- | ----------- | ---------------------------- |
| block        | `boolean`                                     | `false`     | 将宽度调整为父元素宽度的选项 |
| defaultValue | `string \| number`                            | -           | 默认选中的值                 |
| disabled     | `boolean`                                     | `false`     | 是否禁用                     |
| onChange     | `(value: string \| number) => void`           | -           | 选项变化时的回调函数         |
| options      | `string[] \| number[] \| SegmentedItemType[]` | `[]`        | 数据化配置选项内容           |
| size         | `'small' \| 'middle' \| 'large'`              | `'middle'`  | 控件尺寸                     |
| vertical     | `boolean`                                     | `false`     | 排列方向                     |
| value        | `string \| number`                            | -           | 当前选中的值                 |
| shape        | `'default' \| 'round'`                        | `'default'` | 形状样式                     |
| style        | `ViewStyle`                                   | -           | 自定义样式                   |

### SegmentedItemType

| 属性     | 类型                  | 默认值  | 描述             |
| -------- | --------------------- | ------- | ---------------- |
| label    | `ReactNode \| string` | -       | 分段项的显示文本 |
| value    | `string \| number`    | -       | 分段项的值       |
| icon     | `IconProps['icon']`   | -       | 分段项的显示图标 |
| disabled | `boolean`             | `false` | 分段项的禁用状态 |
