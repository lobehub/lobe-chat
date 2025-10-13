---
group: Basic
title: Text
description: Basic component for displaying text, providing rich styling and semantic options.
---

## When to Use

- Display titles, paragraphs, and other text content
- Semantic markup for text (success, warning, danger, etc.)
- Text styling (bold, italic, underline, etc.)
- Handle text overflow and ellipsis

## Style Description

### Tag Types (as)

- `h1`: 38px, bold
- `h2`: 30px, bold
- `h3`: 24px, bold
- `h4`: 20px, bold
- `h5`: 16px, bold
- `p`: 14px, normal

### Semantic Types (type)

- `secondary`: Secondary text color
- `success`: Success color (green)
- `warning`: Warning color (orange)
- `danger`: Danger color (red)
- `info`: Info color (blue)

### Boolean Attributes

- `strong`: Apply bold font weight
- `italic`: Apply italic style
- `underline`: Add underline
- `delete`: Add strikethrough
- `mark`: Add yellow background highlight
- `code`: Apply code style (monospace font, light gray background)
- `disabled`: Apply disabled style (light gray text)

## Notes

1. `as` and custom `fontSize` can be used together, custom value will override default
2. `type` and custom `color` can be used together, custom value will override default
3. `strong` and custom `weight` can be used together, custom value will override default
4. `ellipsis` will automatically set `numberOfLines`, but explicitly set `numberOfLines` has higher priority
5. Multiple boolean attributes can be combined (e.g., `strong` + `underline` + `italic`)
