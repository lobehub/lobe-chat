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

## Animation Effect

The component supports gradient animation effects, controlled by the `animated` prop. Animations are implemented using React Native Animated API with excellent performance.

## Custom Styles

You can customize skeleton colors through `backgroundColor` and `highlightColor` props, or customize container styles through the `style` prop.
