import { beforeEach, describe, expect, it, vi } from 'vitest';

import { galleryKeyOfUrl, worksLoader } from './worksLoader';

const mocks = vi.hoisted(() => ({
  preHydrateWorkspaceWorks: vi.fn(),
  workspaceId: null as string | null,
}));

vi.mock('@/business/client/hooks/useActiveWorkspaceId', () => ({
  getActiveWorkspaceId: () => mocks.workspaceId,
}));

vi.mock('@/features/ResourceManager/store/modePersistence', () => ({
  readPersistedResourceMode: (workspaceId?: string) =>
    workspaceId === 'ws_private' ? 'private' : undefined,
}));

vi.mock('@/store/work', () => ({
  workActions: { preHydrateWorkspaceWorks: mocks.preHydrateWorkspaceWorks },
}));

const load = (url: string) =>
  worksLoader({ context: undefined, params: {}, request: new Request(url) } as any);

beforeEach(() => {
  mocks.preHydrateWorkspaceWorks.mockReset().mockResolvedValue(true);
  mocks.workspaceId = null;
});

describe('galleryKeyOfUrl', () => {
  it.each([
    ['https://app.test/resource', 'all'],
    ['https://app.test/acme/resource/', 'all'],
    ['https://app.test/resource/works', 'all'],
    ['https://app.test/resource/works?works=task', 'task'],
    ['https://app.test/resource/works?works=bogus', 'all'],
    ['https://app.test/resource/documents', null],
    ['https://app.test/page', null],
  ])('%s → %s', (url, key) => {
    expect(galleryKeyOfUrl(new URL(url))).toBe(key);
  });
});

describe('worksLoader', () => {
  it('seeds the personal gallery filter the URL encodes', async () => {
    await load('https://app.test/resource/works?works=document');

    expect(mocks.preHydrateWorkspaceWorks).toHaveBeenCalledWith({
      provider: undefined,
      type: 'document',
      visibility: undefined,
      workspaceId: null,
    });
  });

  it('uses the persisted Private / Workspace mode of the active workspace', async () => {
    mocks.workspaceId = 'ws_private';
    await load('https://app.test/resource');
    expect(mocks.preHydrateWorkspaceWorks).toHaveBeenLastCalledWith(
      expect.objectContaining({ visibility: 'private', workspaceId: 'ws_private' }),
    );

    mocks.workspaceId = 'ws_other';
    await load('https://app.test/resource');
    expect(mocks.preHydrateWorkspaceWorks).toHaveBeenLastCalledWith(
      expect.objectContaining({ visibility: 'public', workspaceId: 'ws_other' }),
    );
  });

  it('skips resource categories that show no Works', async () => {
    await load('https://app.test/resource/images');
    expect(mocks.preHydrateWorkspaceWorks).not.toHaveBeenCalled();
  });
});
