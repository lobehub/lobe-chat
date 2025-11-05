---
group: Brand
title: Brand
description: LobeHub 品牌组件集合，包含多种 Logo 样式和加载动画
---

## Features

- ✅ 多种 Logo 风格：3D、扁平、单色、文字、组合
- ✅ 品牌加载动画
- ✅ 灵活的尺寸配置
- ✅ TypeScript 支持
- ✅ 主题适配

## Components

### LobeHub

主要的品牌展示组件，支持多种风格和组合方式。

### LobeHubText

LobeHub 文字 Logo SVG 组件。

### Logo3d

LobeHub 3D Logo 图片组件。

### LogoFlat

LobeHub 扁平风格 Logo SVG 组件。

### LogoMono

LobeHub 单色风格 Logo SVG 组件。

### BrandLoading

带动画效果的品牌 Logo 加载组件。

### BrandDivider

品牌组件专用的分割线 SVG 组件。

## Basic Usage

```tsx
import { LobeHub, BrandLoading, LobeHubText } from '@lobehub/ui-rn';

// 基础 Logo
<LobeHub size={64} />

// 不同风格
<LobeHub size={64} type="flat" />
<LobeHub size={64} type="mono" />
<LobeHub size={64} type="text" />
<LobeHub size={64} type="combine" />

// 带附加文字
<LobeHub size={64} extra="Discover" />

// 加载动画
<BrandLoading size={64} />
```
