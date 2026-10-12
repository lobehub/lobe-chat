import { CUSTOM_FOLDER_FILE_TYPE } from '@lobechat/const';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as ReplicaModule from '@/libs/replica';
import { createReplicaState } from '@/libs/replica';

import { TreeActionImpl } from './actions';
import {
  buildLibraryTreeSnapshot,
  MAX_PERSISTED_FOLDERS,
  MAX_PERSISTED_ITEMS_PER_FOLDER,
} from './projection';
import type { TreeItem, TreeState } from './types';

const { mockGetKnowledgeItems } = vi.hoisted(() => ({ mockGetKnowledgeItems: vi.fn() }));

vi.mock('@/libs/replica', async () => ({
  ...(await vi.importActual<typeof ReplicaModule>('@/libs/replica')),
  revalidateReplica: vi.fn(),
}));

vi.mock('@/features/ResourceManager/store', () => ({
  useResourceManagerStore: { getState: () => ({ collapseHierarchySearch: vi.fn() }) },
}));

vi.mock('@/services/file', () => ({
  fileService: { getKnowledgeItems: mockGetKnowledgeItems },
}));

vi.mock('@/services/resource', () => ({ resourceService: {} }));
vi.mock('@/store/file', () => ({ useFileStore: { getState: () => ({}) } }));

const folder = (id: string, name = id): TreeItem => ({
  fileType: CUSTOM_FOLDER_FILE_TYPE,
  id,
  isFolder: true,
  name,
  url: '',
});

const file = (id: string, extra: Partial<TreeItem> = {}): TreeItem => ({
  fileType: 'text/plain',
  id,
  isFolder: false,
  name: id,
  url: '',
  ...extra,
});

const createState = (): TreeState =>
  ({
    children: {},
    epoch: 0,
    errors: {},
    expanded: {},
    knowledgeBaseId: null,
    snapshotMap: {},
    snapshotReplica: createReplicaState(),
    status: {},
  }) as unknown as TreeState;

const setup = () => {
  const state = createState();
  const get = () => state;
  const set = (partial: Partial<TreeState> | ((s: TreeState) => Partial<TreeState>)) => {
    Object.assign(state, typeof partial === 'function' ? partial(state) : partial);
  };
  const actions = new TreeActionImpl(set as any, get);
  return { actions, state };
};

