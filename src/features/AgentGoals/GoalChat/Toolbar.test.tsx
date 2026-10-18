/**
 * @vitest-environment happy-dom
 */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Toolbar from './Toolbar';

const chatState = vi.hoisted(() => ({
  activeTopic: undefined as { favorite?: boolean; id: string; title: string } | undefined,
}));

vi.mock('@/features/Conversation', () => ({
  conversationSelectors: { agentId: () => 'agt_1' },
  useConversationStore: (selector: () => unknown) => selector(),
}));

vi.mock('@/features/NavHeader', () => ({
  default: ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
    <div>
      {left}
      {right}
    </div>
  ),
}));

vi.mock('@/features/PageEditor/Copilot/TopicSelector/TopicItem', () => ({ default: () => null }));

vi.mock('@/hooks/useFetchChatTopics', () => ({ useFetchAgentChatTopics: vi.fn() }));

vi.mock('@/store/agent', () => ({
  useAgentStore: () => 'Claude Code',
}));

vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (state: unknown) => unknown) => selector({}),
}));

vi.mock('@/store/chat/slices/topic/selectors', () => ({
  topicSelectors: {
    currentActiveTopic: () => chatState.activeTopic,
    currentTopics: () => (chatState.activeTopic ? [chatState.activeTopic] : []),
  },
}));

vi.mock('./TopicActions', () => ({
  default: ({ topicId }: { topicId: string }) => <div data-testid="topic-actions">{topicId}</div>,
}));

describe('GoalChat Toolbar', () => {
  beforeEach(() => {
    chatState.activeTopic = undefined;
  });

  it('shows the topic menu for the open conversation', () => {
    chatState.activeTopic = { id: 'tpc_1', title: 'Progress' };

    render(<Toolbar onCollapse={vi.fn()} />);

    expect(screen.getByTestId('topic-actions').textContent).toBe('tpc_1');
  });

  it('hides the topic menu before the conversation has a topic', () => {
    render(<Toolbar onCollapse={vi.fn()} />);

    expect(screen.queryByTestId('topic-actions')).toBeNull();
  });
});
