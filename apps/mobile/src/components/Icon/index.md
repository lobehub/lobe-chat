---
group: Basic
title: Icon
description: Component for encapsulating common icon rendering logic, unifying size, rotation animation, and color control. Supports passing in Lucide icon components or any React node directly, with optional rotation animation.
---

## Features

- ✅ Default adaptation for `lucide-react-native` icons, also supports custom components or nodes
- ✅ Unified color and size control
- ✅ Optional rotation animation (`spin`)
- ✅ TypeScript type hints friendly
- ✅ Can be used with button components like ActionIcon

## Basic Usage

```tsx
import { Icon } from '@lobehub/ui-rn';
import { Star } from 'lucide-react-native';
// You can also pass React nodes
import { createElement } from 'react';

<Icon icon={Star} />;
<Icon icon={Star} size="large" color="#FADB14" />;
<Icon icon={Star} spin />;

<Icon icon={createElement(Star, { size: 20 })} />;
```

## Use Cases

- Render icons individually to display state
- Supplement components for ActionIcon or Button
- Display rotating indicator icons in loading states
- Display example colors in combination with color panels
