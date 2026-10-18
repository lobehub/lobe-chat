import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';

import { MessageService } from './index';
import { primeMessageListPage } from './roundCursorPage';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    message: {
      getMessages: { query: vi.fn() },
      getMessagesByCursor: { query: vi.fn() },
    },
  },
}));

const query = vi.mocked(lambdaClient.message.getMessagesByCursor.query);

const page = (id: string) => ({ hasMore: false, messages: [{ id }], nextCursor: null }) as any;
const listPage = (id: string) => Promise.resolve({ messages: [{ id }], olderCursor: null } as any);

let seq = 0;
// The primed map is module state: give every test its own conversation.
const nextContext = () => ({ agentId: 'agent-1', topicId: 'topic-1', topicShareId: `s${++seq}` });

describe('primeMessageListPage', () => {
  const service = new MessageService();

  beforeEach(() => {
    query.mockReset();
  });

  it('answers the first list read without a request', async () => {
    const context = nextContext();

    primeMessageListPage(context, listPage('primed'));

    // The list asks with its own read options; projection is not part of the identity.
    const result = await service.getMessageListPage({ ...context, projectToolPayloads: true });

    expect(query).not.toHaveBeenCalled();
    expect(result).toEqual({ messages: [{ id: 'primed' }], olderCursor: null });
  });

  it('is taken once: later reads go to the server', async () => {
    query.mockResolvedValueOnce(page('fresh'));
    const context = nextContext();

    primeMessageListPage(context, listPage('primed'));
    await service.getMessageListPage(context);
    const second = await service.getMessageListPage(context);

    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: null, topicShareId: context.topicShareId }),
    );
    expect(second).toEqual({ messages: [{ id: 'fresh' }], olderCursor: null });
  });

  it('keeps the first page primed for a conversation', async () => {
    const context = nextContext();

    primeMessageListPage(context, listPage('first'));
    primeMessageListPage({ ...context }, listPage('second'));

    expect(await service.getMessageListPage(context)).toEqual({
      messages: [{ id: 'first' }],
      olderCursor: null,
    });
  });

  it('is not handed to a different conversation', async () => {
    query.mockResolvedValueOnce(page('group'));
    const context = nextContext();

    primeMessageListPage(context, listPage('primed'));
    const result = await service.getMessageListPage({ ...context, groupId: 'group-1' });

    expect(query).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ messages: [{ id: 'group' }], olderCursor: null });
  });

  it('falls back to a fresh read when the primed request failed', async () => {
    query.mockResolvedValueOnce(page('retry'));
    const context = nextContext();

    primeMessageListPage(context, Promise.reject(new Error('network')));
    const result = await service.getMessageListPage(context);

    expect(query).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ messages: [{ id: 'retry' }], olderCursor: null });
  });
});
