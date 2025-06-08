# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LobeChat is an open-source, modern-design AI chat framework built with Next.js 15. It supports multi-modal AI interactions, extensible plugin systems, and one-click deployment. The project emphasizes design engineering, performance, and developer experience.

**Key Technologies:**

- Next.js 15 with App Router
- React 19 with Server Components
- TypeScript throughout
- Zustand for state management
- tRPC for type-safe APIs
- Drizzle ORM with PostgreSQL/PGlite
- Ant Design + @lobehub/ui components
- pnpm as package manager

## Development Commands

### Core Development

```bash
# Start development server
pnpm dev         # Port 3010 with Turbopack
pnpm dev:desktop # Desktop development on port 3015

# Build and deployment
pnpm build         # Production build
pnpm build:analyze # Bundle analysis
pnpm build:docker  # Docker build
pnpm start         # Start production server (port 3210)

# Desktop application
pnpm desktop:build # Full desktop build pipeline
```

### Database Operations

```bash
# Schema and migrations
pnpm db:generate # Generate Drizzle schema + client migrations
pnpm db:migrate  # Run server database migrations

# Development database
pnpm db:push-test # Push to test database
```

### Code Quality

```bash
# Linting and type checking
pnpm lint       # Run all linting (TS, style, circular deps)
pnpm lint:ts    # ESLint for TS/JS files
pnpm lint:style # Stylelint for styled components
pnpm type-check # TypeScript compiler check

# Testing
pnpm test        # Run all tests (app + server)
pnpm test-app    # Client-side tests only
pnpm test-server # Server-side tests only
```

### Content Workflows

```bash
# Internationalization
pnpm i18n      # Generate and process translations
pnpm docs:i18n # Process documentation translations

# Documentation
pnpm workflow:docs # Generate documentation workflows
pnpm workflow:mdx  # Process MDX files
```

## Architecture Overview

### Multi-Environment Database Strategy

The application supports three deployment modes:

- **Browser/PWA**: PGlite (WASM PostgreSQL) for local data
- **Server**: Remote PostgreSQL with full multi-user support
- **Desktop**: PGlite with optional cloud sync via tRPC

### State Management (Zustand Slices)

Located in `src/store/`, organized by domain:

- `chat/` - Messages, AI interactions, tools, topics
- `session/` - Session management and switching
- `user/` - Settings, preferences, authentication
- `agent/` - AI agent configurations
- `aiInfra/` - Model providers and infrastructure
- `file/` - File upload and knowledge base
- `tool/` - Plugin and tool management

Each slice follows the pattern:

```
slices/[domain]/
├── actions/ (or action.ts)     # State mutations
├── initialState.ts             # State interface + defaults
├── selectors.ts               # State queries (export as xxxSelectors)
└── reducer.ts (optional)      # Immer-based reducers
```

### Backend Architecture (src/server/)

Three-layer backend design:

1. **tRPC Routers** (`src/server/routers/`) - API endpoints
2. **Service Layer** (`src/server/services/`) - Business logic with platform abstractions
3. **Data Layer** (`src/database/`) - Models, repositories, schemas

Services use `impls/` subdirectories to abstract platform differences (e.g., S3 vs local storage).

### Frontend Architecture (src/app/)

Next.js App Router with advanced patterns:

- **Parallel Routes**: `@modal`, `@session`, `@conversation`, `@portal`
- **Route Groups**: `(backend)/` for APIs, `[variants]/` for app routes
- **Layout Strategy**: Responsive desktop/mobile layouts throughout
- **Server Components**: Extensive use for performance

### Feature Organization (src/features/)

Domain-driven feature modules with co-located:

- Components and UI
- Hooks and utilities
- Local state management
- Feature-specific services

## Key Patterns and Conventions

### Component Architecture

- Use functional components with hooks
- Prefer Server Components when possible
- Co-locate components with their features
- Use @lobehub/ui and Ant Design consistently

### State Management Patterns

- Zustand slices with selector aggregation: `export const xxxSelectors = { ... }`
- Immer for immutable updates in reducers
- Map structures for relational data: `Record<string, T[]>`
- Loading states as ID arrays: `loadingIds: string[]`

### Database Patterns

- Drizzle ORM with schema-first approach
- Repository pattern for complex queries
- Direct model access for simple CRUD
- Dual migration system (server + client)

### API Patterns

- tRPC for type-safe server communication
- Service layer abstractions with `impls/` for platform differences
- RESTful endpoints for webhooks and external integrations

### File Naming Conventions

- Use kebab-case for directories and files
- React components in PascalCase
- TypeScript interfaces with descriptive names
- Consistent patterns: `initialState.ts`, `selectors.ts`, `action.ts`

## AI Provider Integration

The project supports 42+ AI providers through a unified abstraction layer. When adding new providers:

1. Implement in `src/libs/agent-runtime/`
2. Add configuration in `src/config/aiModels/`
3. Update provider lists and documentation
4. Test with multiple model types (text, vision, reasoning)

## Testing Strategy

- **Unit Tests**: Vitest for utilities and services
- **Component Tests**: React Testing Library for UI
- **Integration Tests**: Full API and database flows
- **Database Tests**: Separate test database configuration

Run specific test suites:

```bash
pnpm test-app:coverage    # Client tests with coverage
pnpm test-server:coverage # Server tests with coverage
```

## Deployment Notes

### Environment Variables

Critical variables include:

- `OPENAI_API_KEY` - AI provider access
- `DATABASE_URL` - PostgreSQL connection (server mode)
- `NEXTAUTH_SECRET` - Authentication secret
- Provider-specific API keys

### Docker Deployment

```bash
# Standard build
pnpm self-hosting:docker

# With Chinese mirror
pnpm self-hosting:docker-cn

# Database variant
pnpm self-hosting:docker-cn@database
```

### Desktop Application

The Electron app requires special build processes:

```bash
pnpm desktop:build-next     # Next.js build for desktop
pnpm desktop:prepare-dist   # Prepare distribution files
pnpm desktop:build-electron # Electron packaging
```

## Performance Considerations

- Lighthouse scores target >90 for all metrics
- Use React Server Components for initial page loads
- Implement proper loading states and skeleton UIs
- Optimize bundle size with dynamic imports
- Leverage Turbopack for fast development builds

## Contributing Guidelines

When working on this codebase:

1. Follow the established architectural patterns
2. Use TypeScript strictly - avoid `any` types
3. Update tests for new functionality
4. Run the full lint suite before committing
5. Consider both local and server deployment modes
6. Test with multiple AI providers when relevant
7. Maintain responsive design across desktop/mobile

This architecture enables LobeChat to scale from personal use to enterprise deployment while maintaining excellent developer experience and performance.
