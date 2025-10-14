---
group: Navigation
title: CapsuleTabs
description: Horizontally scrollable capsule-style tabs component with custom styling, icon combinations, and selection state support.
---

## Features

- ✅ Capsule-style tab design
- ✅ Horizontal scrolling support
- ✅ Selection state management
- ✅ Icon and text combinations
- ✅ Custom styling
- ✅ Three sizes: large, middle, small
- ✅ Smart scroll shadows (can be toggled)
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { CapsuleTabItem, CapsuleTabs } from '@lobehub/ui-rn';
import { Briefcase, Home } from 'lucide-react-native';

const items: CapsuleTabItem[] = [
  { key: 'all', label: 'All', icon: Home },
  { key: 'work', label: 'Work', icon: Briefcase },
  { key: 'personal', label: 'Personal' },
];

const [selectedKey, setSelectedKey] = useState('all');

<CapsuleTabs items={items} selectedKey={selectedKey} onSelect={setSelectedKey} />;
```

## Sizes

Use the `size` prop to quickly switch component height and font size, with three presets: `large`, `middle`, and `small`.

```tsx
<CapsuleTabs items={items} selectedKey={selectedKey} onSelect={setSelectedKey} size="large" />
<CapsuleTabs items={items} selectedKey={selectedKey} onSelect={setSelectedKey} size="middle" />
<CapsuleTabs items={items} selectedKey={selectedKey} onSelect={setSelectedKey} size="small" />
```

## Scroll Shadow

The component uses ScrollShadow to automatically display gradient shadows when content is scrollable. You can disable this feature:

```tsx
// Enable scroll shadow (default)
<CapsuleTabs items={items} selectedKey={selectedKey} onSelect={setSelectedKey} />

// Disable scroll shadow
<CapsuleTabs
  enableScrollShadow={false}
  items={items}
  onSelect={setSelectedKey}
  selectedKey={selectedKey}
/>
```
