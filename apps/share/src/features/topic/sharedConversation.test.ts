/**
 * @vitest-environment happy-dom
 */
import superjson from 'superjson';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';
import { MessageService } from '@/services/message';
import { toRoundCursorQueryInput } from '@/services/message/roundCursorPage';

import {
  primeSharedTopicMessages,
  sharedTopicMessagesScript,
  sharedTopicMessagesUrl,
  toSharedConversationContext,
} from './sharedConversation';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    message: {
      getMessages: { query: vi.fn() },
      getMessagesByCursor: { query: vi.fn() },
    },
  },
}));

const query = vi.mocked(lambdaClient.message.getMessagesByCursor.query);
const fetchMock = vi.fn();

let seq = 0;
const topic = (overrides: Record<string, unknown> = {}) =>
  ({
    agentId: 'agent-1',
    groupId: null,
    shareId: `share-${++seq}`,
    topicId: 'topic-1',
    ...overrides,
  }) as any;

const trpcBody = (data: unknown) => ({ result: { data: superjson.serialize(data) } });

const runDocumentScript = (shared: ReturnType<typeof topic>) =>
  new Function(sharedTopicMessagesScript(shared))();

describe('sharedTopicMessagesScript', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    query.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.__LOBE_SHARED_TOPIC_MESSAGES__;
  });

  // The document reads for the list; any other input is a page the list would
  // not have asked for.
  it('requests the read the mounted list makes', () => {
    fetchMock.mockResolvedValue(new Response('{}'));
    const shared = topic({ groupId: 'group-1' });

    runDocumentScript(shared);

    const [url, init] = fetchMock.mock.calls[0];
    const input = new URL(url, 'http://share.test').searchParams.get('input')!;
    expect(superjson.deserialize(JSON.parse(input))).toEqual(
      toRoundCursorQueryInput(toSharedConversationContext(shared), null),
    );
    expect(init).toMatchObject({ credentials: 'include' });
    expect(window.__LOBE_SHARED_TOPIC_MESSAGES__?.shareId).toBe(shared.shareId);
  });

  it('cannot be closed by a share id from the URL', () => {
    const script = sharedTopicMessagesScript(topic({ shareId: '</script><script>alert(1)//' }));

    expect(script).not.toContain('</script');
  });

  it('skips a share the list would not read', () => {
    expect(sharedTopicMessagesScript(topic({ agentId: null }))).toBe('');
  });

  it('hands the document read to the list without a second request', async () => {
    const shared = topic();
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(trpcBody({ messages: [{ id: 'm1' }], nextCursor: null }))),
    );

    runDocumentScript(shared);
    primeSharedTopicMessages(shared);
    const page = await new MessageService().getMessageListPage(toSharedConversationContext(shared));

    expect(page).toEqual({ messages: [{ id: 'm1' }], olderCursor: null });
    expect(query).not.toHaveBeenCalled();
    expect(window.__LOBE_SHARED_TOPIC_MESSAGES__).toBeUndefined();
  });

  it('lets the list read for itself when the document read failed', async () => {
    const shared = topic();
    fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));
    query.mockResolvedValue({
      hasMore: false,
      messages: [{ id: 'retry' }],
      nextCursor: null,
    } as any);

    runDocumentScript(shared);
    primeSharedTopicMessages(shared);
    const page = await new MessageService().getMessageListPage(toSharedConversationContext(shared));

    expect(page).toEqual({ messages: [{ id: 'retry' }], olderCursor: null });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('is not handed to another share', async () => {
    const shared = topic();
    fetchMock.mockResolvedValue(new Response('{}'));
    query.mockResolvedValue({ hasMore: false, messages: [], nextCursor: null } as any);

    runDocumentScript(shared);
    const other = topic();
    primeSharedTopicMessages(other);
    await new MessageService().getMessageListPage(toSharedConversationContext(other));

    expect(query).toHaveBeenCalledTimes(1);
    expect(sharedTopicMessagesUrl(other)).not.toBe(sharedTopicMessagesUrl(shared));
  });
});
