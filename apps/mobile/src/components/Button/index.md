---
group: Basic
title: Button
description: React Native button component inspired by Ant Design, supporting multiple types, sizes, and states.
---

## Features

- ✅ Multiple button types (Primary, Default, Dashed, Text, Link)
- ✅ Three sizes (Small, Middle, Large)
- ✅ Loading state support
- ✅ Disabled state support
- ✅ Icon support (`icon` prop)
- ✅ Custom style support
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { Button } from '@lobehub/ui-rn';

// Basic usage
<Button onPress={() => console.log('clicked')}>
  Default Button
</Button>

// Primary button
<Button type="primary" onPress={() => console.log('clicked')}>
  Primary Button
</Button>

// Dashed button
<Button type="dashed" onPress={() => console.log('clicked')}>
  Dashed Button
</Button>

// Different sizes
<Button size="small">Small</Button>
<Button size="middle">Middle</Button>
<Button size="large">Large</Button>

// Loading state
<Button loading onPress={() => console.log('clicked')}>
  Loading Button
</Button>

// Disabled state
<Button disabled onPress={() => console.log('clicked')}>
  Disabled Button
</Button>

// Block button
<Button block onPress={() => console.log('clicked')}>
  Block Button
</Button>

// Icon button
import { Plus } from 'lucide-react-native';
<Button icon={<Plus />} type="primary">
  Create
</Button>

// Circle button
<Button shape="circle" type="primary" icon={<Plus />} />
```

## Button Types

- `primary`: Primary button for main actions
- `default`: Default button for secondary actions
- `text`: Text button for lightweight actions
- `link`: Link button for navigation

## Size Specifications

- `small`: Small size (24px height)
- `middle`: Medium size (32px height)
- `large`: Large size (40px height)
