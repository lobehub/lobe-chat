import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildAgentProcessEnv, resolveRunUserId } from './heteroAgentEnv';

const jwtWithSub = (sub: string) =>
  `header.${Buffer.from(JSON.stringify({ sub })).toString('base64url')}.signature`;

describe('buildAgentProcessEnv', () => {
  it("echoes the run's identity, including the user who started it", () => {
    expect(
      buildAgentProcessEnv({
        operationId: 'op_run',
        runUserId: 'user_initiator',
        topicId: 'tpc_conversation',
      }),
    ).toEqual({
      LOBEHUB_OPERATION_ID: 'op_run',
      LOBEHUB_RUN_USER_ID: 'user_initiator',
      LOBEHUB_TOPIC_ID: 'tpc_conversation',
    });
  });

  it('gives a standalone run no identity', () => {
    expect(buildAgentProcessEnv({})).toBeUndefined();
  });
});

describe('resolveRunUserId', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the run's user from its operation token", () => {
    vi.stubEnv('LOBEHUB_JWT', jwtWithSub('user_initiator'));

    expect(resolveRunUserId()).toBe('user_initiator');
  });

  it('has no user without a token', () => {
    vi.stubEnv('LOBEHUB_JWT', '');

    expect(resolveRunUserId()).toBeUndefined();
  });
});
