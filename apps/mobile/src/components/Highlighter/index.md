---
group: Display
title: Highlighter
description: High-performance code highlighting component based on Shiki, providing rich syntax highlighting features for React Native applications.
---

## Features

- ✅ Supports 100+ programming languages
- ✅ Multiple theme support
- ✅ Code copy functionality
- ✅ Language dynamic switching
- ✅ Filename display
- ✅ Expand/collapse functionality
- ✅ Compact and default display modes
- ✅ Custom style support
- ✅ TypeScript support
- ✅ High-performance rendering

## Quick Start

```tsx
import { Highlighter } from '@lobehub/ui-rn';

// Basic usage
<Highlighter code="console.log('Hello World');" lang="javascript" />;
```

## Feature Mode Comparison

### Basic Mode (`fullFeatured={false}`)

- Pure code highlighting display
- Lightweight rendering
- Suitable for simple code snippet display
- No interactive features

### Full Featured Mode (`fullFeatured={true}`)

- Includes header toolbar
- Supports code copying
- Supports expand/collapse
- Supports language switching
- Supports filename display
- Suitable for complete code documentation display

## Performance Optimization

- **Token Caching**: Automatically caches syntax analysis results
- **Lazy Loading**: Load language definitions on demand
- **Memory Management**: Automatically clean up unused language definitions

## Best Practices

### 1. Choose the Right Mode

```tsx
// Documentation display: Use full featured mode
<Highlighter fullFeatured fileName="example.js" />

// Inline code: Use basic mode
<Highlighter code="const x = 1" lang="js" />

// Command line: Use compact mode
<Highlighter type="compact" lang="bash" />
```

### 2. Optimize User Experience

```tsx
// Long code collapsed by default, let users expand manually
<Highlighter
  defalutExpand={false}
  fullFeatured
  fileName="long-filename.js"
/>

// Provide language switching for debugging convenience
<Highlighter
  allowChangeLanguage
  fullFeatured
/>
```
