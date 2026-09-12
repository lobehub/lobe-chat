import { beforeEach, describe, expect, it } from 'vitest';

import { CliMessageTransport } from './CliMessageTransport';
import type { MessageSyncOperation } from './messageSync';
import { MessageWriteQueue } from './MessageWriteQueue';

type CreateOperation = Extract<MessageSyncOperation, { type: 'createMessage' }>;

describe('CliMessageTransport replication payload', () => {
  let queued: MessageSyncOperation[];
  let queue: MessageWriteQueue;
  let transport: CliMessageTransport;

  beforeEach(() => {
    queued = [];
    queue = new MessageWriteQueue({
      sink: {
        flush: async (operations) => {
          queued.push(...operations);
        },
      },
    });
    transport = new CliMessageTransport({ queue });
  });

  const creates = (): CreateOperation[] =>
    queued.filter((op): op is CreateOperation => op.type === 'createMessage');

  it('replicates the locally assigned creation time, not just the id', async () => {
    const ref = await transport.createAssistantMessage({
      content: 'hello',
      role: 'assistant',
      topicId: 'topic-1',
    });
    await queue.drain();

    const stored = transport.store.get(ref.id);
    // Replication runs behind the run, so the server's arrival time would record
    // when the batch was flushed rather than when the work happened. Sending the
    // local time is what keeps the replica describing the run.
    expect(creates()[0].message.createdAt).toBe(stored?.createdAt);
    expect(creates()[0].message.id).toBe(ref.id);
  });

  it('replicates a tool row the same way', async () => {
    const ref = await transport.createToolMessage({
      content: 'tool output',
      role: 'tool',
      topicId: 'topic-1',
    });
    await queue.drain();

    expect(creates()[0].message.createdAt).toBe(transport.store.get(ref.id)?.createdAt);
  });

  it('keeps a batch distinguishable in the replicated payload', async () => {
    for (let index = 0; index < 3; index++) {
      await transport.createToolMessage({
        content: `result ${index}`,
        role: 'tool',
        topicId: 'topic-1',
      });
    }
    await queue.drain();

    // A parallel batch lands inside one millisecond. The local clock is
    // monotonic, so the timestamps it replicates are distinct and ascending —
    // which is what lets the server's copy order the batch the way the run did.
    const timestamps = creates().map((op) => op.message.createdAt as number);
    expect(new Set(timestamps).size).toBe(3);
    expect([...timestamps].sort((a, b) => a - b)).toEqual(timestamps);
  });
});
