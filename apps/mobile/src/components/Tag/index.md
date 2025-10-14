---
group: Display
title: Tag
description: Small tag component for marking and classification with custom style support.
---

## Features

- ✅ Simple tag design
- ✅ Custom style support
- ✅ Flexible text styling
- ✅ Auto-wrap layout
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { Tag } from '@lobehub/ui-rn';

// Basic usage
<Tag>React</Tag>

// Custom styles
<Tag
  style={{ backgroundColor: '#f0f2f5' }}
  textStyle={{ color: '#1890ff' }}
>
  Custom Tag
</Tag>

// Multiple tags layout
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
  <Tag>React</Tag>
  <Tag>TypeScript</Tag>
  <Tag>JavaScript</Tag>
</View>
```

## Style Customization

The Tag component supports complete style customization through `style` and `textStyle` props:

- `style`: Controls tag container styles (background color, border, padding, etc.)
- `textStyle`: Controls tag text styles (color, font size, weight, etc.)
