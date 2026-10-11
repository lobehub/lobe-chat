// @vitest-environment node
import { MemoryIdentifier } from '@lobechat/builtin-tool-memory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as BudgetModule from '../../../../budget';
import { runMemoryActionAgent } from '../userMemory';

const { mockAcquireBudget, mockCreateOperation } = vi.hoisted(() => ({
  mockAcquireBudget: vi.fn(),
  mockCreateOperation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../../budget', async (importOriginal) => ({
  ...(await importOriginal<typeof BudgetModule>()),
  acquireAgentSignalDailyBudget: mockAcquireBudget,
}));

vi.mock('@/server/services/agentRuntime/AgentRuntimeService', () => ({
  AgentRuntimeService: vi.fn().mockImplementation(function () {
    return { createOperation: mockCreateOperation };
  }),
}));

vi.mock('@/business/client/model-bank/loadModels', () => ({
  loadModels: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/server/modules/Mecha', () => ({
  createServerAgentToolsEngine: vi.fn().mockReturnValue({
    generateToolsDetailed: vi.fn().mockReturnValue({
      enabledToolIds: [MemoryIdentifier],
      tools: [{ function: { name: 'memory' }, type: 'function' }],
    }),
    getEnabledPluginManifests: vi.fn().mockReturnValue(new Map()),
  }),
}));

const marker = { kind: 'memory', sourceId: 'source-1' } as const;

const createOptions = () => {
  const messageModel = { create: vi.fn().mockResolvedValue({ id: 'msg-seed' }) };
  const threadModel = { create: vi.fn().mockResolvedValue({ id: 'thread-1' }) };

  return {
    messageModel,
    options: {
      agentService: {
        getAgentConfig: vi.fn().mockResolvedValue({
          chatConfig: {},
          model: 'glm-5.3-flash',
          provider: 'lobehub',
        }),
      },
      db: {} as never,
      messageModel,
      pluginModel: { query: vi.fn().mockResolvedValue([]) },
      threadModel,
      userId: 'user-1',
      userModel: { getUserSettings: vi.fn().mockResolvedValue(undefined) },
    } as never,
    threadModel,
  };
};

describe('runMemoryActionAgent seed prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAcquireBudget.mockResolvedValue({ allowed: true, kind: 'background-run', limit: 20 });
  });

  /**
   * @example
   * Over the daily background-run budget, the async writer skips before any write.
   */
  it('skips the async writer without creating a thread or operation when over budget', async () => {
    mockAcquireBudget.mockResolvedValue({
      allowed: false,
      count: 21,
      kind: 'background-run',
      limit: 20,
      reason: 'exceeded',
    });
    const { messageModel, options, threadModel } = createOptions();

    const result = await runMemoryActionAgent(
      {
        agentId: 'agent-1',
        message: 'remember I prefer tabs',
        sourceMessageId: 'msg-assistant',
        topicId: 'topic-1',
      },
      options,
      { marker },
    );

    expect(result).toEqual({
      detail: 'Daily Agent Signal background-run budget exceeded (20/day).',
      status: 'skipped',
    });
    expect(mockAcquireBudget).toHaveBeenCalledWith({ kind: 'background-run', userId: 'user-1' });
    expect(threadModel.create).not.toHaveBeenCalled();
    expect(messageModel.create).not.toHaveBeenCalled();
    expect(mockCreateOperation).not.toHaveBeenCalled();
  });

  it('persists the writer prompt in the isolation thread so a DB reload keeps it', async () => {
    const { messageModel, options } = createOptions();

    await runMemoryActionAgent(
      {
        agentId: 'agent-1',
        message: 'remember I prefer tabs',
        sourceMessageId: 'msg-assistant',
        topicId: 'topic-1',
      },
      options,
      { marker },
    );

    expect(messageModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: 'agent-1',
        role: 'user',
        threadId: 'thread-1',
        topicId: 'topic-1',
      }),
    );

    const params = mockCreateOperation.mock.calls[0][0];
    expect(params.initialMessages).toEqual([
      expect.objectContaining({ id: 'msg-seed', role: 'user' }),
    ]);
    // The first assistant message hangs under the persisted seed.
    expect(params.initialContext.payload.parentMessageId).toBe('msg-seed');
  });

  it('keeps the seed in memory only when no isolation thread exists', async () => {
    const { messageModel, options } = createOptions();

    await runMemoryActionAgent({ agentId: 'agent-1', message: 'remember I prefer tabs' }, options, {
      marker,
    });

    expect(messageModel.create).not.toHaveBeenCalled();

    const params = mockCreateOperation.mock.calls[0][0];
    expect(params.initialMessages).toEqual([{ content: expect.any(String), role: 'user' }]);
    expect(params.initialContext.payload.parentMessageId).toBeUndefined();
  });
});
