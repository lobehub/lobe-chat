import type { LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { homeTopicRecentsLoader } from './homeTopicRecentsLoader';

const preHydrateHomeTopicRecents = vi.fn(async () => true);
const activeWorkspace = vi.hoisted(() => ({ slug: null as string | null }));

vi.mock('@/business/client/hooks/useActiveWorkspaceSlug', () => ({
  getActiveWorkspaceSlug: () => activeWorkspace.slug,
}));

vi.mock('@/store/home', () => ({
  getHomeStoreState: () => ({ preHydrateHomeTopicRecents }),
}));

const load = (workspaceSlug?: string) =>
  homeTopicRecentsLoader({
    params: workspaceSlug ? { workspaceSlug } : {},
    request: new Request(`http://localhost/${workspaceSlug ?? ''}`),
  } as LoaderFunctionArgs);

beforeEach(() => {
  preHydrateHomeTopicRecents.mockClear();
  activeWorkspace.slug = null;
});

describe('homeTopicRecentsLoader', () => {
  it('seeds the "mine" recent topics of the personal home', async () => {
    await expect(load()).resolves.toBeNull();

    expect(preHydrateHomeTopicRecents).toHaveBeenCalledWith('mine');
  });

  it('seeds them when the URL opens the workspace already active', async () => {
    activeWorkspace.slug = 'acme';

    await load('acme');

    expect(preHydrateHomeTopicRecents).toHaveBeenCalledWith('mine');
  });

  // Before the destination commits, the replica scope still belongs to the
  // space being left: seeding then would paint that space's topics.
  it('reads nothing while navigating into another workspace or back to personal', async () => {
    activeWorkspace.slug = 'acme';
    await load('other');
    await load();

    activeWorkspace.slug = null;
    await load('acme');

    expect(preHydrateHomeTopicRecents).not.toHaveBeenCalled();
  });
});
