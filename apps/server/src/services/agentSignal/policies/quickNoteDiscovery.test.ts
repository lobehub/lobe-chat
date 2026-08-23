import { describe, expect, it, vi } from 'vitest';

import { createQuickNoteDiscoverySourceHandler } from './quickNoteDiscovery';

/** @example Quick Note Discovery source handling is thin, validated, and idempotent upstream. */
describe('createQuickNoteDiscoverySourceHandler', () => {
  /** @example A valid claimed Run is handed to the durable Agent dispatcher once. */
  it('dispatches the claimed domain Run', async () => {
    const dispatch = vi.fn().mockResolvedValue({ operationId: 'op-1' });
    const handler = createQuickNoteDiscoverySourceHandler({ dispatch });

    const result = await handler.handle({
      payload: {
        quickNoteId: 'qn_1',
        runId: '11111111-1111-1111-1111-111111111111',
        sourceHistoryId: 'history-1',
        userId: 'user-1',
      },
      scopeKey: 'quick-note:qn_1',
      sourceId: '11111111-1111-1111-1111-111111111111',
      sourceType: 'quick_note.discovery.requested',
      timestamp: 1,
    });

    /** @example The handler dispatches by immutable Run identity, not mutable note content. */
    expect(dispatch).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
    /** @example Trace output carries a coarse dispatched status. */
    expect(result).toMatchObject({
      concluded: { operationId: 'op-1', status: 'dispatched' },
      status: 'conclude',
    });
  });
});
