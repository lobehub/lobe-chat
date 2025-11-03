---
group: Display
title: Markdown
description: Powerful React Native Markdown rendering component with math formulas, code highlighting, tables, and GitHub Flavored Markdown support.
---

## Features

- ✅ **Math Formula Rendering** - Supports LaTeX math formula display via remark-math
- ✅ **Code Highlighting** - Integrated custom Highlighter component with 100+ languages
- ✅ **Image Gallery** - Auto preview and gallery mode for images with swipe navigation
- ✅ **Video Playback** - Native video player with full controls and auto-sizing
- ✅ **GitHub Flavored Markdown** - Tables, task lists, strikethrough, and more
- ✅ **CJK Friendly** - Optimized for Chinese, Japanese, and Korean text
- ✅ **Dark Theme** - Auto-adapts to dark/light themes
- ✅ **Custom Renderers** - Override rendering for any markdown element
- ✅ **Plugin System** - Support for remark plugins (via ReactNativeMarkdown)
- ✅ **Type Safe** - Full TypeScript support with comprehensive types
- ✅ **Custom Styles** - Fine-grained control over markdown element styles

## Components

### Markdown (Simplified API)

A high-level wrapper with simplified API for common use cases:

```tsx
import { Markdown } from '@lobehub/ui-rn';

export default function App() {
  return (
    <Markdown fontSize={16} lineHeight={1.8}>
      # Hello World This is **bold** and *italic* text.
    </Markdown>
  );
}
```

### ReactNativeMarkdown (Advanced API)

For advanced use cases with plugin support and tree transformations:

```tsx
import { ReactNativeMarkdown } from '@lobehub/ui-rn';
import remarkEmoji from 'remark-emoji';

export default function App() {
  return <ReactNativeMarkdown remarkPlugins={[remarkEmoji]}>Hello :wave:</ReactNativeMarkdown>;
}
```

## Basic Usage

```tsx
import { Markdown } from '@lobehub/ui-rn';

const content = `
# Heading 1
## Heading 2

This is **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`
`;

export default () => <Markdown>{content}</Markdown>;
```

## Custom Renderers

Override default rendering for specific markdown elements:

```tsx
import { Markdown } from '@lobehub/ui-rn';

import Text from '@/components/Text';

<Markdown
  customRenderers={{
    ParagraphRenderer: ({ node }) => <Text style={{ color: 'blue' }}>Custom paragraph</Text>,
  }}
>
  This is a custom paragraph.
</Markdown>;
```

## Custom Styles

Customize the appearance of markdown elements:

```tsx
<Markdown
  customStyles={{
    paragraph: {
      fontSize: 16,
      color: '#333',
    },
    heading: (level) => ({
      fontSize: 20 + (6 - level) * 4,
      fontWeight: 'bold',
    }),
  }}
>
  # Styled Markdown
</Markdown>
```

## Supported Features

### Image Gallery

Images in Markdown automatically support preview and gallery mode:

```tsx
import { Markdown } from '@lobehub/ui-rn';

const content = `
![Small Badge](https://img.shields.io/badge/LobeHub-Readme%20Generator-white?labelColor=black&style=flat-square)

![Large Image](https://github.com/user-attachments/assets/2428a136-38bf-488c-8033-d9f261d67f3d)
`;

// 默认启用图片画廊
<Markdown>{content}</Markdown>

// 禁用图片画廊
<Markdown enableImageGallery={false}>{content}</Markdown>
```

**Features:**

- ✅ Auto-sizing: Large images scale to fit, small images display at original size
- ✅ Click to preview: Tap any image to view full screen
- ✅ Gallery mode: Multiple images can be swiped between
- ✅ Zoom & pan: Full gesture support in preview mode
- ✅ Smart fallback: Displays placeholder if image fails to load

### Video Playback

Videos in Markdown use the native Video component with full playback controls:

```tsx
import { Markdown } from '@lobehub/ui-rn';

const content = `
<video src="https://example.com/video.mp4"></video>
`;

<Markdown>{content}</Markdown>;
```

**Features:**

- ✅ Native video controls: Play, pause, seek, volume
- ✅ Auto-sizing: Maintains 16:9 aspect ratio by default
- ✅ Fullscreen support: Tap fullscreen button to expand
- ✅ Picture-in-picture: Continue watching while using other apps
- ✅ Adaptive streaming: Efficient playback with hardware acceleration

### GitHub Flavored Markdown

- **Tables** - Full table support with styling
- **Task Lists** - `- [x]` and `- [ ]` checkboxes
- **Strikethrough** - `~~text~~` renders as ~~text~~
- **Autolinks** - Automatically linkify URLs

### Math Formulas

Supports LaTeX math expressions via remark-math:

- Inline: `$E = mc^2$`
- Block: `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`

### Code Highlighting

Integrated Highlighter component with syntax highlighting for 100+ languages.

## Architecture

- **Markdown** - High-level wrapper with simplified API
- **ReactNativeMarkdown** - Low-level component with full plugin support
- Based on **unified/remark** ecosystem for markdown parsing
- Custom React Native renderers for optimal performance

For detailed API documentation, see:

- [ReactNativeMarkdown README](./ReactNativeMarkdown/README.md)
- Component props in `type.ts`
