---
group: Layout
title: Divider
description: 分割线组件，用于在内容区域进行视觉分隔，支持水平和垂直两种方向。
---

## Features

- ✅ 支持水平和垂直两种方向
- ✅ 使用 hairline 细线效果
- ✅ 主题自动适配
- ✅ 轻量级实现
- ✅ TypeScript 支持

## Basic Usage

```tsx
import { Divider } from '@lobehub/ui-rn';

<Divider />;
```

## API

### DividerProps

| 属性   | 类型                         | 默认值         | 描述       |
| ------ | ---------------------------- | -------------- | ---------- |
| `type` | `'horizontal' \| 'vertical'` | `'horizontal'` | 分割线方向 |

继承 `ViewProps` 的所有属性（除了 `children`），支持自定义样式。

## Examples

### 基础用法

默认的水平分割线。

### 垂直分割线

使用垂直分割线分隔水平排列的内容。

### 内容分组

使用分割线对内容进行分组。

### 自定义样式

通过 style 属性自定义分割线的颜色和粗细。
