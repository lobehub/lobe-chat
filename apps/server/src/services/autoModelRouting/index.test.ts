// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoModelRoutingService } from './index';
import type * as RecentTurnsModule from './recentTurns';

const { findById, updateMetadata, loadRecentTurns } = vi.hoisted(() => ({
  findById: vi.fn(),
  loadRecentTurns: vi.fn(),
  updateMetadata: vi.fn(),
}));

vi.mock('@/database/models/topic', () => ({
  TopicModel: class {
    findById = findById;
    updateMetadata = updateMetadata;
  },
}));
vi.mock('./recentTurns', async (importOriginal) => ({
  ...(await importOriginal<typeof RecentTurnsModule>()),
  loadRecentTurns,
}));
vi.mock('./judge', () => ({ createJudgeClient: () => undefined, getJudgeTimeoutMs: () => 50 }));

const price = (input: number, output: number) => ({
  units: [
    {
      name: 'textInput' as const,
      rate: input,
      strategy: 'fixed' as const,
      unit: 'millionTokens' as const,
    },
    {
      name: 'textOutput' as const,
      rate: output,
      strategy: 'fixed' as const,
      unit: 'millionTokens' as const,
    },
  ],
});
const candidates = [
  {
    abilities: { functionCall: true },
    id: 'flash',
    pricing: price(0.1, 0.4),
    providerId: 'google',
  },
  {
    abilities: { functionCall: true, vision: true },
    id: 'mid',
    pricing: price(1, 4),
    providerId: 'openai',
  },
  {
    abilities: { functionCall: true, vision: true },
    id: 'strong',
    pricing: price(5, 25),
    providerId: 'anthropic',
  },
];

const createService = (judge?: { judge: ReturnType<typeof vi.fn> }) => {
  const service = new AutoModelRoutingService({} as any, 'user-1', undefined, judge);
  vi.spyOn(service, 'getCandidates').mockResolvedValue(candidates);
  return service;
};

describe('AutoModelRoutingService.resolveTurnModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findById.mockResolvedValue({ metadata: {} });
    loadRecentTurns.mockResolvedValue({ lastContextTokens: 0, turns: [] });
    updateMetadata.mockResolvedValue([]);
  });

  it('ignores an ordinary model', async () => {
    const result = await createService().resolveTurnModel({
      model: 'gpt-x',
      prompt: 'hi',
      provider: 'openai',
    });
    expect(result).toBeUndefined();
  });

  it('routes a tier with the judge and persists the topic routing state', async () => {
    const judge = { judge: vi.fn().mockResolvedValue({ difficulty: 2, source: 'judge' }) };

    const result = await createService(judge).resolveTurnModel({
      model: 'auto-pro',
      prompt: 'design a distributed lock',
      provider: 'lobehub-auto',
      topicId: 'tpc-1',
    });

    expect(result).toMatchObject({ model: 'strong', provider: 'anthropic' });
    expect(result?.metadata).toMatchObject({
      reason: 'initial',
      signalSource: 'judge',
      tier: 'pro',
    });
    expect(updateMetadata).toHaveBeenCalledWith('tpc-1', {
      autoRouting: expect.objectContaining({ primary: { model: 'strong', provider: 'anthropic' } }),
    });
  });

  it('falls back to the rules when the judge fails', async () => {
    const judge = { judge: vi.fn().mockRejectedValue(new Error('timeout')) };

    const result = await createService(judge).resolveTurnModel({
      model: 'auto-pro',
      prompt: '你好',
      provider: 'lobehub-auto',
    });

    expect(result?.model).toBe('flash');
    expect(result?.metadata.signalSource).toBe('heuristic');
  });

  it('requires vision when the turn carries images', async () => {
    const result = await createService().resolveTurnModel({
      attachments: { images: 1 },
      model: 'auto-lite',
      prompt: 'hi',
      provider: 'lobehub-auto',
    });

    expect(result?.model).toBe('mid');
  });

  it('continues from the stored topic state', async () => {
    findById.mockResolvedValue({
      metadata: {
        autoRouting: {
          current: { model: 'strong', provider: 'anthropic' },
          elevatedStreak: 1,
          lastSwitchTurn: 1,
          primary: { model: 'mid', provider: 'openai' },
          recent: { 'anthropic/strong': Date.now() },
          tier: 'pro',
          turn: 2,
        },
      },
    });

    const result = await createService().resolveTurnModel({
      continuation: true,
      model: 'auto-pro',
      prompt: '',
      provider: 'lobehub-auto',
      topicId: 'tpc-1',
    });

    expect(result).toMatchObject({ metadata: { reason: 'continuation' }, model: 'strong' });
  });

  it('rejects a tier when no chat model is visible', async () => {
    const service = new AutoModelRoutingService({} as any, 'user-1', undefined, undefined);
    vi.spyOn(service, 'getCandidates').mockResolvedValue([]);

    await expect(
      service.resolveTurnModel({ model: 'auto-pro', prompt: 'hi', provider: 'lobehub-auto' }),
    ).rejects.toThrow('at least one enabled chat model');
  });

  it('only routes to models with function calling', async () => {
    const service = new AutoModelRoutingService({} as any, 'user-1', undefined, undefined);
    vi.spyOn(service, 'getCandidates').mockResolvedValue([
      { abilities: {}, id: 'no-tools', pricing: price(0.01, 0.02), providerId: 'x' },
      ...candidates,
    ]);

    const result = await service.resolveTurnModel({
      model: 'auto-lite',
      prompt: 'hi',
      provider: 'lobehub-auto',
    });

    expect(result?.model).toBe('flash');
  });
});
