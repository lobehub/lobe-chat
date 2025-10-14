---
group: Form
title: InstantSwitch
description: React Native instant switch component supporting async toggle operations, inspired by web InstantSwitch implementation.
---

## Features

- ✅ Async toggle operation support
- ✅ Loading state management
- ✅ Optimistic update mechanism
- ✅ Error handling and rollback
- ✅ Prevent duplicate clicks
- ✅ Three size support
- ✅ Custom colors
- ✅ Disabled state support
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { InstantSwitch } from '@lobehub/ui-rn';

// Basic usage
<InstantSwitch
  enabled={enabled}
  onChange={async (enabled) => {
    // Async operation
    await toggleProvider(id, enabled);
  }}
/>

// Custom colors
<InstantSwitch
  enabled={enabled}
  onChange={handleChange}
  trackColor={{
    false: '#ff6b6b',
    true: '#51cf66',
  }}
  thumbColor="#ffffff"
  loadingColor="#339af0"
/>

// Different sizes
<InstantSwitch size="small" />
<InstantSwitch size="default" />
<InstantSwitch size="large" />

// Disabled state
<InstantSwitch disabled />
```

## Core Features

### Async Operation Handling

InstantSwitch is specifically designed for async operations, supporting:

- Async toggle callbacks
- Loading state display
- Optimistic update mechanism
- Error rollback handling

### Optimistic Updates

The component uses an optimistic update strategy:

1. UI state updates immediately upon user click
2. Async operation executes in background
3. Maintains new state on success
4. Rolls back to original state on failure

### Prevent Duplicate Clicks

During async operations, the component will:

- Disable switch operation
- Display loading indicator
- Prevent duplicate triggers

## Size Specifications

- `small`: Small size (scale 0.8)
- `default`: Default size (scale 1.0)
- `large`: Large size (scale 1.2)

## Use Cases

- Provider enable/disable
- Feature toggle control
- Settings toggle
- Operations requiring async confirmation
