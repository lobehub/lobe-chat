---
name: source-layout
description: 'Use for where a file lives, how it is named, where its tests go, and how to split a source or test file over 800 lines (拆分大文件, 目录结构, 文件命名).'
user-invocable: false
---

# Source Layout

Top-level ownership (`src/features`, `src/routes`, `apps/server/src`, `packages`, …) is in `AGENTS.md` and `project-overview`. This skill owns placement and naming inside those roots, test placement, and how a large file becomes a directory. The rules record the conventions the codebase already follows; where it was split between two forms, the rule names the one to use for new files. Do not rename existing files only to match.

## 1. Names

| What                                                 | Form                  | Example                                        |
| ---------------------------------------------------- | --------------------- | ---------------------------------------------- |
| React component file / component directory           | PascalCase            | `PlanCard.tsx`, `ChatInput/ControlBar/`        |
| Hook                                                 | `useXxx.ts(x)`        | `ChatInputNotice/useChatInputNotice.ts`        |
| Other module                                         | camelCase or one word | `originLink.ts`, `recentDirs.ts`               |
| Server class module                                  | the class name        | `services/agentRuntime/CompletionLifecycle.ts` |
| Service, router, store, and other non-component dirs | camelCase             | `services/aiAgent/`, `store/chat/slices/`      |
| Package directory                                    | kebab-case            | `packages/agent-runtime/`                      |
| Files inside a package                               | camelCase             | `packages/database/src/models/`                |

A package whose files are already kebab-case (`alint`, `openapi`, `builtin-skills`) keeps kebab-case internally. Shared per-directory modules are `const.ts`, `types.ts`, `style.ts`, and `utils.ts`, not `constants.ts`, `type.ts`, `styles.ts`, or `helpers.ts`. Create one only when two or more modules in that directory use it; a constant or type used by one module stays in that module.

New files use named exports (`export const PlanCard = …`). Lint does not enforce this everywhere: this repository's `eslint.config.mjs` overrides `no-restricted-syntax`, which drops the shared `@lobehub/lint` warning on `export default`, so follow the rule by hand. Many existing components still default-export; keep an existing file's exports unchanged when moving it, so its callers do not change.

## 2. Tests

- `src/**`: colocate `Foo.test.ts(x)` beside `Foo`. A component directory's test is `index.test.ts(x)`.
- `apps/server/src/**` and `packages/**`: colocate by default. Use the directory's `__tests__/` when the domain requires it (database models and repositories, see `testing`), or when tests need shared fixtures, setup files, or several scenario files for one source (`services/comfyui/__tests__/`).
- One directory uses one placement. When it already has `__tests__/`, new tests for that directory go there. Do not migrate an existing mixed directory as a side task.
- Split a large test file by scenario: `Foo.<scenario>.test.ts` (`aiAgent/__tests__/execAgent.resume.test.ts`; `index.<scenario>.test.ts` for a directory entry). Put shared mock factories and fixtures in a `testUtils.ts` beside them; each test file keeps its own `vi.mock` calls, because Vitest hoists them per file.

## 3. File size

Source and test files stay at or below 800 lines. Check with `wc -l` before finishing an edit:

- A new or edited file that would exceed 800 lines is split in the same change.
- A file already over 800 lines must not grow. When a change would add lines to it, first extract the cohesive part the change touches.

The limit says when to split, not where. Split on a real boundary (state, reuse, render update, sub-domain, pipeline stage), as `react` requires; never cut a file at an arbitrary line count. When a heavy feature is mounted by several hosts, use `compose-atoms` instead.

## 4. Turning a file into a directory

A split keeps the public import path: `Foo.tsx` becomes `Foo/index.tsx`, so `import Foo from './Foo'` keeps working and callers do not change. Commit the move (`mkdir Foo && git mv Foo.tsx Foo/index.tsx`) alone before extracting, so reviewers can read the extraction diff separately and Git keeps the rename while those commits stay intact (a squash merge folds them together). `split-large-file` has the full procedure.

| Kind            | `index` keeps                                   | Siblings                                                                                                                   | Precedent                                |
| --------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| React component | Public API, shared top-level state, composition | Child components (PascalCase), `useXxx.ts` for state transitions and side effects, pure logic modules with their own tests | `Conversation/Messages/GoalTaskCard/`    |
| Server service  | The class and its orchestration methods         | Stage functions taking an explicit `deps` object (`pipeline/<stage>.ts`), sub-domain folders                               | `services/aiAgent/`, `services/comfyui/` |
| tRPC router     | The merged router                               | One sub-router per sub-domain (`market/agent.ts` exports `agentRouter`)                                                    | `routers/lambda/market/`                 |
| Zustand store   | —                                               | Follow `zustand`                                                                                                           | `src/store/page`                         |

- Prefer flat siblings. Add a sub-folder for a sub-area with several files of its own (`ChatInput/ControlBar/`), not a kind folder such as `components/` or `hooks/` for one or two files.
- A split moves code without changing behavior. Collapsing duplicated branches that become one component is in scope when existing tests cover each branch; any other behavior change belongs in a separate commit.
- Move the matching tests with the code they cover, then run `bun run check` with the test files passed explicitly: related-test discovery only finds `<name>.test.*`, so `index.tsx` does not pick up `index.<scenario>.test.ts`.
