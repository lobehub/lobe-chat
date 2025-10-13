---
group: Form
title: ColorSwatches
description: React Native color picker component, rewritten from LobeUI's ColorSwatches component.
---

## Features

- ✅ Multiple color presets support
- ✅ Circle/Square two styles
- ✅ Custom size and spacing
- ✅ Transparent color support
- ✅ Selected state display
- ✅ Accessibility support
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { ColorSwatches } from '@lobehub/ui-rn';

// Basic usage
<ColorSwatches
  colors={[
    { color: '#ff0000', title: 'Red' },
    { color: '#00ff00', title: 'Green' },
    { color: '#0000ff', title: 'Blue' },
  ]}
  onChange={(color) => console.log(color)}
/>

// Square style
<ColorSwatches
  colors={colors}
  shape="square"
  size={28}
  gap={8}
  onChange={handleColorChange}
/>

// Transparent color support
<ColorSwatches
  colors={[
    { color: 'rgba(0, 0, 0, 0)', title: 'Transparent' },
    { color: '#ff0000', title: 'Red' },
  ]}
  onChange={handleColorChange}
/>
```

## Core Features

### Color System Integration

ColorSwatches is fully integrated with the project's color system, supporting:

- Predefined color palettes
- Theme color adaptation
- Dark mode support

### Transparent Color Handling

The component has special handling for transparent colors:

- Automatic transparent color detection
- Special styling for transparent colors
- Correct contrast color calculation

### Accessibility

The component provides comprehensive accessibility support:

- Screen reader support
- Keyboard navigation
- Color description labels

## Style Customization

### Size Configuration

- `size`: Controls swatch size
- `gap`: Controls swatch spacing
- `shape`: Controls swatch shape (circle/square)

### Custom Styles

You can customize container styles through the `style` prop:

```tsx
<ColorSwatches
  colors={colors}
  style={{
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  }}
/>
```
