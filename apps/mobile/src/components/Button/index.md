---
group: Basic
title: Button
description: React Native button component inspired by Ant Design, supporting multiple types, sizes, and states.
---

## Features

- ✅ Multiple button types (Primary, Default, Text, Link)
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

// Using variant prop directly (recommended)
<Button variant="filled" color="primary">Filled Button</Button>
<Button variant="outlined" color="default">Outlined Button</Button>
<Button variant="borderless">Borderless Button</Button>
```

## Button Variants

Button variants are aligned with Block component for consistency:

- `filled`: Solid background (used for primary actions)
- `outlined`: Border with transparent background (used for secondary actions)
- `borderless`: No border or background (used for text and link styles)

## Button Types (Legacy)

For backward compatibility, you can still use the `type` prop:

- `primary`: Primary button for main actions (maps to `filled` variant)
- `default`: Default button for secondary actions (maps to `outlined` variant)
- `text`: Text button for lightweight actions (maps to `borderless` variant)
- `link`: Link button for navigation (maps to `borderless` variant with underline on hover)

## Size Specifications

- `small`: Small size (32px height)
- `middle`: Medium size (38px height)
- `large`: Large size (44px height)
