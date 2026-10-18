// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(function () {
    return {};
  }),
}));

const mockServiceBatchMutate = vi.fn();
vi.mock('@/server/services/message', () => ({
  MessageService: vi.fn(function () {
    return { batchMutate: mockServiceBatchMutate };
  }),
}));

vi.mock('@/server/services/file', () => ({
  FileService: vi.fn(function () {
    return {};
  }),
}));

// Personal mode makes the workspace guards no-ops; stub the visitor guards so
// the test exercises only the batch normalization step.
vi.mock('../_helpers/shareVisitorTargetGuard', () => ({
  assertCreatorMessageTargets: vi.fn(async () => {}),
  assertCreatorTopicTargets: vi.fn(async () => {}),
}));

let inFlight = 0;
let maxInFlight = 0;
const mockResolveAgentIdFromSession = vi.fn(async (sessionId: string) => {
  inFlight += 1;
  maxInFlight = Math.max(maxInFlight, inFlight);
  // Finish later sessions first so order preservation is actually tested.
  const index = Number(sessionId.split('-')[1]);
  await new Promise((resolve) => setTimeout(resolve, 20 - index));
  inFlight -= 1;
  return `agent-for-${sessionId}`;
});
vi.mock('../_helpers/resolveContext', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  resolveAgentIdFromSession: (sessionId: string) => mockResolveAgentIdFromSession(sessionId),
}));

const { messageRouter } = await import('.');

const caller = () => messageRouter.createCaller({ userId: 'user-1' } as any);

describe('message.batchMutate session -> agent resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inFlight = 0;
    maxInFlight = 0;
    mockServiceBatchMutate.mockResolvedValue({ success: true });
  });

  it('resolves agents in input order with at most 5 lookups in flight', async () => {
    const sessionIds = Array.from({ length: 12 }, (_, i) => `session-${i}`);

    await caller().batchMutate({
      operations: [
        { id: 'msg-0', type: 'updateMessage', value: { content: 'edit' } },
        ...sessionIds.map(
          (sessionId) =>
            ({
              message: { content: sessionId, role: 'user', sessionId },
              type: 'createMessage',
            }) as any,
        ),
      ],
    });

    expect(mockResolveAgentIdFromSession).toHaveBeenCalledTimes(sessionIds.length);
    expect(maxInFlight).toBeGreaterThan(1);
    expect(maxInFlight).toBeLessThanOrEqual(5);

    const [operations] = mockServiceBatchMutate.mock.calls[0];
    expect(operations[0]).toMatchObject({ id: 'msg-0', type: 'updateMessage' });
    expect(operations.slice(1).map((op: any) => [op.message.content, op.message.agentId])).toEqual(
      sessionIds.map((sessionId) => [sessionId, `agent-for-${sessionId}`]),
    );
  });
});
