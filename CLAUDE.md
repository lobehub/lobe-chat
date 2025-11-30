# CLAUDE.md

This document serves as a shared guideline for all team members when using Claude Code in this repository.

## Tech Stack

read @.cursor/rules/project-introduce.mdc

## Directory Structure

read @.cursor/rules/project-structure.mdc

## Development

### Git Workflow

- The current release branch is `next` instead of `main` until v2.0.0 is officially released
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

### Testing

- **Required Rule**: read `@.cursor/rules/testing-guide/testing-guide.mdc` before writing tests
- **Command**:
  - web: `bunx vitest run --silent='passed-only' '[file-path-pattern]'`
  - packages(eg: database): `cd packages/database && bunx vitest run --silent='passed-only' '[file-path-pattern]'`

**Important**:

- wrap the file path in single quotes to avoid shell expansion
- Never run `bun run test` etc to run tests, this will run all tests and cost about 10mins
- If trying to fix the same test twice, but still failed, stop and ask for help.

### Typecheck

- use `bun run type-check` to check type errors.

### i18n

- **Keys**: Add to `src/locales/default/namespace.ts`
- **Dev**: Translate `locales/zh-CN/namespace.json` and `locales/en-US/namespace.json` locales file only for dev preview
- DON'T run `pnpm i18n`, let CI auto handle it

## Linear Issue Management

When working with Linear issues:

1. **Retrieve issue details** before starting work using `mcp__linear-server__get_issue`
2. **Check for sub-issues**: If the issue has sub-issues, retrieve and review ALL sub-issues using `mcp__linear-server__list_issues` with `parentId` filter before starting work
3. **Update issue status** when completing tasks using `mcp__linear-server__update_issue`
4. **MUST add completion comment** using `mcp__linear-server__create_comment`

### Completion Comment (REQUIRED)

**Every time you complete an issue, you MUST add a comment summarizing the work done.** This is critical for:

- Team visibility and knowledge sharing
- Code review context
- Future reference and debugging

**Workflow:**

1. Complete the implementation
2. Run type check: `bun run type-check`
3. Run related tests if applicable
4. Update issue status to "Done": `mcp__linear-server__update_issue`
5. **Add completion comment**: `mcp__linear-server__create_comment` ← DO NOT SKIP THIS STEP

## Rules Index

Some useful project rules are listed in @.cursor/rules/rules-index.mdc
