/**
 * @vitest-environment happy-dom
 */
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SwitcherItem } from '@/features/NavPanel/switcher/switcherItems';

import ProjectHeader from './ProjectHeader';

const captured = vi.hoisted(() => ({
  items: [] as SwitcherItem[],
  triggerAvatar: undefined as unknown,
}));

const projects = vi.hoisted(() => ({
  value: [] as Array<Record<string, unknown>>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/features/Workspace/useWorkspaceAwareNavigate', () => ({
  useWorkspaceAwareNavigate: () => vi.fn(),
}));
vi.mock('@/features/NavPanel/SideBarHeaderLayout', () => ({
  default: ({ left }: { left: ReactNode }) => <div>{left}</div>,
}));
vi.mock('@/features/NavPanel/SidebarHeaderSelect', () => ({
  SidebarHeaderSelectPopover: ({
    children,
    content,
  }: {
    children: ReactNode;
    content: ReactNode;
  }) => (
    <div>
      {children}
      {content}
    </div>
  ),
  SidebarHeaderSelectTrigger: ({ avatar }: { avatar?: unknown }) => {
    captured.triggerAvatar = avatar;
    return null;
  },
}));
vi.mock('@/features/NavPanel/switcher/SwitcherMenu', () => ({
  default: ({ items }: { items: SwitcherItem[] }) => {
    captured.items = items;
    return null;
  },
}));
vi.mock('@/store/project', () => ({
  useLoadedProjectList: () => projects.value,
  useProjectStore: (selector: (s: unknown) => unknown) =>
    selector({
      useFetchProjectList: () => ({
        error: undefined,
        isHydrated: true,
        isValidating: false,
        revalidate: vi.fn(),
      }),
    }),
}));

describe('ProjectHeader', () => {
  beforeEach(() => {
    captured.items = [];
    captured.triggerAvatar = undefined;
    projects.value = [
      { avatar: null, id: 'p1', name: 'Foundry', slug: 'foundry', visibility: 'private' },
      { avatar: '🤯', id: 'p2', name: 'LobeHub', slug: 'lobehub', visibility: 'private' },
    ];
  });

  // A project without an image used to hand the switcher an undefined avatar, which
  // rendered as an empty tile.
  it('gives projects without an avatar the folder glyph in the switcher list', () => {
    render(<ProjectHeader />);

    expect(captured.items.map((item) => item.avatar)).toEqual(['📁', '🤯']);
  });

  it('shows the same folder glyph on the trigger for an avatar-less project', () => {
    render(<ProjectHeader project={{ avatar: null, id: 'p1', name: 'Foundry' } as any} />);

    expect(captured.triggerAvatar).toBe('📁');
  });

  it('keeps the project avatar on the trigger when one is set', () => {
    render(<ProjectHeader project={{ avatar: '🤯', id: 'p2', name: 'LobeHub' } as any} />);

    expect(captured.triggerAvatar).toBe('🤯');
  });
});
