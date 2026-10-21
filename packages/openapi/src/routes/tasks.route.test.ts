import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';

// The route module pulls in the db graph (via the permission middleware) and the
// better-auth graph (via `requireAuth`) at import time; this test is only about
// the gates the route itself declares, so both are stubbed. The permission
// middleware is deliberately NOT stubbed: the API-key scope narrowing inside it
// is exactly what these cases exercise.
vi.mock('@/database/core/db-adaptor', () => ({ getServerDB: vi.fn() }));
vi.mock('@/database/models/rbac', () => ({
  RbacModel: class {
    hasAnyPermission = async () => true;
  },
}));
vi.mock('../middleware/auth', () => ({
  requireAuth: async (_c: any, next: any) => next(),
}));
vi.mock('../controllers/task.controller', () => ({
  TaskController: class {
    runTask(c: any) {
      return c.json({ data: { body: c.req.valid('json'), id: c.req.param('id') }, success: true });
    }
  },
}));

const { default: TaskRoutes } = await import('./tasks.route');

/** A request authenticated as an API key holding exactly `scopes`. */
const requestAs = (scopes: string[], path: string, init?: { body?: unknown; method?: string }) => {
  const app = new Hono();

  app.use('*', async (c, next) => {
    c.set('userId' as never, 'user-1' as never);
    c.set('authType' as never, 'apikey' as never);
    c.set('apiKeyScopes' as never, scopes as never);
    await next();
  });
  app.route('/', TaskRoutes);

  return app.request(path, {
    ...(init?.body === undefined
      ? {}
      : { body: JSON.stringify(init.body), headers: { 'content-type': 'application/json' } }),
    method: init?.method ?? 'GET',
  });
};

describe('POST /tasks/:id/run API-key scopes and validation', () => {
  it('rejects a read-only key', async () => {
    const res = await requestAs(['agent:read', 'model:invoke'], '/T-1/run', {
      body: {},
      method: 'POST',
    });

    expect(res.status).toBe(403);
  });

  it('rejects a task-write key that may not invoke models', async () => {
    const res = await requestAs(['agent:write'], '/T-1/run', { body: {}, method: 'POST' });

    expect(res.status).toBe(403);
  });

  it('starts the run for a key holding agent:write and model:invoke', async () => {
    const res = await requestAs(['agent:write', 'model:invoke'], '/T-1/run', {
      body: { prompt: 'look again' },
      method: 'POST',
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ data: { body: { prompt: 'look again' }, id: 'T-1' } });
  });

  it('accepts a request without a body', async () => {
    const res = await requestAs(['agent:write', 'model:invoke'], '/T-1/run', { method: 'POST' });

    expect(res.status).toBe(200);
  });

  it('rejects an empty prompt', async () => {
    const res = await requestAs(['agent:write', 'model:invoke'], '/T-1/run', {
      body: { prompt: '' },
      method: 'POST',
    });

    expect(res.status).toBe(400);
  });
});
