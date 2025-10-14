---
group: Layout
title: Center
description: Component for centering child elements within a container, supporting horizontal, vertical, or full centering.
---

## Features

- ✅ Simple centering layout
- ✅ Fully compatible with React Native
- ✅ Separate control of horizontal and vertical centering
- ✅ Minimum size setting support
- ✅ Built-in test ID support
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { Center } from '@lobehub/ui-rn';

// Fully centered
<Center>
  <Component />
</Center>

// Horizontal centering only
<Center horizontal={true} vertical={false}>
  <Component />
</Center>

// Vertical centering only
<Center horizontal={false} vertical={true}>
  <Component />
</Center>

// Set minimum size
<Center minHeight={150} minWidth={200}>
  <Component />
</Center>

// Block mode
<Center block style={{ height: 200 }}>
  <Component />
</Center>
```

## Use Cases

### Fully Centered

Suitable for scenarios where content needs to be displayed in the center of the container, such as loading indicators, empty state prompts, etc.

```tsx
<Center style={{ height: 200, backgroundColor: '#f0f0f0' }}>
  <LoadingSpinner />
</Center>
```

### Horizontal Centering

Suitable for scenarios where horizontal centering is needed but vertical position is fixed, such as page titles.

```tsx
<Center horizontal={true} vertical={false} style={{ height: 100 }}>
  <Text>Page Title</Text>
</Center>
```

### Vertical Centering

Suitable for scenarios where vertical centering is needed but horizontal position is fixed, such as sidebar content.

```tsx
<Center horizontal={false} vertical={true} style={{ height: 100 }}>
  <NavigationMenu />
</Center>
```

### Multiple Child Elements Centered

When there are multiple child elements, they will be displayed as a whole centered in the container.

```tsx
<Center>
  <Text>Title</Text>
  <Text>Subtitle</Text>
  <Button title="Action Button" />
</Center>
```

### Nested Usage

Can be combined with other layout components for complex layout effects.

```tsx
<Center style={{ height: 300, backgroundColor: '#f5f5f5' }}>
  <Center style={{ width: 200, height: 200, backgroundColor: 'white' }}>
    <Text>Nested Centered Content</Text>
  </Center>
</Center>
```
