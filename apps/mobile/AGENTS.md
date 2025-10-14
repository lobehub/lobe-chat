# LobeChat Mobile Agent Guide

## Project Overview

- React Native + Expo app delivering the LobeChat AI chat experience for iOS and Android from a shared codebase.
- Core entry points: `src/app/_layout.tsx` wires global providers, while `src/app/index.tsx` (and nested routes under `src/app/(main)`) drive navigation via Expo Router.
- State flows through colocated Zustand stores such as `store/chat`, `store/session`, and `store/openai`; selectors in `store/session/selectors` keep components efficient.
- Key platform features include Markdown + math rendering (React Native Markdown, Shiki, MathJax), streaming chat transport via `utils/fetchSSE`, and tRPC clients configured in `utils/trpc`.
- Follow the domain guides in `rules/` (e.g., `project-overview.mdc`, `state-management.mdc`, `api-integration.mdc`) for deeper architecture context before implementing changes.

## Build and Test Commands

| Task                           | Command                                           | Notes                                                             |
| ------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------- |
| Install dependencies           | `pnpm install`                                    | Requires Node 18+ and pnpm 8+.                                    |
| Start Expo dev server          | `pnpm start`                                      | Opens the Metro bundler with QR code pairing.                     |
| Run on iOS simulator/device    | `pnpm ios` / `pnpm device:ios`                    | Uses `expo run:ios`; ensure Xcode tooling is installed.           |
| Run on Android emulator/device | `pnpm android` / `pnpm device:android`            | Uses `expo run:android`; start an emulator first.                 |
| Web preview                    | `pnpm web`                                        | Launches the web bundle for quick UI checks.                      |
| Jest unit tests                | `pnpm test`                                       | Runs through `jest-expo` with coverage enabled.                   |
| Lint TypeScript/JS             | `pnpm lint`                                       | Delegates to Expo + ESLint rules defined in repo.                 |
| Format sources                 | `pnpm prettier`                                   | Applies Prettier across the workspace.                            |
| Generate translations          | `pnpm i18n`                                       | Executes scripted workflow from `rules/internationalization.mdc`. |
| Production builds              | `pnpm production:ios` / `pnpm production:android` | Wraps EAS build profiles from `eas.json`.                         |

## Code Style Guidelines

- TypeScript runs in strict mode; define interfaces/types for component props and store state, avoiding `any`. Reference `rules/app-structure.mdc` and `rules/state-management.mdc` for patterns.
- File naming: Components in PascalCase, hooks in camelCase prefixed with `use`, utilities in camelCase, constants in UPPER_SNAKE_CASE (see `rules/development-workflow.mdc`).
- Use absolute imports with the `@/` alias; group imports by React, third-party, then internal modules.
- Keep UI logic declarative; colocate styles in `styles.ts` companions and respect theming conventions from `rules/color-system.mdc`.
- Run `pnpm lint` and `pnpm prettier` before committing. Git hooks enforce Conventional Commits and formatting, so align commit messages with `feat|fix|chore` etc.

## Testing Instructions

- Place tests under `test/` or alongside components as `*.test.ts(x)` per `rules/react-native.mdc` guidance.
- Use `@testing-library/react-native` for rendering and interaction assertions; rely on user-centered queries rather than implementation details.
- Mock async integrations (SecureStore, **MMKV**, network services) using Jest mocks; reference `rules/debug-usage.mdc` for logging utilities during tests.
- MMKV is mocked in `test/utils.tsx` with an in-memory Map for test isolation.
- Prefer explicit assertions over brittle snapshots; when snapshots are required, keep them under `__snapshots__` directories.
- Run `pnpm test --watch` during iteration and ensure `pnpm test` + `pnpm lint` pass before opening a PR.

## Security Considerations

- Keep provider keys in `.env.local` (copied from `.env.example`) and load them through the secure configuration flows in `store/openai`; never commit secrets.
- Persist sensitive tokens with `expo-secure-store`; configuration data uses MMKV as outlined in `rules/state-management.mdc`.
- Validate API responses and sanitize Markdown before render—Shiki/remark plugins are already configured, but keep dependencies patched.
- Enforce HTTPS endpoints for remote calls; review EAS credentials and signing configs before production builds.
- Monitor dependency upgrades touching auth libraries (`expo-auth-session`, `jose`, `jwt-decode`) and align with guidance in `rules/development-workflow.mdc`.

## Additional References

- `rules/quick-reference.mdc` for command cheatsheets.
- `rules/internationalization.mdc` to extend locale coverage.
- `rules/debug-usage.mdc` for logging and diagnostics standards.
