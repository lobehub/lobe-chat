---
group: Layout
title: Space
description: Set spacing between components, supporting horizontal/vertical layout, different alignment methods, and separators.
---

## Features

- ✅ Horizontal and vertical spacing
- ✅ Preset spacing sizes (small, middle, large)
- ✅ Custom spacing values
- ✅ Multiple alignment methods (start, center, end, baseline)
- ✅ Auto-wrap support
- ✅ Separator functionality
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { Space } from '@lobehub/ui-rn';

// Basic usage
<Space>
  <Component1 />
  <Component2 />
  <Component3 />
</Space>

// Vertical spacing
<Space direction="vertical">
  <Component1 />
  <Component2 />
</Space>

// Custom spacing size
<Space size="large">
  <Component1 />
  <Component2 />
</Space>

// Alignment
<Space align="center">
  <Component1 />
  <Component2 />
</Space>
```
