---
group: Form
title: Slider
description: React Native slider input component supporting custom range, step, and smooth gesture interaction.
---

## Features

- ✅ Smooth drag gesture interaction
- ✅ Custom min, max, and step values
- ✅ Mark support (marks)
- ✅ Marks-only mode (step=null)
- ✅ Controlled and uncontrolled modes
- ✅ Complete accessibility support
- ✅ Custom styling (track and thumb)
- ✅ Disabled state support
- ✅ TypeScript support
- ✅ Theme adaptation (dark/light mode)

## Basic Usage

```tsx
import { Slider } from '@lobehub/ui-rn';

// Basic usage
<Slider
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  step={1}
/>

// Custom range and step
<Slider
  value={price}
  onChange={setPrice}
  min={100}
  max={2000}
  step={50}
/>

// Uncontrolled mode
<Slider
  defaultValue={30}
  onChange={(value) => console.log('value:', value)}
  min={0}
  max={100}
  step={5}
/>

// Disabled state
<Slider
  value={value}
  onChange={setValue}
  disabled
  min={0}
  max={100}
/>

// Custom styles
<Slider
  value={value}
  onChange={setValue}
  trackStyle={{ backgroundColor: '#ff6b35' }}
  thumbStyle={{ backgroundColor: '#4ecdc4' }}
/>

// Marks
<Slider
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  marks={{
    0: '0%',
    25: '25%',
    50: '50%',
    75: '75%',
    100: '100%'
  }}
/>

// Marks-only mode (can only select marked values)
<Slider
  value={level}
  onChange={setLevel}
  step={null}
  marks={{
    0: 'Low',
    1: 'Medium',
    2: 'High',
    3: 'Very High'
  }}
/>
```

## Use Cases

### Numeric Input

- Volume control
- Brightness adjustment
- Price range selection
- Temperature setting

### Progress Control

- Playback progress
- Download progress
- Task completion

### Parameter Adjustment

- Font size
- Zoom ratio
- Transparency setting

## Accessibility Support

The component provides complete accessibility support:

- `accessibilityRole="adjustable"` identifies as adjustable component
- `accessibilityValue` provides current value and range information
- Supports screen readers
- Supports custom accessibility labels and hints

## Gesture Interaction

- Uses react-native-gesture-handler for smooth drag experience
- Supports precise position calculation and boundary restrictions
- Real-time feedback and smooth animations
- Auto-snap to step values

## Theme Adaptation

The component uses the project's theme system for automatic adaptation:

- Dark/light mode
- Disabled state colors
- Brand color scheme
- Consistent design standards
