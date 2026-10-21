# StyleX Migration Workflow

Moves the files in `scripts/stylexMigration/legacyFiles.json` from emotion (`createStaticStyles`) to StyleX, one module at a time. Rules for writing StyleX live in the `react` skill; this file only defines the batching and the per-module loop.

## Module = one batch

A module is one `area` from `bun run stylex:migration` (for example `src/features/Settings`). One module = one branch = one PR, based on `canary`. Branch: `refactor/stylex-<module>`. Modules never share files, so batches run in parallel without conflicts. `legacyFiles.json` is the only shared file: prune it once per module, rebase on conflict.

## Per-module loop

1. `bun run stylex:migration --codemod --path <module>` converts what the codemod can (tiers A/B). Skipped files are listed with a reason.
2. Convert the skipped files by hand, a whole file at a time (tier C: `stylex.defaultMarker()` + `stylex.when.ancestor()` or `xstyle`; tier D: scoped plain CSS).
3. `bun run stylex:migration --prune-legacy`.
4. `bun run check --lint --test`, then `node_modules/.bin/tsgo --noEmit -p tsconfig.type-check.json` (see the note on Bun < 1.4.3 in `AGENTS.md`).
5. Visual check on tiers B-D: `__lobeStyleSnapshot.capture` / `compare` from the `react` skill, including hover, focus and open popovers.
6. Commit with the `♻️ refactor(styles): migrate <module> to StyleX` message, push, open the PR against `canary`.

## Order

1. Leaf packages and components with no cross-module `className` use: `packages/builtin-tool-*`, `packages/shared-tool-ui`, `src/components`.
2. Small `src/features/*` modules.
3. Large modules last, split by sub-directory: `Conversation`, `Acceptance`, `ChatInput`, `Settings`, `src/routes/(main)`.
