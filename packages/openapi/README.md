# @lobechat/openapi

LobeChat OpenAPI server implementation using Hono framework.

## Features

- RESTful API endpoints for LobeChat
- Built with Hono framework for high performance
- Type-safe with Zod validation
- Modular architecture with controllers, services, and middleware

## Usage

```typescript
import { honoApp } from '@lobechat/openapi';
```

## Structure

- `src/app.ts` - Main Hono application
- `src/controllers/` - API controllers
- `src/services/` - Business logic services
- `src/routes/` - Route definitions
- `src/middleware/` - Custom middleware
- `src/types/` - TypeScript type definitions
- `src/helpers/` - Utility functions
