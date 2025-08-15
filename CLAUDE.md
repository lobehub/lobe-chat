# CLAUDE.md

This document serves as a shared guideline for all team members when using Claude Code in this repository.

## Suggestions

- When searching the project source code, it is recommended to exclude: `src/database/migrations/meta`, `**/*.test.*`, `**/__snapshots__`, `**/fixtures`
- Please store all temporary scripts (such as migration and refactoring scripts) in the `docs/.local/` directory; the contents of this folder will not be committed.

## Technologies Stack

read @.cursor/rules/project-introduce.mdc for more details.

### Directory Structure

```plaintext
src/
├── app/                 # Next.js App Router
├── features/            # Feature-based UI components
├── store/              # Zustand state stores
├── services/           # Client services (tRPC/Model calls)
├── server/             # Server-side (tRPC routers, services)
├── database/           # Schemas, models, repositories
├── libs/               # External library integrations
```

### Data Flow

- **Client DB Version**: UI → Zustand → Service → Model → PGLite
- **Server DB Version**: UI → Zustand → Service → tRPC → Repository/Model → PostgreSQL

## Development

### Git Workflow

- use rebase for git pull.
- git commit message should prefix with gitmoji.
- git branch name format example: tj/feat/feature-name
- use .github/PULL_REQUEST_TEMPLATE.md to generate pull request description

### Package Management

this is a monorepo project and we use `pnpm` as package manager

### TypeScript Code Style Guide

see @.cursor/rules/typescript.mdc

### Modify Code Rules

- **Code Language**:
  - For files with existing Chinese comments: Continue using Chinese to maintain consistency
  - For new files or files without Chinese comments: MUST use American English.
    - eg: new react tsx file and new test file
- Conservative for existing code, modern approaches for new features

### Testing

Testing work follows the Rule-Aware Task Execution system above.

- **Required Rule**: `testing-guide/testing-guide.mdc`
- **Command**: `npx vitest run --config vitest.config.ts '[file-path-pattern]'`, wrapped in single quotes to avoid shell expansion

**Important**:

- Never run `bun run test` etc to run tests, this will run all tests and cost about 10mins
- If try to fix the same test twice, but still failed, stop and ask for help.

### Typecheck

- use `bun run type-check` to check type errors.

### Internationalization

- **Keys**: Add to `src/locales/default/namespace.ts`
- **Dev**: Translate at least `zh-CN` files for preview
- **Structure**: Hierarchical nested objects, not flat keys
- **Script**: DON'T run `pnpm i18n` (user/CI handles it)

## Rules Index

Some useful rules of this project. Read them when needed.

**IMPORTANT**: All rule files referenced in this document are located in the `.cursor/rules/` directory. Throughout this document, rule files are referenced by their filename only for brevity.

### 📋 Complete Rule Files

**Core Development**

- `backend-architecture.mdc` - Three-layer architecture, data flow
- `react-component.mdc` - antd-style, Lobe UI usage
- `drizzle-schema-style-guide.mdc` - Schema naming, patterns
- `define-database-model.mdc` - Model templates, CRUD patterns

**State & UI**

- `zustand-slice-organization.mdc` - Store organization
- `zustand-action-patterns.mdc` - Action patterns
- `packages/react-layout-kit.mdc` - Layout components usage

**Testing & Quality**

- `testing-guide/testing-guide.mdc` - Test strategy, mock patterns
- `code-review.mdc` - Review process and standards

**Desktop (Electron)**

- `desktop-feature-implementation.mdc` - Main/renderer process patterns
- `desktop-local-tools-implement.mdc` - Tool integration workflow
- `desktop-menu-configuration.mdc` - App menu, context menu, tray menu
- `desktop-window-management.mdc` - Window creation, state management, multi-window
- `desktop-controller-tests.mdc` - Controller unit testing guide

**Development Tools**

- `i18n.mdc` - Internationalization workflow
- `debug.mdc` - Debugging strategies
