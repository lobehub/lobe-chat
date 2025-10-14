---
group: Feedback
title: Tooltip
description: Tooltip component inspired by Ant Design's Tooltip, providing fully-featured tooltip functionality for React Native applications.
---

## Features

- ✅ 12 placement options (top, bottom, left, right and their variants)
- ✅ Smart position calculation and auto-adjustment
- ✅ Multiple trigger modes (click, long press, controlled)
- ✅ Smooth animation effects
- ✅ Custom styles and content
- ✅ Arrow pointer support
- ✅ Screen boundary detection and position fallback
- ✅ TypeScript support

## Basic Usage

```tsx
import { Tooltip } from '@lobehub/ui-rn';

// Basic usage
<Tooltip title="This is a tooltip message">
  <TouchableOpacity style={styles.button}>
    <Text>Long press to show tooltip</Text>
  </TouchableOpacity>
</Tooltip>;
```

## Placement

Supports 12 positions:

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

## Trigger Modes

```tsx
type TooltipTrigger = 'click' | 'longPress' | 'none';
```
