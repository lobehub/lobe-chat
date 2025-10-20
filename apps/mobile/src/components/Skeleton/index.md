---
group: Feedback
title: Skeleton
description: React Native skeleton screen component inspired by Ant Design, used for page loading state display.
---

## Features

- ✅ Basic skeleton screen display
- ✅ Avatar skeleton support
- ✅ Title and paragraph skeleton
- ✅ Button skeleton
- ✅ Animation effect support
- ✅ Custom row count and width
- ✅ Loading state control
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { Skeleton } from '@lobehub/ui-rn';

// Basic usage
<Skeleton />

// Disable animation
<Skeleton animated={false} />

// Show content when loading complete
<Skeleton loading={false}>
  <Text>Actual content</Text>
</Skeleton>

// With avatar
<Skeleton avatar />

// Custom avatar
<Skeleton avatar={{ size: 64, shape: 'square' }} />

// Custom paragraph
<Skeleton paragraph={{ rows: 5 }} />

// Custom row widths
<Skeleton
  paragraph={{
    width: ['100%', '90%', '75%', '50%']
  }}
/>

// Use compound components
<Skeleton.Avatar size={48} shape="circle" />
<Skeleton.Title width="80%" />
<Skeleton.Paragraph rows={4} />
<Skeleton.Button />
<Skeleton.Button block size="large" />
```

## Compound Components

### Skeleton.Avatar

Standalone avatar skeleton component.

### Skeleton.Title

Standalone title skeleton component.

### Skeleton.Paragraph

Standalone paragraph skeleton component.

### Skeleton.Button

Standalone button skeleton component.

## Use Cases

### List Loading

Suitable for displaying skeleton screens during list data loading to improve user experience.

### Card Content

Display corresponding skeleton screen structure when card content is loading.

### Profile

Use avatar + text combination to display profile loading state.

### Article Content

Use title + paragraph combination to display article content loading state.

## Size Alignment

Skeleton components are precisely aligned with their real counterparts to ensure a seamless loading experience:

### Skeleton.Button

- **Height**: Matches Button component's height calculation (`controlHeight * 1.25`)
  - Small: \~40px (base 32px × 1.25)
  - Middle: \~47.5px (base 38px × 1.25)
  - Large: \~55px (base 44px × 1.25)
- **Border Radius**:
  - Default shape: `height / 2.5` (matching Button's rounded corners)
  - Circle shape: `height * 2` (fully rounded)
- **Width**: Configurable via `width` prop, `block` prop, or defaults to 50%

### Skeleton.Avatar

- **Size**: Directly matches Avatar component's size (default 32px)
- **Border Radius**:
  - Circle shape: `size / 2` (matching Avatar's circular design)
  - Square shape: `borderRadiusLG` token value

This alignment ensures that when content loads, the transition from skeleton to actual component is smooth without layout shifts.

## Animation Effect

The component supports gradient animation effects, controlled by the `animated` prop. Animations are implemented using React Native Animated API with excellent performance.

## Custom Styles

You can customize skeleton colors through `backgroundColor` and `highlightColor` props, or customize container styles through the `style` prop.
