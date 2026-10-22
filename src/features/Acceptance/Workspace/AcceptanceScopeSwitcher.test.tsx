import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AcceptanceScopeSwitcher from './AcceptanceScopeSwitcher';

const mocks = vi.hoisted(() => ({
  active: undefined as { id: string; name: string } | undefined,
  workspaces: [] as { avatar?: string; id: string; name: string; slug: string }[],
}));

vi.mock('@/business/client/hooks/useWorkspaces', () => ({ useWorkspaces: () => mocks.workspaces }));
vi.mock('@/business/client/hooks/useActiveWorkspace', () => ({
  useActiveWorkspace: () => mocks.active,
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const renderSwitcher = () =>
  render(
    <MemoryRouter>
      <AcceptanceScopeSwitcher />
    </MemoryRouter>,
  );

describe('AcceptanceScopeSwitcher', () => {
  beforeEach(() => {
    mocks.active = undefined;
    mocks.workspaces = [];
  });

  it('renders nothing for a user without workspaces', () => {
    const { container } = renderSwitcher();

    expect(container).toBeEmptyDOMElement();
  });

  it('is a native, keyboard-focusable button naming the active scope', () => {
    mocks.workspaces = [{ id: 'ws_1', name: 'Lobe Team', slug: 'lobe-team' }];
    mocks.active = { id: 'ws_1', name: 'Lobe Team' };
    renderSwitcher();

    const trigger = screen.getByRole('button', { name: 'acceptance.workspace.scope.switch' });
    expect(trigger.tagName).toBe('BUTTON');
    trigger.focus();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent('Lobe Team');
  });
});
