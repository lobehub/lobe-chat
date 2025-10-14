---
group: Layout
title: Flexbox
description: Container component based on React Native Flexbox layout, providing a simple API to control the arrangement and alignment of child elements.
---

## Features

- ✅ Simple Flexbox property encapsulation
- ✅ Fully compatible with React Native
- ✅ Supports all Flexbox layout properties
- ✅ Supports automatic wrapping and flex properties
- ✅ Built-in test ID support
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { Flexbox } from '@lobehub/ui-rn';

// Horizontal arrangement
<Flexbox direction="row" justify="center" align="center">
  <Component1 />
  <Component2 />
  <Component3 />
</Flexbox>

// Vertical arrangement
<Flexbox direction="column" justify="space-between">
  <Component1 />
  <Component2 />
  <Component3 />
</Flexbox>

// Auto wrap
<Flexbox direction="row" wrap="wrap" justify="space-around">
  <Component1 />
  <Component2 />
  <Component3 />
  <Component4 />
</Flexbox>

// Fill mode
<Flexbox block direction="row" justify="center">
  <Component1 />
  <Component2 />
</Flexbox>
```

## Layout Direction

- `row`: Horizontal arrangement, left to right
- `column`: Vertical arrangement, top to bottom
- `row-reverse`: Horizontal arrangement, right to left
- `column-reverse`: Vertical arrangement, bottom to top

## Alignment Methods

### Main Axis Alignment (justify)

- `flex-start`: Align at start
- `flex-end`: Align at end
- `center`: Center align
- `space-between`: Justify with equal spacing between items
- `space-around`: Equal spacing around each item
- `space-evenly`: All spacing is equal

### Cross Axis Alignment (align)

- `stretch`: Stretch to fill container
- `flex-start`: Align at start
- `flex-end`: Align at end
- `center`: Center align
- `baseline`: Baseline align
