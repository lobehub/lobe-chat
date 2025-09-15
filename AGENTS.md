# LobeChat Development Guidelines

This document serves as a comprehensive guide for all team members when developing LobeChat.

## Tech Stack

Built with modern technologies:

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Ant Design, @lobehub/ui, antd-style
- **State Management**: Zustand, SWR
- **Database**: PostgreSQL, PGLite, Drizzle ORM
- **Testing**: Vitest, Testing Library
- **Package Manager**: pnpm (monorepo structure)
- **Build Tools**: Next.js (Turbopack in dev, Webpack in prod), Vitest

## Directory Structure

The project follows a well-organized monorepo structure:

- `apps/` - Main applications
- `packages/` - Shared packages and libraries
- `src/` - Main source code
- `docs/` - Documentation
- `.cursor/rules/` - Development rules and guidelines

## Development Workflow

### Git Workflow

- Use rebase for git pull: `git pull --rebase`
- Git commit messages should prefix with gitmoji
- Git branch name format: `username/feat/feature-name`
- Use `.github/PULL_REQUEST_TEMPLATE.md` for PR descriptions

### Package Management

- Use `pnpm` as the primary package manager
- Use `bun` to run npm scripts
- Use `bunx` to run executable npm packages
- Navigate to specific packages using `cd packages/<package-name>`

### Code Style Guidelines

#### TypeScript

- Follow strict TypeScript practices for type safety and code quality
- Use proper type annotations
- Prefer interfaces over types for object shapes
- Use generics for reusable components

#### React Components

- Use functional components with hooks
- Follow the component structure guidelines
- Use antd-style & @lobehub/ui for styling
- Implement proper error boundaries

#### Database Schema

- Follow Drizzle ORM naming conventions
- Use plural snake_case for table names
- Implement proper foreign key relationships
- Follow the schema style guide

### Testing Strategy

**Required Rule**: `testing-guide/testing-guide.mdc`

**Commands**:

- Web: `bunx vitest run --silent='passed-only' '[file-path-pattern]'`
- Packages: `cd packages/[package-name] && bunx vitest run --silent='passed-only' '[file-path-pattern]'`

**Important Notes**:

- Wrap file paths in single quotes to avoid shell expansion
- Never run `bun run test` - this runs all tests and takes ~10 minutes
- If a test fails twice, stop and ask for help
- Always add tests for new code

### Type Checking

- Use `bun run type-check` to check for type errors
- Ensure all TypeScript errors are resolved before committing

### Internationalization

- Add new keys to `src/locales/default/namespace.ts`
- Translate at least `zh-CN` files for development preview
- Use hierarchical nested objects, not flat keys
- Don't run `pnpm i18n` manually (handled by CI)

## Available Development Rules

The project provides comprehensive rules in `.cursor/rules/` directory:

### Core Development

- `backend-architecture.mdc` - Three-layer architecture and data flow
- `react-component.mdc` - Component patterns and UI library usage
- `drizzle-schema-style-guide.mdc` - Database schema conventions
- `define-database-model.mdc` - Model templates and CRUD patterns
- `i18n.mdc` - Internationalization workflow

### State Management & UI

- `zustand-slice-organization.mdc` - Store organization patterns
- `zustand-action-patterns.mdc` - Action implementation patterns
- `packages/react-layout-kit.mdc` - Flex layout component usage

### Testing & Quality

- `testing-guide/testing-guide.mdc` - Comprehensive testing strategy
- `code-review.mdc` - Code review process and standards

### Desktop (Electron)

- `desktop-feature-implementation.mdc` - Main/renderer process patterns
- `desktop-local-tools-implement.mdc` - Tool integration workflow
- `desktop-menu-configuration.mdc` - Menu system configuration
- `desktop-window-management.mdc` - Window management patterns
- `desktop-controller-tests.mdc` - Controller testing guide

## Best Practices

- **Conservative for existing code, modern approaches for new features**
- **Code Language**: Use Chinese for files with existing Chinese comments, American English for new files
- Always add tests for new functionality
- Follow the established patterns in the codebase
- Use proper error handling and logging
- Implement proper accessibility features
- Consider internationalization from the start
