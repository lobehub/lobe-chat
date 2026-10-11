// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  isAgentSelfIterationOptedIn,
  isAgentSignalEnabledForUser,
  isLobeAiAgentSlug,
  resolveAgentSelfIterationCapability,
} from '../featureGate';

const mocks = vi.hoisted(() => ({
  getServerFeatureFlagsStateFromRuntimeConfig: vi.fn(),
}));

vi.mock('@/server/featureFlags', () => ({
  getServerFeatureFlagsStateFromRuntimeConfig: mocks.getServerFeatureFlagsStateFromRuntimeConfig,
}));

describe('isAgentSignalEnabledForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerFeatureFlagsStateFromRuntimeConfig.mockResolvedValue({
      enableAgentSelfIteration: true,
    });
  });

  /**
   * @example
   * expect(result).toBe(true).
   */
  it('uses the feature flag as the user-level Agent Signal gate', async () => {
    const result = await isAgentSignalEnabledForUser({} as never, 'user-1');

    expect(result).toBe(true);
    expect(mocks.getServerFeatureFlagsStateFromRuntimeConfig).toHaveBeenCalledWith('user-1');
  });
});

describe('agentSignal feature gates', () => {
  it('recognizes only the inbox builtin slug as Lobe AI', () => {
    expect(isLobeAiAgentSlug('inbox')).toBe(true);
    expect(isLobeAiAgentSlug('task-agent')).toBe(false);
    expect(isLobeAiAgentSlug('page-agent')).toBe(false);
    expect(isLobeAiAgentSlug(undefined)).toBe(false);
    expect(isLobeAiAgentSlug(null)).toBe(false);
    expect(isLobeAiAgentSlug('')).toBe(false);
  });

  it('disables self-iteration when the feature flag is disabled', () => {
    expect(
      resolveAgentSelfIterationCapability({
        agentSelfIteration: { enabled: true },
        isAgentSelfIterationFeatureEnabled: false,
        isLobeAiAgent: true,
      }),
    ).toBe(false);
  });

  it('enables Lobe AI self-iteration when the feature flag is enabled', () => {
    expect(
      resolveAgentSelfIterationCapability({
        isAgentSelfIterationFeatureEnabled: true,
        isLobeAiAgent: true,
      }),
    ).toBe(true);
  });

  it('keeps Lobe AI on when the default-merged config reports enabled: false', () => {
    expect(
      resolveAgentSelfIterationCapability({
        agentSelfIteration: { enabled: false },
        isAgentSelfIterationFeatureEnabled: true,
        isLobeAiAgent: true,
      }),
    ).toBe(true);
  });

  it('turns Lobe AI off once the user opts out', () => {
    expect(
      resolveAgentSelfIterationCapability({
        agentSelfIteration: { enabled: false, optedOut: true },
        isAgentSelfIterationFeatureEnabled: true,
        isLobeAiAgent: true,
      }),
    ).toBe(false);
  });

  describe('isAgentSelfIterationOptedIn', () => {
    it('defaults Lobe AI on and only honors the explicit opt-out', () => {
      expect(isAgentSelfIterationOptedIn({ isLobeAiAgent: true })).toBe(true);
      expect(
        isAgentSelfIterationOptedIn({ isLobeAiAgent: true, selfIteration: { enabled: false } }),
      ).toBe(true);
      expect(
        isAgentSelfIterationOptedIn({ isLobeAiAgent: true, selfIteration: { optedOut: false } }),
      ).toBe(true);
      expect(
        isAgentSelfIterationOptedIn({ isLobeAiAgent: true, selfIteration: { optedOut: true } }),
      ).toBe(false);
    });

    it('keeps other agents opt-in and ignores optedOut for them', () => {
      expect(isAgentSelfIterationOptedIn({ isLobeAiAgent: false })).toBe(false);
      expect(
        isAgentSelfIterationOptedIn({ isLobeAiAgent: false, selfIteration: { enabled: false } }),
      ).toBe(false);
      expect(
        isAgentSelfIterationOptedIn({ isLobeAiAgent: false, selfIteration: { optedOut: false } }),
      ).toBe(false);
      expect(
        isAgentSelfIterationOptedIn({ isLobeAiAgent: false, selfIteration: { enabled: true } }),
      ).toBe(true);
    });
  });

  it('keeps non-Lobe AI agents behind selfIteration.enabled', () => {
    expect(
      resolveAgentSelfIterationCapability({
        agentSelfIteration: { enabled: true },
        isAgentSelfIterationFeatureEnabled: true,
        isLobeAiAgent: false,
      }),
    ).toBe(true);

    expect(
      resolveAgentSelfIterationCapability({
        agentSelfIteration: { enabled: false },
        isAgentSelfIterationFeatureEnabled: true,
        isLobeAiAgent: false,
      }),
    ).toBe(false);

    expect(
      resolveAgentSelfIterationCapability({
        isAgentSelfIterationFeatureEnabled: true,
        isLobeAiAgent: false,
      }),
    ).toBe(false);
  });
});
