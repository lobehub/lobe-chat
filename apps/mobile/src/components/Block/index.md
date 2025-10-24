---
group: Layout
title: Block
description: Flexible container component based on Flexbox, supporting multiple style variants, shadow effects, and glass effects, with class-variance-authority for style management.
---

## Features

- ✅ Flexible Flexbox-based layout
- ✅ Multiple style variants (filled, outlined, borderless)
- ✅ Shadow and glass effect support
- ✅ Clickable state support
- ✅ Style variant management using class-variance-authority
- ✅ Fully compatible with React Native
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { Block } from '@lobehub/ui-rn';

// Basic usage
<Block>
  <Text>Basic Block</Text>
</Block>

// Different variants
<Block variant="filled">
  <Text>Filled Block</Text>
</Block>

<Block variant="outlined">
  <Text>Outlined Block</Text>
</Block>

<Block variant="borderless">
  <Text>Borderless Block</Text>
</Block>

// With effects
<Block shadow>
  <Text>Block with Shadow</Text>
</Block>

<Block glass>
  <Text>Glass Effect Block</Text>
</Block>

// Clickable
<Block pressEffect onPress={() => console.log('clicked')}>
  <Text>Clickable Block</Text>
</Block>

// Combined effects
<Block
  variant="filled"
  shadow
  glass
  pressEffect
  onPress={() => console.log('clicked')}
>
  <Text>Combined Effects Block</Text>
</Block>
```

## Style Variants

### Filled

Default variant with background color fill.

```tsx
<Block variant="filled">
  <Text>Filled Block</Text>
</Block>
```

### Outlined

Transparent background with border.

```tsx
<Block variant="outlined">
  <Text>Outlined Block</Text>
</Block>
```

### Borderless

Completely transparent, no border.

```tsx
<Block variant="borderless">
  <Text>Borderless Block</Text>
</Block>
```

## Effect Combinations

### Shadow Effect

Add shadow to Block for enhanced layering.

```tsx
<Block shadow>
  <Text>Block with Shadow</Text>
</Block>
```

### Glass Effect

Add semi-transparent background for glass texture.

```tsx
<Block glass>
  <Text>Glass Effect Block</Text>
</Block>
```

### Clickable State

Enable click interaction with automatic hover state styling.

```tsx
<Block pressEffect onPress={() => console.log('clicked')}>
  <Text>Clickable Block</Text>
</Block>
```

## CVA Style Management

Block component uses custom React Native CVA for style variant management. The CVA configuration is located in the `style.ts` file:

```tsx
// CVA configuration in style.ts
export const useBlockVariants = (styles) =>
  cva(styles.root, {
    variants: {
      variant: {
        filled: styles.filled,
        outlined: styles.outlined,
        borderless: styles.borderless,
      },
      pressEffect: {
        false: null,
        true: styles.pressEffectRoot,
      },
    },
    compoundVariants: [
      {
        pressEffect: true,
        variant: 'filled',
        style: styles.pressEffectFilled,
      },
    ],
    defaultVariants: {
      variant: 'filled',
      pressEffect: false,
    },
  });

// Usage in component
const { styles } = useStyles();
const blockVariants = useBlockVariants(styles);
const variantStyles = blockVariants({ variant, pressEffect });
```

### Style File Pattern Advantages

1. **Centralized Management**: Styles and variant logic are in the style file
2. **Theme Integration**: Direct access to theme tokens
3. **Type Safety**: Complete TypeScript support
4. **Easy Maintenance**: Clear file structure

## Layout Applications

### Card Container

```tsx
<Block variant="filled" shadow style={{ padding: 16 }}>
  <Text style={{ fontWeight: 'bold' }}>Card Title</Text>
  <Text>Card Content</Text>
</Block>
```

### Interactive Button

```tsx
<Block pressEffect variant="outlined" onPress={() => handleAction()} style={{ padding: 12 }}>
  <Text>Action Button</Text>
</Block>
```

### Grouping Container

```tsx
<Block variant="borderless" direction="column">
  <Block variant="filled" style={{ marginBottom: 8 }}>
    <Text>Item 1</Text>
  </Block>
  <Block variant="filled">
    <Text>Item 2</Text>
  </Block>
</Block>
```
