// @vitest-environment edge-runtime
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCallerFactory } from '@/libs/trpc';
import { AuthContext, createContextInner } from '@/server/context';

import { tokenizerRouter } from './index';

const createCaller = createCallerFactory(tokenizerRouter);

let ctx: AuthContext;
let router: ReturnType<typeof createCaller>;

beforeEach(async () => {
  vi.resetAllMocks();
  ctx = await createContextInner();
  router = createCaller(ctx);
});

describe('tokenizerRouter', () => {
  describe('countTokenLength', () => {
    it('count hello world', async () => {
      const response = await router.countTokenLength({ str: 'Hello, world!' });

      expect(response).toEqual(4);
    });

    it('count Chinese', async () => {
      const response = await router.countTokenLength({ str: '今天天气真好' });

      expect(response).toEqual(7);
    });
  });
});
