import { describe, expect, it, vi } from 'vitest';

import { openShareMessageModal, preloadShareMessageModal } from './index';

const createShareMessageModal = vi.hoisted(() => vi.fn(() => ({ close: vi.fn() })));

vi.mock('./Modal', () => ({ openShareMessageModal: createShareMessageModal }));

describe('openShareMessageModal', () => {
  it('opens the lazily loaded modal with the message and its store', async () => {
    const message = { id: 'msg-1' } as any;
    const createStore = vi.fn();

    const instance = await openShareMessageModal(message, createStore);

    expect(createShareMessageModal).toHaveBeenCalledWith(message, createStore);
    expect(instance).toBe(createShareMessageModal.mock.results[0].value);
  });

  it('loads the modal module once', async () => {
    expect(preloadShareMessageModal()).toBe(preloadShareMessageModal());
  });
});
