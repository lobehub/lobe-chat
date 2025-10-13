---
group: Display
title: Avatar
description: Customizable avatar component supporting custom sizes, borders, and error handling.
---

## Features

- ✅ Supports network and local images
- ✅ Custom size support
- ✅ Border style customization
- ✅ Image loading error handling
- ✅ TypeScript support
- ✅ Theme adaptation

## Basic Usage

```tsx
import { Avatar } from '@lobehub/ui-rn';

// Basic usage
<Avatar
  avatar="https://github.com/lobehub.png"
  alt="LobeHub"
/>

// Custom size
<Avatar
  avatar="https://github.com/lobehub.png"
  alt="LobeHub"
  size={48}
/>

// With border
<Avatar
  avatar="https://github.com/lobehub.png"
  alt="LobeHub"
  size={48}
  borderColor="#1677ff"
  borderWidth={2}
/>
```
