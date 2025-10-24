---
group: Basic
title: ActionIcon
description: ActionIcon is a component for rendering icon buttons with background, supporting multiple style variants, sizes, and interaction states. It integrates with the Lucide icon library and provides tooltip capabilities.
---

Used to display pressEffect icon buttons in the interface, supporting size, variant, loading and disabled states. Suitable for toolbars, cards or lists.

## Features

- ✅ Three built-in sizes with custom size support
- ✅ Three visual variants: borderless, filled, and outlined
- ✅ Built-in Lucide LoaderCircle loading animation
- ✅ Disabled state and click feedback support
- ✅ Icon accepts component or ReactNode
- ✅ Custom icon color support
- ✅ Complete TypeScript type definitions

## Basic Usage

```tsx
import { ActionIcon } from '@lobehub/ui-rn';
import { MoreHorizontal } from 'lucide-react-native';

<ActionIcon icon={MoreHorizontal} onPress={() => console.log('more')} />;

// Sizes
<ActionIcon icon={MoreHorizontal} size="small" />;
<ActionIcon icon={MoreHorizontal} size="middle" />;
<ActionIcon icon={MoreHorizontal} size="large" />;
<ActionIcon icon={MoreHorizontal} size={28} />;

// Variants
<ActionIcon icon={MoreHorizontal} variant="borderless" />;
<ActionIcon icon={MoreHorizontal} variant="filled" />;
<ActionIcon icon={MoreHorizontal} variant="outlined" />;

// Loading & Disabled
<ActionIcon icon={MoreHorizontal} loading />;
<ActionIcon icon={MoreHorizontal} disabled />;

// Custom Color
<ActionIcon color="#F97316" icon={MoreHorizontal} />;
```
