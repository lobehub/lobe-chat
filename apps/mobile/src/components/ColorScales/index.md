---
group: Display
title: ColorScales
description: React Native color palette display component, rewritten from LobeUI's ColorScales component.
---

## Features

- ✅ Display complete color levels
- ✅ Supports four modes: light/lightA/dark/darkA
- ✅ Highlights mid-level color
- ✅ Click to copy color values
- ✅ Transparent color support
- ✅ Vertical scrolling support (mobile optimization)
- ✅ TypeScript support
- ✅ **New: Automatic color level token generation**

## Basic Usage

```tsx
import { ColorScales } from '@/components/styles';
import { colorScales } from '@/components/styles';

export default () => <ColorScales name="primary" scale={colorScales.primary} midHighLight={9} />;
```

## Color Level Token Usage

You can now directly use color level tokens in your components:

```tsx
import { useThemeToken } from '@/components/styles';

const MyComponent = () => {
  const token = useThemeToken();

  return (
    <View
      style={{
        backgroundColor: token.primary1, // Primary color level 1
        borderColor: token.red5, // Red level 5
        shadowColor: token.blue3A, // Blue level 3 transparent
      }}
    >
      <Text style={{ color: token.gray9 }}>Using color level tokens</Text>
    </View>
  );
};
```

## Available Token Formats

- **Base colors**: `token.{colorName}{level}` (e.g., `token.primary5`)
- **Transparent**: `token.{colorName}{level}A` (e.g., `token.red3A`)
- **Dark mode**: `token.{colorName}{level}Dark` (e.g., `token.blue7Dark`)
- **Dark transparent**: `token.{colorName}{level}DarkA` (e.g., `token.green9DarkA`)

Where:

- `colorName`: primary, red, blue, green, cyan, geekblue, gold, gray, lime, magenta, orange, purple, volcano, yellow
- `level`: 1-11

## Palette Types

The component supports four palette modes:

- **light**: Light mode solid colors
- **lightA**: Light mode transparent colors
- **dark**: Dark mode solid colors
- **darkA**: Dark mode transparent colors

## Interactive Features

- Click any color swatch to copy the corresponding token value
- Copy format: `token.colorName + index + (A?) /* #hex */`
- Supports vertical scrolling to view complete palette

## Available Palettes

Currently supported palettes include: primary, red, blue, green, cyan, geekblue, gold, gray, lime, magenta, orange, purple, volcano, yellow
