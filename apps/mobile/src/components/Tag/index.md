---
group: Display
title: Tag
description: Versatile tag component for marking and classification with multiple sizes, variants, and color options.
---

## Features

- ✅ **Multiple sizes**: small, medium, large
- ✅ **Style variants**: filled, outlined, borderless
- ✅ **Rich colors**: preset colors, system status colors, hex colors
- ✅ **Interactive**: supports onPress for pressEffect tags
- ✅ **Icon support**: optional icon with auto size/color matching
- ✅ **Smart defaults**: icon size and color automatically match text
- ✅ **CVA-powered**: type-safe style variants
- ✅ **Theme integration**: auto-adapts to light/dark themes
- ✅ **TypeScript**: full type safety and IntelliSense

## Basic Usage

```tsx
import { Tag } from '@lobehub/ui-rn';

// Basic tag
<Tag>React</Tag>

// With size
<Tag size="large">Large Tag</Tag>

// With variant
<Tag variant="outlined">Outlined</Tag>

// With color
<Tag color="blue">Blue Tag</Tag>

// Clickable tag
<Tag onPress={() => alert('Clicked!')}>Click me</Tag>

// With icon (size and color auto-match text)
import { RocketIcon } from 'lucide-react-native';
<Tag icon={RocketIcon}>Featured</Tag>
```

## API

### TagProps

| Property  | Type                                   | Default  | Description                                     |
| --------- | -------------------------------------- | -------- | ----------------------------------------------- |
| children  | ReactNode                              | -        | Tag content                                     |
| size      | 'small' \| 'medium' \| 'large'         | 'medium' | Tag size                                        |
| variant   | 'filled' \| 'outlined' \| 'borderless' | 'filled' | Style variant                                   |
| color     | TagColor                               | -        | Tag color (preset, status, or hex)              |
| icon      | IconProps\['icon']                     | -        | Icon component (from lucide-react-native)       |
| iconSize  | number                                 | auto     | Icon size (auto: small=12, medium=14, large=16) |
| iconProps | Omit\<IconProps, 'icon'>               | -        | Additional props for Icon component             |
| onPress   | () => void                             | -        | Click handler                                   |
| style     | ViewStyle                              | -        | Container style                                 |
| textStyle | TextStyle                              | -        | Text style                                      |

### TagColor

Supports the following color values:

**Preset colors:**

- `red`, `volcano`, `orange`, `gold`, `yellow`, `lime`, `green`, `cyan`, `blue`, `geekblue`, `purple`, `magenta`, `gray`

**System status colors:**

- `success`, `error`, `warning`, `info`, `processing`

**Hex colors:**

- Any hex color string like `#1890ff`

## Examples

### Sizes

```tsx
<Tag size="small">Small</Tag>
<Tag size="medium">Medium</Tag>
<Tag size="large">Large</Tag>
```

### Variants

```tsx
<Tag variant="filled">Filled</Tag>
<Tag variant="outlined">Outlined</Tag>
<Tag variant="borderless">Borderless</Tag>
```

### Colors

```tsx
// Preset colors
<Tag color="blue">Blue</Tag>
<Tag color="green">Green</Tag>

// Status colors
<Tag color="success">Success</Tag>
<Tag color="error">Error</Tag>

// Hex colors
<Tag color="#1890ff">Custom</Tag>
```

### Interactive Tags

```tsx
<Tag onPress={() => console.log('clicked')}>Clickable</Tag>
```

### With Icons

```tsx
import { CheckIcon, RocketIcon } from 'lucide-react-native';

// Icon with auto size and color
<Tag icon={RocketIcon} color="blue">
  React Native
</Tag>

// Icon with custom size
<Tag icon={CheckIcon} color="success" iconSize={18}>
  Completed
</Tag>

// Icon with custom color
<Tag icon={RocketIcon} iconProps={{ color: '#ff4d4f' }}>
  Custom Color
</Tag>
```

**Note:** Icon size and color automatically match the text by default:

- **Size**: small=12px, medium=14px, large=16px
- **Color**: matches the tag's text color based on `color` and `variant` props
