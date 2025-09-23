# CLAUDE.md

This document serves as a shared guideline for all team members when using Claude Code in this repository.

## Tech Stack

read @.cursor/rules/project-introduce.mdc

## Directory Structure

read @.cursor/rules/project-structure.mdc

## Development

### Git Workflow

- use rebase for git pull
- git commit message should prefix with gitmoji
- git branch name format example: tj/feat/feature-name
- use .github/PULL_REQUEST_TEMPLATE.md to generate pull request description

### Package Management

This repository adopts a monorepo structure.

- Use `pnpm` as the primary package manager for dependency management
- Use `bun` to run npm scripts
- Use `bunx` to run executable npm packages

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
- **Command**:
  - web: `bunx vitest run --silent='passed-only' '[file-path-pattern]'`
  - packages(eg: database): `cd packages/database && bunx vitest run --silent='passed-only' '[file-path-pattern]'`

**Important**:

- wrapped the file path in single quotes to avoid shell expansion
- Never run `bun run test` etc to run tests, this will run all tests and cost about 10mins
- If try to fix the same test twice, but still failed, stop and ask for help.

### Typecheck

- use `bun run type-check` to check type errors.

### i18n

- **Keys**: Add to `src/locales/default/namespace.ts`
- **Dev**: Translate `locales/zh-CN/namespace.json` locale file only for preview
- DON'T run `pnpm i18n`, let CI auto handle it

## Rules Index

Some useful rules of this project. Read them when needed.

**IMPORTANT**: All rule files referenced in this document are located in the `.cursor/rules/` directory. Throughout this document, rule files are referenced by their filename only for brevity.

### 📋 Complete Rule Files

**Core Development**

- `backend-architecture.mdc` - Three-layer architecture, data flow
- `react-component.mdc` - antd-style, Lobe UI usage
- `drizzle-schema-style-guide.mdc` - Schema naming, patterns
- `define-database-model.mdc` - Model templates, CRUD patterns
- `i18n.mdc` - Internationalization workflow

**State & UI**

- `zustand-slice-organization.mdc` - Store organization
- `zustand-action-patterns.mdc` - Action patterns
- `packages/react-layout-kit.mdc` - flex layout components usage

**Testing & Quality**

- `testing-guide/testing-guide.mdc` - Test strategy, mock patterns
- `code-review.mdc` - Review process and standards

**Desktop (Electron)**

- `desktop-feature-implementation.mdc` - Main/renderer process patterns
- `desktop-local-tools-implement.mdc` - Tool integration workflow
- `desktop-menu-configuration.mdc` - App menu, context menu, tray menu
- `desktop-window-management.mdc` - Window creation, state management, multi-window
- `desktop-controller-tests.mdc` - Controller unit testing guide
