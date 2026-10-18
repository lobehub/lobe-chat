/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import TopicActions from './TopicActions';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('@lobehub/ui', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  DropdownMenu: ({
    children,
    items,
  }: {
    children: ReactNode;
    items: () => { key?: string; label?: ReactNode; onClick?: () => void }[];
  }) => (
    <div>
      {children}
      {items()
        .filter((item) => item.key)
        .map((item) => (
          <button key={item.key} onClick={item.onClick}>
            {item.key}
          </button>
        ))}
    </div>
  ),
}));

vi.mock('@/features/PageEditor/Copilot/TopicSelector/useDropdownMenu', () => ({
  useDropdownMenu: () => () => [{ key: 'rename' }, { key: 'delete' }],
}));

vi.mock('@/features/Workspace/useWorkspaceAwareNavigate', () => ({
  useWorkspaceAwareNavigate: () => navigateMock,
}));

describe('GoalChat TopicActions', () => {
  it('leads the standard topic menu with a jump to the original topic', () => {
    render(<TopicActions agentId="agt_1" topicId="tpc_1" topicTitle="Progress" />);

    const keys = screen.getAllByRole('button').map((node) => node.textContent);
    expect(keys.slice(-3)).toEqual(['openTopic', 'rename', 'delete']);

    fireEvent.click(screen.getByText('openTopic'));
    expect(navigateMock).toHaveBeenCalledWith('/agent/agt_1/tpc_1');
  });
});
