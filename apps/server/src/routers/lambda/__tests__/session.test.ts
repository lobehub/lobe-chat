// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionModel } from '@/database/models/session';
import { SessionGroupModel } from '@/database/models/sessionGroup';

import { sessionRouter } from '../session';

vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: vi.fn(async () => ({})),
}));

vi.mock('@/database/models/session', () => ({
  SessionModel: vi.fn(),
}));

vi.mock('@/database/models/sessionGroup', () => ({
  SessionGroupModel: vi.fn(),
}));

const mockInvalidateForResources = vi.hoisted(() => vi.fn());
vi.mock('@/database/models/resourceTransferRequest', () => ({
  ResourceTransferRequestModel: vi.fn(function () {
    return { invalidateForResources: mockInvalidateForResources };
  }),
}));

const mockTrashAgent = vi.hoisted(() => vi.fn());
vi.mock('@/server/services/trash', () => ({
  TrashService: vi.fn(function () {
    return { trashAgent: mockTrashAgent };
  }),
}));

describe('sessionRouter', () => {
  const userId = 'testUserId';
  let sessionModelMock: any;
  let mockCtx: any;

  beforeEach(() => {
    vi.clearAllMocks();

    sessionModelMock = {
      findByIdOrSlug: vi.fn(),
    };
    vi.mocked(SessionModel).mockImplementation(function () {
      return sessionModelMock;
    });
    vi.mocked(SessionGroupModel).mockImplementation(function () {
      return {} as any;
    });

    mockCtx = {
      jwtPayload: { userId },
      userId,
    };
  });

  describe('removeSession', () => {
    beforeEach(() => {
      sessionModelMock.findByIdOrSlug.mockResolvedValue({
        agent: { id: 'agent-1' },
        id: 'session-1',
        userId,
      });
      sessionModelMock.delete = vi
        .fn()
        .mockResolvedValue({ orphanedAgentIds: [], result: { count: 1 } });
      sessionModelMock.isSoleShellOfAgent = vi.fn();
    });

    it("sends the agent to the recycle bin when this is the agent's only session", async () => {
      sessionModelMock.isSoleShellOfAgent.mockResolvedValue(true);

      const caller = sessionRouter.createCaller(mockCtx);
      await caller.removeSession({ id: 'session-1' });

      expect(sessionModelMock.isSoleShellOfAgent).toHaveBeenCalledWith('session-1', 'agent-1');
      expect(mockTrashAgent).toHaveBeenCalledWith('agent-1');
      expect(sessionModelMock.delete).not.toHaveBeenCalled();
    });

    // The session-delete path trashes the agent too, so it must void a pending
    // handover exactly like `agent.removeAgent` — otherwise the recipient could
    // still accept ownership of recycle-bin content.
    it('voids pending transfers of the agent it sends to the recycle bin', async () => {
      sessionModelMock.isSoleShellOfAgent.mockResolvedValue(true);

      const caller = sessionRouter.createCaller({ ...mockCtx, workspaceId: 'ws-1' });
      await caller.removeSession({ id: 'session-1' });

      expect(mockTrashAgent).toHaveBeenCalledWith('agent-1');
      expect(mockInvalidateForResources).toHaveBeenCalledWith('agent', ['agent-1']);
    });

    it('removes only this session when the agent is linked to other sessions', async () => {
      sessionModelMock.isSoleShellOfAgent.mockResolvedValue(false);

      const caller = sessionRouter.createCaller(mockCtx);
      await caller.removeSession({ id: 'session-1' });

      expect(mockTrashAgent).not.toHaveBeenCalled();
      expect(sessionModelMock.delete).toHaveBeenCalledWith('session-1');
    });
  });
});
