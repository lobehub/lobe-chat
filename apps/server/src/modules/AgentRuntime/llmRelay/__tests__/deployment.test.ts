// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isLlmRelayDeploymentReady } from '../deployment';

const env = vi.hoisted(() => ({
  app: {} as Record<string, string | undefined>,
  redis: {} as Record<string, string | undefined>,
}));

vi.mock('@/envs/app', () => ({ appEnv: env.app }));
vi.mock('@/envs/redis', () => ({ redisEnv: env.redis }));

// The browser only stands by for a one-shot relay where the server can relay:
// a gateway it can push to and the Redis the relayed call runs through.
// Anything less and the server calls the provider itself, which cannot reach
// a model on the user's device — the browser must keep its own fallback then.
describe('isLlmRelayDeploymentReady', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    env.app.AGENT_GATEWAY_URL = 'https://gw';
    env.app.AGENT_GATEWAY_INTERNAL_URL = undefined;
    env.app.AGENT_GATEWAY_SERVICE_TOKEN = 'token';
    env.redis.REDIS_URL = 'redis://localhost:6379';
  });

  it('is ready with a gateway, its service token and Redis', () => {
    expect(isLlmRelayDeploymentReady()).toBe(true);
  });

  it('is not ready without Redis', () => {
    env.redis.REDIS_URL = undefined;
    expect(isLlmRelayDeploymentReady()).toBe(false);
  });

  it('is not ready with Redis disabled', () => {
    vi.stubEnv('DISABLE_REDIS', '1');
    expect(isLlmRelayDeploymentReady()).toBe(false);
  });

  it('is not ready without a gateway service token', () => {
    env.app.AGENT_GATEWAY_SERVICE_TOKEN = undefined;
    expect(isLlmRelayDeploymentReady()).toBe(false);
  });

  it('is not ready without a gateway', () => {
    env.app.AGENT_GATEWAY_URL = undefined;
    expect(isLlmRelayDeploymentReady()).toBe(false);
  });
});
