---
group: Brand
title: BrandLoading
description: 带描边绘制和填充动画的品牌 Logo 加载组件
---

## Features

- ✅ 流畅的描边绘制动画
- ✅ 填充渐显动画
- ✅ 使用 React Native Reanimated
- ✅ 支持自定义尺寸和颜色
- ✅ TypeScript 支持
- ✅ 主题适配

## Basic Usage

```tsx
import { BrandLoading } from '@lobehub/ui-rn';

<BrandLoading size={64} />;
```

## API

| Property | Description       | Type                   | Default          |
| -------- | ----------------- | ---------------------- | ---------------- |
| size     | Logo 尺寸（高度） | `number`               | `64`             |
| color    | Logo 颜色         | `string`               | `'currentColor'` |
| style    | 自定义样式        | `StyleProp<ViewStyle>` | -                |
