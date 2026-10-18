/**
 * @vitest-environment happy-dom
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGoalTopicMenu } from './useGoalTopicMenu';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/PageEditor/Copilot/TopicSelector/useDropdownMenu', () => ({
  useDropdownMenu: () => () => [{ key: 'rename' }, { key: 'delete' }],
}));

vi.mock('@/features/Workspace/useWorkspaceAwareNavigate', () => ({
  useWorkspaceAwareNavigate: () => navigateMock,
}));

describe('useGoalTopicMenu', () => {
  it('leads the standard topic menu with a jump to the original topic', () => {
    const { result } = renderHook(() =>
      useGoalTopicMenu({ agentId: 'agt_1', topicId: 'tpc_1', topicTitle: 'Progress' }),
    );

    const items = result.current() as { key?: string; onClick?: () => void; type?: string }[];
    expect(items.map((item) => item.key ?? item.type)).toEqual([
      'openTopic',
      'divider',
      'rename',
      'delete',
    ]);

    items[0].onClick?.();
    expect(navigateMock).toHaveBeenCalledWith('/agent/agt_1/tpc_1');
  });
});
