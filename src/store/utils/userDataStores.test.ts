import { beforeEach, describe, expect, it, vi } from 'vitest';

const resetGatewayMuxRegistry = vi.hoisted(() => vi.fn());
const storeResets = vi.hoisted(() => [] as Array<() => void>);
const pageReset = vi.hoisted(() => vi.fn());
const sandboxReset = vi.hoisted(() => vi.fn());
const clearAllReplicas = vi.hoisted(() => vi.fn());
const fakeStore = vi.hoisted(() => () => ({
  getState: () => {
    const reset = vi.fn();
    storeResets.push(reset);
    return { reset };
  },
}));

vi.mock('@/libs/replica', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  clearAllReplicas,
}));
vi.mock('react-dom', () => ({ unstable_batchedUpdates: (fn: () => void) => fn() }));
vi.mock('@/store/chat/slices/agentRun/actions/transports/gateway/muxRegistry', () => ({
  resetGatewayMuxRegistry,
}));
vi.mock('@/store/agent', () => ({ useAgentStore: fakeStore() }));
vi.mock('@/store/agentGroup', () => ({ useAgentGroupStore: fakeStore() }));
vi.mock('@/store/chat', () => ({ useChatStore: fakeStore() }));
vi.mock('@/store/discover', () => ({ useDiscoverStore: fakeStore() }));
vi.mock('@/store/document', () => ({ useDocumentStore: fakeStore() }));
vi.mock('@/store/eval', () => ({ useEvalStore: fakeStore() }));
vi.mock('@/store/file', () => ({ useFileStore: fakeStore() }));
vi.mock('@/store/home', () => ({ useHomeStore: fakeStore() }));
vi.mock('@/store/image', () => ({ useImageStore: fakeStore() }));
vi.mock('@/store/library', () => ({ useKnowledgeBaseStore: fakeStore() }));
vi.mock('@/store/mention', () => ({ useMentionStore: fakeStore() }));
vi.mock('@/store/notebook', () => ({ useNotebookStore: fakeStore() }));
vi.mock('@/store/page', () => ({ pageActions: { reset: pageReset } }));
vi.mock('@/store/sandbox', () => ({ sandboxActions: { reset: sandboxReset } }));
vi.mock('@/store/session', () => ({ useSessionStore: fakeStore() }));
vi.mock('@/store/task', () => ({ useTaskStore: fakeStore() }));
vi.mock('@/store/tool', () => ({ useToolStore: fakeStore() }));
vi.mock('@/store/user', () => ({ useUserStore: fakeStore() }));
vi.mock('@/store/userMemory', () => ({ useUserMemoryStore: fakeStore() }));
vi.mock('@/store/video', () => ({ useVideoStore: fakeStore() }));

describe('stores.reset', () => {
  beforeEach(() => {
    resetGatewayMuxRegistry.mockClear();
    storeResets.length = 0;
    pageReset.mockClear();
    sandboxReset.mockClear();
    clearAllReplicas.mockClear();
  });

  it('retires every replica before the stores are wiped', async () => {
    const { stores } = await import('./userDataStores');
    const order: string[] = [];
    clearAllReplicas.mockImplementation(() => order.push('replicas'));
    pageReset.mockImplementation(() => order.push('page'));

    stores.reset();

    // Otherwise a read in flight from the previous data context settles after
    // the wipe and repopulates the store it was just cleared from.
    expect(clearAllReplicas).toHaveBeenCalledTimes(1);
    expect(order.indexOf('replicas')).toBeLessThan(order.indexOf('page'));
  });

  it('tears down the gateway mux registry before wiping the user-data stores', async () => {
    const { stores } = await import('./userDataStores');
    const order: string[] = [];
    resetGatewayMuxRegistry.mockImplementation(() => order.push('mux'));

    stores.reset();

    expect(resetGatewayMuxRegistry).toHaveBeenCalledTimes(1);
    expect(storeResets).toHaveLength(18);
    expect(pageReset).toHaveBeenCalledTimes(1);
    expect(sandboxReset).toHaveBeenCalledTimes(1);
    for (const reset of storeResets) expect(reset).toHaveBeenCalledTimes(1);
    expect(order[0]).toBe('mux');
  });
});
