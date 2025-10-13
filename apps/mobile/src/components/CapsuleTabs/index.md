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
