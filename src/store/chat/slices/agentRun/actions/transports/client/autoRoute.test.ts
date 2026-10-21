import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveClientAutoRoute } from './autoRoute';

const { resolveAutoRoute, updateMessage, agentModel } = vi.hoisted(() => ({
  agentModel: { model: 'auto-pro', provider: 'lobehub-auto' },
  resolveAutoRoute: vi.fn(),
  updateMessage: vi.fn(),
}));

vi.mock('@/services/aiModel', () => ({ aiModelService: { resolveAutoRoute } }));
vi.mock('@/services/message', () => ({ messageService: { updateMessage } }));
vi.mock('@/store/agent', () => ({ getAgentStoreState: () => ({}) }));
vi.mock('@/store/agent/selectors', () => ({
  agentByIdSelectors: {
    getAgentModelById: () => () => agentModel.model,
    getAgentModelProviderById: () => () => agentModel.provider,
  },
}));
vi.mock('@/store/chat/selectors', () => ({
  topicSelectors: { getTopicModelById: () => () => undefined },
}));

const messages = [{ content: 'what is this', imageList: [{ id: 'img' }], role: 'user' }] as any;
const run = (extra: Record<string, unknown> = {}) => ({
  agentId: 'a',
  context: { topicId: 'tpc-1' },
  messages,
  operationId: 'op-1',
  parentMessageId: 'msg-1',
  parentMessageType: 'assistant' as const,
  ...extra,
});

describe('resolveClientAutoRoute', () => {
  const internal_dispatchMessage = vi.fn();
  const chatState = { internal_dispatchMessage } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    agentModel.model = 'auto-pro';
    agentModel.provider = 'lobehub-auto';
    updateMessage.mockResolvedValue({});
  });

  it('skips an ordinary model without calling the server', async () => {
    agentModel.model = 'gpt-x';
    agentModel.provider = 'openai';

    expect(await resolveClientAutoRoute(run(), chatState)).toBeUndefined();
    expect(resolveAutoRoute).not.toHaveBeenCalled();
  });

  it('routes a tier and stamps the pre-created assistant row locally and on the server', async () => {
    resolveAutoRoute.mockResolvedValue({
      metadata: { reason: 'initial', tier: 'pro' },
      model: 'gpt-x',
      provider: 'openai',
    });

    const result = await resolveClientAutoRoute(run({ skipCreateFirstMessage: true }), chatState);

    expect(result).toEqual({ model: 'gpt-x', provider: 'openai' });
    expect(resolveAutoRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: expect.objectContaining({ images: 1 }),
        continuation: false,
        prompt: 'what is this',
        topicId: 'tpc-1',
      }),
    );
    expect(internal_dispatchMessage).toHaveBeenCalledWith(
      {
        id: 'msg-1',
        type: 'updateMessageMetadata',
        value: { autoRouting: { reason: 'initial', tier: 'pro' } },
      },
      { operationId: 'op-1' },
    );
    expect(updateMessage).toHaveBeenCalledWith('msg-1', {
      metadata: { autoRouting: { reason: 'initial', tier: 'pro' } },
      model: 'gpt-x',
      provider: 'openai',
    });
  });

  it('keeps the model for a resumed tool chain', async () => {
    resolveAutoRoute.mockResolvedValue({ metadata: {}, model: 'gpt-x', provider: 'openai' });

    await resolveClientAutoRoute(run({ parentMessageType: 'tool' }), chatState);

    expect(resolveAutoRoute).toHaveBeenCalledWith(expect.objectContaining({ continuation: true }));
    expect(updateMessage).not.toHaveBeenCalled();
  });

  it('fails the run instead of sending the virtual model upstream', async () => {
    resolveAutoRoute.mockRejectedValue(new Error('network'));

    await expect(resolveClientAutoRoute(run(), chatState)).rejects.toThrow('network');
  });

  it('passes an ordinary model override through untouched', async () => {
    const override = { model: 'gpt-x', provider: 'openai' };

    expect(await resolveClientAutoRoute(run({ modelOverride: override }), chatState)).toBe(
      override,
    );
    expect(resolveAutoRoute).not.toHaveBeenCalled();
  });

  it('routes a tier a sub-agent inherits as its override, outside the parent topic state', async () => {
    agentModel.model = 'gpt-x';
    agentModel.provider = 'openai';
    resolveAutoRoute.mockResolvedValue({ metadata: {}, model: 'real', provider: 'openai' });

    const result = await resolveClientAutoRoute(
      run({ isSubAgent: true, modelOverride: { model: 'auto-ultra', provider: 'lobehub-auto' } }),
      chatState,
    );

    expect(result).toEqual({ model: 'real', provider: 'openai' });
    expect(resolveAutoRoute).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'auto-ultra', topicId: undefined }),
    );
  });
});
