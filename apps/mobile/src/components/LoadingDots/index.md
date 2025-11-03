---
group: Feedback
title: LoadingDots
description: Advanced animated loading component with multiple visual effects, perfect for AI applications and modern interfaces requiring engaging loading states.
---

## Features

- ✅ 5 stunning animation variants (dots, pulse, wave, orbit, typing)
- ✅ Smooth AI-inspired animations
- ✅ Customizable size and color
- ✅ Theme-aware with primary color default
- ✅ Optimized performance with native driver
- ✅ TypeScript support with variant types
- ✅ Lightweight and reusable

## Basic Usage

```tsx
import { LoadingDots } from '@lobehub/ui-rn';

// Default dots animation
<LoadingDots />

// Pulse effect - great for AI thinking
<LoadingDots variant="pulse" size={12} />

// Wave animation - smooth and modern
<LoadingDots variant="wave" />

// Orbit rotation - futuristic feel
<LoadingDots variant="orbit" />

// Typing effect - perfect for chat
<LoadingDots variant="typing" />

// Custom color
<LoadingDots variant="pulse" color="#ff6b6b" />
```

## Animation Variants

### Dots (default)

Classic fade-in/out animation with staggered timing. Best for general loading states.

### Pulse

Single dot that scales and fades. Creates a heartbeat effect, ideal for AI processing indicators.

### Wave

Three dots bounce up and down in sequence. Smooth and playful, perfect for content loading.

### Orbit

Three dots rotate around a center point. Futuristic design for advanced AI features.

### Typing

Mimics typing indicator with scale and opacity changes. Natural fit for chat and messaging.

## Use Cases

### AI Response Generation

```tsx
<Flexbox horizontal align="center" gap={8}>
  <Text>AI is thinking</Text>
  <LoadingDots variant="pulse" />
</Flexbox>
```

### Chat Typing Indicator

```tsx
<LoadingDots variant="typing" size={6} />
```

### Content Loading

```tsx
<LoadingDots variant="wave" size={10} />
```

### Processing States

```tsx
<LoadingDots variant="orbit" size={8} />
```

## Animation Details

Each variant has unique animation properties:

**Dots**

- Duration: 400ms per fade cycle
- Delay: 150ms stagger
- Opacity: 0.3 → 1.0

**Pulse**

- Duration: 600ms per cycle
- Scale: 0.8 → 1.3
- Opacity: 0.3 → 1.0

**Wave**

- Duration: 500ms per bounce
- Delay: 120ms stagger
- Movement: 1.5× dot size vertical

**Orbit**

- Duration: 1200ms rotation
- 120° separation between dots
- Smooth circular motion

**Typing**

- Duration: 200ms per flash
- Delay: 150ms stagger
- Scale: 0.6 → 1.0
- Opacity: 0.2 → 1.0

All animations use React Native's native driver for 60fps performance.

## Props

| Prop    | Type                                                 | Default              | Description             |
| ------- | ---------------------------------------------------- | -------------------- | ----------------------- |
| variant | `'dots' \| 'pulse' \| 'wave' \| 'orbit' \| 'typing'` | `'dots'`             | Animation style         |
| size    | `number`                                             | `8`                  | Dot diameter in pixels  |
| color   | `string`                                             | `token.colorPrimary` | Dot color               |
| style   | `ViewStyle`                                          | `undefined`          | Custom container styles |

## Accessibility

The component is purely visual. When using as a loading indicator, consider adding accessible text:

```tsx
<View>
  <Text accessibilityLabel="Loading content">Loading</Text>
  <LoadingDots variant="wave" />
</View>
```
