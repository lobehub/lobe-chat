/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ModelSwitch from '.';

interface ModelPin {
  model: string;
  provider: string;
}

const testState = vi.hoisted(() => ({
  /** `undefined`: the host publishes no topic; `null`: its conversation has none. */
  composerTopicId: undefined as string | null | undefined,
  globalActiveTopicId: undefined as string | undefined,
  selectModel: vi.fn(),
  topicModels: {} as Record<string, ModelPin>,
  updateTopicModel: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/business/agent-share', () => ({ AGENT_SHARE_ALLOWED_PROVIDERS: undefined }));

vi.mock('@/business/client/useAgentShareSupported', () => ({
  useAgentShareSupported: () => ({ isShared: false }),
}));

vi.mock('@/hooks/useEnabledChatModels', () => ({ useEnabledChatModels: () => [] }));

vi.mock('@/features/ModelSwitchPanel', () => ({
  default: ({
    children,
    onModelChange,
  }: {
    children: ReactNode;
    onModelChange: (params: ModelPin) => void;
  }) => (
    <>
      {children}
      <button onClick={() => onModelChange({ model: 'picked-model', provider: 'picked' })}>
        pick
      </button>
    </>
  ),
}));

vi.mock('../../components/SelectorTrigger', () => ({
  default: ({ text }: { text: string }) => <span data-testid="model-trigger">{text}</span>,
}));

vi.mock('../../hooks/useAgentId', () => ({ useAgentId: () => 'agent-1' }));

vi.mock('../../hooks/useAgentModelSelection', () => ({
  useAgentModelSelection: () => ({
    canDisplayModel: true,
    canSelectModel: true,
    model: 'agent-model',
    provider: 'agent-provider',
    selectModel: testState.selectModel,
  }),
}));

vi.mock('../../hooks/useModelLockTooltip', () => ({ useModelLockTooltip: () => undefined }));

vi.mock('../../hooks/useReasoningEffortControl', () => ({
  useReasoningEffortControl: () => ({ hasReasoningParams: false }),
}));

vi.mock('../context', () => ({ useActionBarContext: () => ({}) }));

vi.mock('../../store', () => ({
  useChatInputStore: (selector: (state: object) => unknown) =>
    selector({ topicId: testState.composerTopicId }),
}));

vi.mock('@/store/aiInfra', () => ({
  aiModelSelectors: { getEnabledModelById: () => () => undefined },
  useAiInfraStore: (selector: (state: object) => unknown) => selector({}),
}));

// Store boundary: the real topic selectors run against this state.
vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (state: object) => unknown) =>
    selector({
      activeTopicId: testState.globalActiveTopicId,
      topicDataMap: {},
      topicDetailMap: Object.fromEntries(
        Object.entries(testState.topicModels).map(([id, pin]) => [id, { id, ...pin }]),
      ),
      updateTopicModel: testState.updateTopicModel,
    }),
}));

beforeEach(() => {
  testState.composerTopicId = undefined;
  testState.globalActiveTopicId = 'outer-topic';
  testState.topicModels = {
    'outer-topic': { model: 'outer-model', provider: 'outer-provider' },
    'own-topic': { model: 'own-model', provider: 'own-provider' },
  };
  testState.selectModel.mockReset();
  testState.updateTopicModel.mockReset();
});

describe('ModelSwitch', () => {
  // A page copilot embedded beside a chat runs with `topicId: null` while the
  // outer chat's topic is still the global active one.
  it('shows and switches the agent model when the composer conversation has no topic', () => {
    testState.composerTopicId = null;

    render(<ModelSwitch />);

    expect(screen.getByTestId('model-trigger')).toHaveTextContent('agent-model');
    fireEvent.click(screen.getByText('pick'));
    expect(testState.selectModel).toHaveBeenCalledWith({
      model: 'picked-model',
      provider: 'picked',
    });
    expect(testState.updateTopicModel).not.toHaveBeenCalled();
  });

  it("shows and pins the composer's own topic, not the global active topic", () => {
    testState.composerTopicId = 'own-topic';

    render(<ModelSwitch />);

    expect(screen.getByTestId('model-trigger')).toHaveTextContent('own-model');
    fireEvent.click(screen.getByText('pick'));
    expect(testState.updateTopicModel).toHaveBeenCalledWith('own-topic', {
      model: 'picked-model',
      provider: 'picked',
    });
    expect(testState.selectModel).not.toHaveBeenCalled();
  });

  it('follows the global active topic when the host publishes no topic', () => {
    render(<ModelSwitch />);

    expect(screen.getByTestId('model-trigger')).toHaveTextContent('outer-model');
    fireEvent.click(screen.getByText('pick'));
    expect(testState.updateTopicModel).toHaveBeenCalledWith('outer-topic', {
      model: 'picked-model',
      provider: 'picked',
    });
  });
});
