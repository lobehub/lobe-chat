import { describe, expect, it } from 'vitest';

import { CreateNewMessageParamsSchema } from './params';

const base = { content: 'hello', role: 'assistant' as const };

describe('CreateNewMessageParamsSchema createdAt', () => {
  it('keeps a caller-supplied creation time', () => {
    const parsed = CreateNewMessageParamsSchema.parse({ ...base, createdAt: 1_788_000_000_000 });

    // `z.object` strips anything undeclared, which is what silently dropped this
    // before: `MessageModel.create` has always honoured the field, so the whole
    // gap was the router schema.
    expect(parsed.createdAt).toBe(1_788_000_000_000);
  });

  it('leaves it absent when the caller does not send one', () => {
    expect(CreateNewMessageParamsSchema.parse(base).createdAt).toBeUndefined();
  });

  it('accepts a clock that runs ahead of the server', () => {
    const ahead = Date.now() + 10 * 60 * 1000;

    // A device minutes ahead is ordinary. Rejecting it would leave that device
    // unable to replicate at all, which is worse than a slightly-off transcript
    // on data scoped to its own owner.
    expect(CreateNewMessageParamsSchema.parse({ ...base, createdAt: ahead }).createdAt).toBe(ahead);
  });

  it.each([0, -1, 1.5, '1788000000000', null])('rejects %p', (createdAt) => {
    expect(() => CreateNewMessageParamsSchema.parse({ ...base, createdAt })).toThrow();
  });
});
