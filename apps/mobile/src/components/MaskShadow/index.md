---
group: Layout
title: MaskShadow
description: Component for adding gradient mask shadow effects to content, supporting four directional shadows with customizable size.
---

## Features

- ✅ Four directional shadows (top, bottom, left, right)
- ✅ Customizable shadow size
- ✅ High-performance gradient effects using native MaskedView
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { MaskShadow } from '@lobehub/ui-rn';
import { View, Text } from 'react-native';

// Bottom shadow
<MaskShadow position="bottom" size={40}>
  <View>
    <Text>Content with bottom shadow</Text>
  </View>
</MaskShadow>

// Top shadow
<MaskShadow position="top" size={30}>
  <View>
    <Text>Content with top shadow</Text>
  </View>
</MaskShadow>

// Left shadow
<MaskShadow position="left" size={50}>
  <View>
    <Text>Content with left shadow</Text>
  </View>
</MaskShadow>

// Right shadow
<MaskShadow position="right" size={40}>
  <View>
    <Text>Content with right shadow</Text>
  </View>
</MaskShadow>
```

## Shadow Positions

- `top`: Gradient from top edge, fading upward
- `bottom`: Gradient from bottom edge, fading downward
- `left`: Gradient from left edge, fading leftward
- `right`: Gradient from right edge, fading rightward
