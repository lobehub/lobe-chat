---
group: Data Display
title: MaterialFileTypeIcon
description: MaterialFileTypeIcon 用于显示基于文件扩展名或文件夹名称的 Material Design 风格图标。支持多种文件类型，并提供不同的视觉变体。
---

## Features

- ✅ 支持 4000+ 文件类型和文件夹识别
- ✅ Material Design 风格图标
- ✅ 三种显示变体（原始、文件、文件夹）
- ✅ 自动回退到通用图标
- ✅ 文件夹展开 / 收起状态支持
- ✅ TypeScript 类型支持

## Basic Usage

```tsx
import { MaterialFileTypeIcon } from '@lobehub/ui-rn';

<MaterialFileTypeIcon filename="index.tsx" type="file" />;
```

## API

| 属性                | 描述                                   | 类型                          | 默认值   |
| ------------------- | -------------------------------------- | ----------------------------- | -------- |
| filename            | 文件或文件夹的名称                     | `string`                      | -        |
| type                | 显示项目的类型                         | `'file' \| 'folder'`          | `'file'` |
| size                | 图标尺寸（像素）                       | `number`                      | `48`     |
| variant             | 图标显示样式                           | `'raw' \| 'file' \| 'folder'` | `'raw'`  |
| open                | 文件夹是否展开（仅对 folder 类型有效） | `boolean`                     | -        |
| fallbackUnknownType | 是否对未知文件类型显示回退图标         | `boolean`                     | `true`   |
