/**
 * @vitest-environment happy-dom
 */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TaskExecutionControls from './TaskExecutionControls';

interface ModelPin {
  model: string;
  provider: string;
}

const testState = vi.hoisted(() => ({
  agentModel: { model: 'agent-model', provider: 'agent-provider' } as ModelPin,
  toolUseModels: [] as ModelPin[],
  topicModel: undefined as ModelPin | undefined,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./TaskDeviceChip', () => ({
  default: () => <div data-testid="task-device-chip" />,
}));

vi.mock('./TaskRepoChip', () => ({ default: () => null }));

vi.mock('./TaskWorkingDirectoryChip', () => ({ default: () => null }));

vi.mock('./useTaskRunTarget', () => ({
  useTaskRunTarget: () => ({ directoryKind: 'none' }),
}));

vi.mock('@/features/ChatInput/hooks/effectiveAgentModePreference', () => ({
  useEffectiveAgentModePreference: () => ({
    enableAgentMode: true,
    isPreferenceLoading: false,
    usesWorkspaceMemberMode: false,
  }),
}));

// Store boundary: the real agent, topic and model selectors run against these states.
vi.mock('@/store/agent', () => ({
  useAgentStore: (selector: (state: object) => unknown) =>
    selector({
      activeAgentId: 'agent-1',
      agentMap: { 'agent-1': { ...testState.agentModel } },
    }),
}));

vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (state: object) => unknown) =>
    selector({
      activeTopicId: testState.topicModel ? 'topic-1' : undefined,
      topicDataMap: {},
      topicDetailMap: testState.topicModel
        ? { 'topic-1': { id: 'topic-1', ...testState.topicModel } }
        : {},
    }),
}));

vi.mock('@/store/aiInfra', async () => {
  const { aiModelSelectors, aiProviderSelectors } = await import('@/store/aiInfra/selectors');

  return {
    aiModelSelectors,
    aiProviderSelectors,
    useAiInfraStore: (selector: (state: object) => unknown) =>
      selector({
        enabledAiModels: testState.toolUseModels.map(({ model, provider }) => ({
          abilities: { functionCall: true },
          id: model,
          providerId: provider,
        })),
        isInitAiProviderRuntimeState: true,
      }),
  };
});

beforeEach(() => {
  testState.agentModel = { model: 'agent-model', provider: 'agent-provider' };
  testState.toolUseModels = [];
  testState.topicModel = undefined;
});

// A task runs on its assignee's default model; whatever topic the chat page has
// active must not decide whether the task gets an execution environment.
describe('TaskExecutionControls', () => {
  const topicModel = { model: 'topic-model', provider: 'topic-provider' };

  it('hides execution controls when only the active chat topic model supports tool use', () => {
    testState.topicModel = topicModel;
    testState.toolUseModels = [topicModel];

    render(<TaskExecutionControls assigneeAgentId="agent-1" onChange={vi.fn()} />);

    expect(screen.queryByTestId('task-device-chip')).not.toBeInTheDocument();
  });

  it('shows execution controls when the assignee default model supports tool use even if the active topic model does not', () => {
    testState.topicModel = topicModel;
    testState.toolUseModels = [testState.agentModel];

    render(<TaskExecutionControls assigneeAgentId="agent-1" onChange={vi.fn()} />);

    expect(screen.getByTestId('task-device-chip')).toBeInTheDocument();
  });
});
