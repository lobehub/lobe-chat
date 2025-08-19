---
description: TypeScript code style and optimization guidelines
globs: *.ts,*.tsx,*.mts
alwaysApply: false
---

# TypeScript Code Style Guide

## Types and Type Safety

- Avoid explicit type annotations when TypeScript can infer types.
- Avoid implicitly `any` variables; explicitly type when necessary (e.g., `let a: number` instead of `let a`).
- Use the most accurate type possible (e.g., prefer `Record<PropertyKey, unknown>` over `object`).
- Prefer `interface` over `type` for object shapes (e.g., React component props). Keep `type` for unions, intersections, and utility types.
- Prefer `as const satisfies XyzInterface` over plain `as const` when suitable.

## Imports and Modules

- When importing a directory module, prefer the explicit index path like `@/db/index` instead of `@/db`.

## Asynchronous Patterns and Concurrency

- Prefer `async`/`await` over callbacks or chained `.then` promises.
- Prefer async APIs over sync ones (avoid `*Sync`).
- Prefer promise-based variants (e.g., `import { readFile } from 'fs/promises'`) over callback-based APIs from `fs`.
- Where safe, convert sequential async flows to concurrent ones with `Promise.all`, `Promise.race`, etc.

## Code Structure and Readability

- Refactor repeated logic into reusable functions.
- Prefer object destructuring when accessing and using properties.
- Use consistent, descriptive naming; avoid obscure abbreviations.
- Use semantically meaningful variable, function, and class names.
- Replace magic numbers or strings with well-named constants.
- Keep meaningful code comments; do not remove them when applying edits. Update comments when behavior changes.
- Ensure JSDoc comments accurately reflect the implementation.
- Look for opportunities to simplify or modernize code with the latest JavaScript/TypeScript features where it improves clarity.
- Defer formatting to tooling; ignore purely formatting-only issues and autofixable lint problems.
- Respect project Prettier settings.

## UI and Theming

- Use components from `@lobehub/ui`, Ant Design, or existing design system components instead of raw HTML tags (e.g., `Button` vs. `button`).
- Design for dark mode and mobile responsiveness:
  - Use the `antd-style` token system instead of hard-coded colors.
  - Select appropriate component variants.

## Performance

- Prefer `for…of` loops to index-based `for` loops when feasible.
- Decide whether callbacks should be debounced or throttled based on UX and performance needs.
- Reuse existing npm packages rather than reinventing the wheel (e.g., `lodash-es/omit`).
- Query only the required columns from a database rather than selecting entire rows.

## Time and Consistency

- Instead of calling `Date.now()` multiple times, assign it to a constant once and reuse it to ensure consistency and improve readability.

## Some logging rules

- Never log user private information like api key, etc
- Don't use `import { log } from 'debug'` to log messages, because it will directly log the message to the console.