/** A request that resolves only when the test says so. */
const deferred = () => {
  let resolve!: (value: { items: unknown[] }) => void;
  const promise = new Promise<{ items: unknown[] }>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

const serverRow = (id: string, isFolder = false) => ({
  fileType: isFolder ? CUSTOM_FOLDER_FILE_TYPE : 'text/plain',
  id,
  name: id,
  url: 'https://s3.example.com/signed?X-Amz-Signature=secret',
});

describe('TreeActionImpl.init — keep the tree across remounts', () => {
  beforeEach(() => {
    mockGetKnowledgeItems.mockReset();
  });

  it('keeps the loaded tree when the same library mounts again, refreshing it in the background', async () => {
    const { actions, state } = setup();
    mockGetKnowledgeItems.mockResolvedValue({ items: [serverRow('folder-a', true)] });

    actions.init('kb-1');
    await vi.waitFor(() => expect(state.children['']).toHaveLength(1));
    state.expanded = { 'folder-a': true };
    state.children['folder-a'] = [file('doc-1')];

    const pending = deferred();
    mockGetKnowledgeItems.mockReset().mockReturnValue(pending.promise);
    actions.init('kb-1');

    // Same frame as the remount: nothing was wiped back to the skeleton.
    expect(state.children[''].map((i) => i.id)).toEqual(['folder-a']);
    expect(state.children['folder-a'].map((i) => i.id)).toEqual(['doc-1']);
    expect(state.expanded['folder-a']).toBe(true);
    // Root and the open folder are confirmed in the background.
    expect(mockGetKnowledgeItems.mock.calls.map(([args]) => args.parentId)).toEqual([
      null,
      'folder-a',
    ]);
    pending.resolve({ items: [] });
  });

  it('still resets when a different library mounts', () => {
    const { actions, state } = setup();
    mockGetKnowledgeItems.mockReturnValue(new Promise(() => {}));
    state.knowledgeBaseId = 'kb-1';
    state.children = { '': [folder('folder-a')] };

    actions.init('kb-2');

    expect(state.knowledgeBaseId).toBe('kb-2');
    expect(state.children).toEqual({});
  });
});

describe('TreeActionImpl.init — persisted snapshot', () => {
  beforeEach(() => {
    mockGetKnowledgeItems.mockReset();
  });

  it('paints the persisted tree in the init commit, before the network answers', async () => {
    const { actions, state } = setup();
    state.snapshotMap = {
      'kb-1': {
        children: { '': [folder('folder-a')], 'folder-a': [file('doc-1')] },
        expanded: ['folder-a'],
      },
    };
    const root = deferred();
    const sub = deferred();
    mockGetKnowledgeItems.mockImplementation(({ parentId }) =>
      parentId ? sub.promise : root.promise,
    );

    actions.init('kb-1');

    expect(state.children[''].map((i) => i.id)).toEqual(['folder-a']);
    expect(state.children['folder-a'].map((i) => i.id)).toEqual(['doc-1']);
    expect(state.expanded['folder-a']).toBe(true);

    // The server's answer replaces the stale rows.
    root.resolve({ items: [serverRow('folder-a', true), serverRow('doc-new')] });
    sub.resolve({ items: [serverRow('doc-2')] });
    await vi.waitFor(() => {
      expect(state.children[''].map((i) => i.id)).toEqual(['folder-a', 'doc-new']);
      expect(state.children['folder-a'].map((i) => i.id)).toEqual(['doc-2']);
    });
  });

  it('records the confirmed tree as the library snapshot without signed urls', async () => {
    const { actions, state } = setup();
    mockGetKnowledgeItems.mockResolvedValue({ items: [serverRow('doc-1')] });

    actions.init('kb-1');

    await vi.waitFor(() => expect(state.snapshotMap['kb-1']).toBeDefined());
    expect(state.snapshotMap['kb-1'].children[''].map((i) => i.id)).toEqual(['doc-1']);
    expect(state.snapshotMap['kb-1'].children[''][0].url).toBe('');
  });
});

describe('buildLibraryTreeSnapshot', () => {
  it('keeps only the visible tree and bounds its size', () => {
    const many = Array.from({ length: MAX_PERSISTED_ITEMS_PER_FOLDER + 5 }, (_, i) =>
      file(`f-${i}`, { metadata: { emoji: '📄', huge: 'x'.repeat(100) } }),
    );
    const snapshot = buildLibraryTreeSnapshot(
      {
        '': [folder('open'), folder('closed'), ...many],
        'closed': [file('hidden')],
        'open': [file('visible')],
      },
      { open: true },
    )!;

    expect(Object.keys(snapshot.children).sort()).toEqual(['', 'open']);
    expect(snapshot.expanded).toEqual(['open']);
    expect(snapshot.children['']).toHaveLength(MAX_PERSISTED_ITEMS_PER_FOLDER);
    expect(snapshot.children[''][2].metadata).toEqual({ emoji: '📄' });
  });

  it('caps the number of persisted folders', () => {
    const folders = Array.from({ length: MAX_PERSISTED_FOLDERS + 5 }, (_, i) => folder(`d-${i}`));
    const children: Record<string, TreeItem[]> = { '': folders };
    const expanded: Record<string, boolean> = {};
    for (const f of folders) {
      children[f.id] = [file(`${f.id}-child`)];
      expanded[f.id] = true;
    }

    const snapshot = buildLibraryTreeSnapshot(children, expanded)!;
    expect(Object.keys(snapshot.children)).toHaveLength(MAX_PERSISTED_FOLDERS);
  });

  it('has nothing to persist before the root loads', () => {
    expect(buildLibraryTreeSnapshot({}, {})).toBeUndefined();
  });
});
