// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(function () {
    return {};
  }),
}));

const { topicRouter } = await import('./index');

const caller = () => topicRouter.createCaller({ userId: 'user-1' } as any);

describe('topic.hasTopicFiles (compatibility for released clients)', () => {
  // Older clients pre-check before opening the delete dialog and show an
  // attachment checkbox when this says yes. Every delete now requests cleanup,
  // so the answer must hide that obsolete option rather than fail the call.
  it('answers "no files" so older clients hide the obsolete attachment option', async () => {
    await expect(caller().hasTopicFiles({ ids: ['tpc_1', 'tpc_2'] })).resolves.toEqual({
      data: { hasFiles: false },
      success: true,
    });
  });

  it('keeps the original input contract', async () => {
    await expect(caller().hasTopicFiles({ ids: [] })).rejects.toThrow();
  });
});
