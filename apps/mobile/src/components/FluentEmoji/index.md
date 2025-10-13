---
group: Display
title: FluentEmoji
description: Microsoft Fluent-style 3D emoji component with custom size and fallback support.
---

## Features

- ✅ Fluent 3D emoji design
- ✅ Custom size support
- ✅ Plain emoji fallback
- ✅ High-quality image rendering
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { FluentEmoji } from '@lobehub/ui-rn';

// Basic usage
<FluentEmoji emoji="😊" size={40} />

// Custom size
<FluentEmoji emoji="🚀" size={64} />

// Use plain emoji
<FluentEmoji emoji="🎁" size={48} plainEmoji />

// Error fallback
<FluentEmoji emoji="🎨" size={40} fallback="🎨" />
```

## Design Philosophy

The FluentEmoji component provides Microsoft Fluent design system 3D emojis, which compared to traditional flat emojis, offer:

- Richer visual hierarchy
- More modern design style
- Better user experience
- Cross-platform consistency

When 3D emoji loading fails, it automatically falls back to the original Unicode emoji, ensuring functionality availability.
