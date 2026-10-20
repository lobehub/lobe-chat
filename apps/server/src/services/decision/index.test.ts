// @vitest-environment node
import { DEFAULT_SYSTEM_AGENT_CONFIG } from '@lobechat/const';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createDecisionBackend,
  OpenRouterDecisionBackend,
  ToolChoiceDecisionBackend,
} from './index';

const getUserSettings = vi.hoisted(() => vi.fn());
vi.mock('@/database/models/user', () => ({
  UserModel: vi.fn().mockImplementation(function () {
    return { getUserSettings };
  }),
}));

const db = {} as any;

describe('createDecisionBackend', () => {
  beforeEach(() => {
    getUserSettings.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the tool-choice backend by default', () => {
    const backend = createDecisionBackend({
      config: { backend: 'tool_choice' },
      db,
      systemAgentKey: 'quickNoteDecision',
      userId: 'u1',
    });

    expect(backend).toBeInstanceOf(ToolChoiceDecisionBackend);
  });

  it('uses OpenRouter when it is configured with a key and model', () => {
    const backend = createDecisionBackend({
      config: { backend: 'openrouter', openRouter: { apiKey: 'k', model: 'typesafe/jev-1.13' } },
      db,
      systemAgentKey: 'quickNoteDecision',
      userId: 'u1',
    });

    expect(backend).toBeInstanceOf(OpenRouterDecisionBackend);
  });

  it('falls back to tool-choice when OpenRouter is missing its key or model', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const backend = createDecisionBackend({
      config: { backend: 'openrouter', openRouter: { model: 'typesafe/jev-1.13' } },
      db,
      systemAgentKey: 'quickNoteDecision',
      userId: 'u1',
    });

    expect(backend).toBeInstanceOf(ToolChoiceDecisionBackend);
    expect(warn).toHaveBeenCalled();
  });

  it('reads the tool-choice model from the system agent slot, then the default', async () => {
    const generateObject = vi
      .fn()
      .mockResolvedValue([
        { arguments: { ok: { evidence: '', level: 4 } }, name: 'submit_decisions' },
      ]);
    const { AiGenerationService } = await import('@/server/services/aiGeneration');
    vi.spyOn(AiGenerationService.prototype, 'generateObject').mockImplementation(generateObject);

    const backend = createDecisionBackend({
      config: { backend: 'tool_choice' },
      db,
      systemAgentKey: 'quickNoteDecision',
      userId: 'u1',
    });
    const request = {
      questions: { ok: { instructions: 'ok?', type: 'noul' as const } },
      state: '',
    };
    const ctx = { scenario: 'quick_note_intent' as const, trigger: 'quick_note' as any };

    getUserSettings.mockResolvedValueOnce({
      systemAgent: { quickNoteDecision: { model: 'user-model', provider: 'user-provider' } },
    });
    await expect(backend.decide(request, ctx)).resolves.toMatchObject({
      model: 'user-model',
      provider: 'user-provider',
    });

    getUserSettings.mockResolvedValueOnce({});
    await expect(backend.decide(request, ctx)).resolves.toMatchObject({
      model: DEFAULT_SYSTEM_AGENT_CONFIG.quickNoteDecision.model,
      provider: DEFAULT_SYSTEM_AGENT_CONFIG.quickNoteDecision.provider,
    });
  });
});
