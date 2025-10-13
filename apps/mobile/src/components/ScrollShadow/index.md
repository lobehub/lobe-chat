---
group: Layout
title: ScrollShadow
description: Scroll container component with smart gradient shadow effects that automatically show/hide based on scroll state.
---

## Features

- ✅ Vertical and horizontal scroll support
- ✅ Auto show/hide shadows based on scroll position
- ✅ Customizable shadow size and offset
- ✅ ScrollBar hiding support
- ✅ Scroll state change callback
- ✅ High-performance gradient effects using native MaskedView
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { ScrollShadow } from '@lobehub/ui-rn';
import { View, Text } from 'react-native';

// Basic vertical scroll
<ScrollShadow>
  <View>
    <Text>Scrollable content</Text>
    <Text>More content...</Text>
    <Text>Even more content...</Text>
  </View>
</ScrollShadow>

// Horizontal scroll
<ScrollShadow orientation="horizontal">
  <View style={{ flexDirection: 'row' }}>
    {items.map(item => <Item key={item.id} {...item} />)}
  </View>
</ScrollShadow>

// Custom shadow size and offset
<ScrollShadow size={30} offset={10}>
  <View>
    <Text>Content</Text>
  </View>
</ScrollShadow>

// Hide scroll bar
<ScrollShadow hideScrollBar>
  <View>
    <Text>Clean scrolling experience</Text>
  </View>
</ScrollShadow>

// Always visible shadows
<ScrollShadow visibility="always">
  <View>
    <Text>Shadows always shown</Text>
  </View>
</ScrollShadow>

// Scroll state callback
<ScrollShadow
  onVisibilityChange={(visibility) => {
    console.log('Shadow state:', visibility);
  }}
>
  <View>
    <Text>Content with callback</Text>
  </View>
</ScrollShadow>
```

## Scroll Orientations

- `vertical`: Vertical scrolling with top/bottom shadows
- `horizontal`: Horizontal scrolling with left/right shadows

## Visibility Modes

- `auto`: Automatically show/hide shadows based on scroll position (default)
- `always`: Always show shadows regardless of scroll state
- `never`: Never show shadows
