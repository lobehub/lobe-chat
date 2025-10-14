---
group: Form
title: Switch
description: Lightweight wrapper of React Native Switch with built-in theme colors (thumb/track).
---

## Basic Usage

The `Switch` provided by `@lobehub/ui-rn` has the same API as React Native:

```tsx
import { Switch } from '@lobehub/ui-rn';
import React, { useState } from 'react';

export default function Demo() {
  const [checked, setChecked] = useState(false);
  return <Switch value={checked} onValueChange={setChecked} />;
}
```

## Theme Colors

- thumbColor: Uses `token.colorTextLightSolid`
- trackColor: `false: token.colorBgContainerDisabled`, `true: token.colorPrimary`

If customization is needed, you can still override by passing the same-named props supported by React Native `Switch`.
