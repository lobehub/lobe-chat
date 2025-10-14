---
group: Layout
title: Cell
description: A list cell component based on Block, commonly used for settings pages and menu lists, supporting icons, extra content, and arrow indicators.
---

## Features

- ✅ Based on Block component, inherits all layout capabilities
- ✅ Supports custom icons on the left
- ✅ Supports extra content on the right (text or custom components)
- ✅ Optional arrow indicator
- ✅ Clickable state support
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { Cell } from '@lobehub/ui-rn';

// Basic cell
<Cell title="Settings" />

// Cell with icon
<Cell
  icon={Settings}
  title="General Settings"
/>

// Cell with extra content
<Cell
  title="Language"
  extra="English"
/>

// Cell without arrow
<Cell
  title="Read-only Item"
  showArrow={false}
/>

// Clickable cell
<Cell
  title="Account"
  icon={User}
  extra="Tap to edit"
  onPress={() => console.log('Navigate to account')}
/>
```

## Component Structure

Cell component consists of the following parts:

```
┌─────────────────────────────────────┐
│ [icon] Title              Extra [→] │
└─────────────────────────────────────┘
```

- **Icon** (optional): Left icon
- **Title** (required): Main content, can be string or custom ReactNode
- **Extra** (optional): Right content, can be string or custom ReactNode
- **Arrow** (optional, default shown): Right arrow indicator

## Usage Scenarios

### Settings Page

```tsx
import { Cell, Flexbox } from '@lobehub/ui-rn';
import { Bell, Settings, Shield, User } from 'lucide-react-native';

<Flexbox gap={8}>
  <Cell icon={User} title="Account" extra="user@example.com" onPress={() => {}} />
  <Cell icon={Bell} title="Notifications" extra="On" onPress={() => {}} />
  <Cell icon={Shield} title="Privacy" onPress={() => {}} />
  <Cell icon={Settings} title="General" onPress={() => {}} />
</Flexbox>;
```

### Menu List

```tsx
import { Cell, Flexbox } from '@lobehub/ui-rn';
import { Download, FileText, Star } from 'lucide-react-native';

<Flexbox gap={8}>
  <Cell icon={FileText} title="Documents" extra="15" onPress={() => {}} />
  <Cell icon={Download} title="Downloads" extra="8" onPress={() => {}} />
  <Cell icon={Star} title="Favorites" extra="23" onPress={() => {}} />
</Flexbox>;
```

### Information Display

```tsx
import { Cell, Flexbox } from '@lobehub/ui-rn';

<Flexbox gap={8}>
  <Cell title="Version" extra="1.0.0" showArrow={false} />
  <Cell title="Build Number" extra="12345" showArrow={false} />
  <Cell title="Last Updated" extra="2024-01-01" showArrow={false} />
</Flexbox>;
```

## API

### CellProps

Extends from `BlockProps` (excluding `children`):

| Prop      | Type                  | Default | Description                                                 |
| --------- | --------------------- | ------- | ----------------------------------------------------------- |
| title     | `ReactNode \| string` | -       | **Required**. Cell title, can be string or custom component |
| icon      | `IconProps['icon']`   | -       | Left icon                                                   |
| extra     | `ReactNode \| string` | -       | Right extra content, can be string or custom component      |
| showArrow | `boolean`             | `true`  | Whether to show right arrow                                 |
| onPress   | `() => void`          | -       | Click callback                                              |

### Inherited from BlockProps

Cell inherits all props from Block component, such as:

- `variant`: `'filled' | 'outlined' | 'borderless'`
- `shadow`: Whether to show shadow
- `glass`: Whether to enable glass effect
- `padding`, `gap`, `align`, `justify`: Layout properties

## Customization Examples

### Custom Title Component

```tsx
import { Cell, Flexbox, Text } from '@lobehub/ui-rn';

<Cell
  title={
    <Flexbox gap={4}>
      <Text strong>Premium Feature</Text>
      <Text type="secondary" fontSize={12}>
        Requires subscription
      </Text>
    </Flexbox>
  }
  onPress={() => {}}
/>;
```

### Custom Extra Component

```tsx
import { Cell, Text } from '@lobehub/ui-rn';
import { Switch } from 'react-native';

<Cell
  title="Dark Mode"
  extra={<Switch value={darkMode} onValueChange={setDarkMode} />}
  showArrow={false}
/>;
```

### Styled Cell

```tsx
import { Cell } from '@lobehub/ui-rn';

<Cell title="Important Setting" variant="outlined" shadow padding={16} onPress={() => {}} />;
```
