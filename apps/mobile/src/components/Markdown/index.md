---
group: Display
title: Markdown
description: Powerful React Native Markdown rendering component with math formulas, code highlighting, images, videos, and more content types support.
---

## Features

- ✅ **Math Formula Rendering** - Supports MathJax math formula display
- ✅ **Code Highlighting** - Integrated custom Highlighter component
- ✅ **Responsive Images** - Auto-calculate image height, responsive display
- ✅ **Video Support** - Supports video content rendering
- ✅ **Table Support** - Complete table styling and layout
- ✅ **Dark Theme** - Auto-adapts to dark/light themes
- ✅ **Custom Styles** - Rich style configuration options
- ✅ **Link Support** - Clickable links with auto-navigation
- ✅ **List Support** - Ordered and unordered lists
- ✅ **Quote Blocks** - Supports blockquote styling

## Basic Usage

```jsx
import { Markdown } from '@lobehub/ui-rn';

export default function App() {
  const markdownContent = `
# Title Example

This is **bold text** and *italic text* example.

## Code Example

\`\`\`javascript
function hello() {
  console.log('Hello World!');
}
\`\`\`

## Math Formula

Inline formula: $E = mc^2$

Block formula:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$
  `;

  return <Markdown content={markdownContent} />;
}
```

## Supported Features

### Math Formula Rendering

Based on MathJax engine, supports complex math expressions:

- Inline formulas: `$E = mc^2$`
- Block formulas: `$$\int_0^1 x^2 dx$$`

### Code Highlighting

Integrated Highlighter component, supports 100+ programming languages syntax highlighting.

### Images and Videos

- Auto-calculate image dimensions
- Responsive adaptation
- Supports video content

### Table Support

Complete table rendering and styling support, including borders, alignment, etc.

For more detailed information, please check the complete README documentation.
