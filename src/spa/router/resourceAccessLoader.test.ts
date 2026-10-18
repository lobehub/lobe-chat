import type { LoaderFunctionArgs } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { agentAccessLoader, agentGroupAccessLoader } from './resourceAccessLoader';

const loaderModule = vi.hoisted(() => ({ evaluated: false }));

// Evaluating the real loader means the resource-permission store reached the
// entry chunk's first-screen graph.
vi.mock('@/features/ResourcePermission/accessLoader', () => {
  loaderModule.evaluated = true;
  return { preHydrateResourceAccess: vi.fn(async () => null) };
});

const args = (params: Record<string, string>) => ({ params }) as unknown as LoaderFunctionArgs;

describe('resource access route loaders', () => {
  it('does not load the store-backed loader until a route runs it', () => {
    expect(loaderModule.evaluated).toBe(false);
  });

  it('pre-hydrates the route resource through the real loader', async () => {
    const { preHydrateResourceAccess } = await import('@/features/ResourcePermission/accessLoader');

    await expect(agentAccessLoader(args({ aid: 'agt_1' }))).resolves.toBeNull();
    await expect(agentGroupAccessLoader(args({ gid: 'grp_1' }))).resolves.toBeNull();

    expect(preHydrateResourceAccess).toHaveBeenCalledWith('agent', 'agt_1');
    expect(preHydrateResourceAccess).toHaveBeenCalledWith('agentGroup', 'grp_1');
  });
});
