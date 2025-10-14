---
group: Display
title: Empty
description: 空状态展示组件，用于显示无数据或空内容的占位界面，支持自定义图标和描述文本。
---

## Features

- ✅ 支持自定义图标和图标大小
- ✅ 支持文本或自定义 ReactNode 描述
- ✅ 内置居中对齐布局
- ✅ 支持添加额外操作按钮
- ✅ 主题自动适配
- ✅ TypeScript 支持

## Basic Usage

```tsx
import { Empty } from '@lobehub/ui-rn';

<Empty description="暂无数据" />;
```

## API

### EmptyProps

| 属性          | 类型                  | 默认值      | 描述                         |
| ------------- | --------------------- | ----------- | ---------------------------- |
| `description` | `ReactNode \| string` | -           | 描述文本或自定义内容         |
| `icon`        | `IconProps['icon']`   | `InboxIcon` | 自定义图标，默认为收件箱图标 |
| `iconSize`    | `number`              | `32`        | 图标大小                     |
| `children`    | `ReactNode`           | -           | 额外的操作内容（如按钮）     |

继承 `FlexboxProps` 的所有属性，支持布局配置。

## Examples

### 基础用法

使用默认图标和描述文本展示空状态。

### 自定义图标

使用 Lucide 图标库中的任意图标。

### 自定义描述

使用自定义 ReactNode 作为描述内容。

### 带操作按钮

在空状态下添加操作按钮引导用户。
