import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEffectiveModel } from './useEffectiveModel';

interface ModelPin {
  model: string;
  provider: string;
}

const testState = vi.hoisted(() => ({
  /** `undefined`: the host publishes no topic; `null`: its conversation has none. */
  composerTopicId: undefined as string | null | undefined,
  globalActiveTopicId: undefined as string | undefined,
  topicModels: {} as Record<string, ModelPin>,
}));

vi.mock('../store', () => ({
  useChatInputStore: (selector: (state: object) => unknown) =>
    selector({ topicId: testState.composerTopicId }),
}));

// Store boundary: the real agent and topic selectors run against these states.
vi.mock('@/store/agent', () => ({
  useAgentStore: (selector: (state: object) => unknown) =>
    selector({
      agentMap: { 'agent-1': { model: 'agent-model', provider: 'agent-provider' } },
    }),
}));

vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (state: object) => unknown) =>
    selector({
      activeTopicId: testState.globalActiveTopicId,
      topicDataMap: {},
      topicDetailMap: Object.fromEntries(
        Object.entries(testState.topicModels).map(([id, pin]) => [id, { id, ...pin }]),
      ),
    }),
}));

const outerPin = { model: 'outer-model', provider: 'outer-provider' };
const ownPin = { model: 'own-model', provider: 'own-provider' };

beforeEach(() => {
  testState.composerTopicId = undefined;
  testState.globalActiveTopicId = 'outer-topic';
  testState.topicModels = { 'outer-topic': outerPin, 'own-topic': ownPin };
});

describe('useEffectiveModel', () => {
  // A page copilot embedded beside a chat runs with `topicId: null` while the
  // outer chat's topic is still the global active one.
  it('uses the agent default when the composer conversation has no topic, ignoring the global active topic pin', () => {
    testState.composerTopicId = null;

    const { result } = renderHook(() => useEffectiveModel('agent-1'));

    expect(result.current).toEqual({ model: 'agent-model', provider: 'agent-provider' });
  });

  it("uses the composer's own topic pin rather than the global active topic pin", () => {
    testState.composerTopicId = 'own-topic';

    const { result } = renderHook(() => useEffectiveModel('agent-1'));

    expect(result.current).toEqual(ownPin);
  });

  it('falls back to the global active topic pin when the host publishes no topic', () => {
    const { result } = renderHook(() => useEffectiveModel('agent-1'));

    expect(result.current).toEqual(outerPin);
  });

  it('uses the agent default when the composer topic pins no model', () => {
    testState.composerTopicId = 'unpinned-topic';

    const { result } = renderHook(() => useEffectiveModel('agent-1'));

    expect(result.current).toEqual({ model: 'agent-model', provider: 'agent-provider' });
  });
});
