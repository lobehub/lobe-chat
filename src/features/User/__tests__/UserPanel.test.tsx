import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Activity } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { NavPanelHomeActiveProvider } from '@/features/NavPanel/NavPanelHomeActiveContext';

import UserPanel from '../UserPanel';

vi.mock('../UserPanel/PanelContent', () => ({
  default: () => <div>panel-content</div>,
}));

vi.mock('../UserPanel/PanelContentSkeleton', () => ({
  default: () => null,
}));

vi.mock('../UserPanel/useNewVersion', () => ({
  useNewVersion: () => false,
}));

interface HarnessProps {
  active: boolean;
}

const Harness = ({ active }: HarnessProps) => (
  <NavPanelHomeActiveProvider value={active}>
    <Activity mode={active ? 'visible' : 'hidden'} name={'NavPanelHome'}>
      <UserPanel>
        <button type={'button'}>open-panel</button>
      </UserPanel>
    </Activity>
  </NavPanelHomeActiveProvider>
);

// Regression test for lobehub#21190: the personal-info popover stayed on screen
// (and outside clicks stopped closing it) after navigating from one of its rows,
// because the nav panel hides this layer with `<Activity mode="hidden">`.
// facebook/react#35000 is the same failure at the React level, fixed in
// facebook/react#35091 (React 19.3.0); the repo is still on React 19.2.
describe('UserPanel', () => {
  it('closes the portaled popover when the nav panel home layer is hidden', async () => {
    const { rerender } = render(<Harness active />);

    await userEvent.click(screen.getByRole('button', { name: 'open-panel' }));
    expect(screen.getByText('panel-content')).toBeInTheDocument();

    rerender(<Harness active={false} />);

    expect(screen.queryByText('panel-content')).not.toBeInTheDocument();
  });

  it('does not reopen the popover when returning to the nav panel home layer', async () => {
    const { rerender } = render(<Harness active />);

    await userEvent.click(screen.getByRole('button', { name: 'open-panel' }));
    rerender(<Harness active={false} />);
    rerender(<Harness active />);

    expect(screen.queryByText('panel-content')).not.toBeInTheDocument();
  });

  it('keeps the trigger mounted while the nav panel home layer is hidden', () => {
    render(<Harness active={false} />);

    expect(screen.getByText('open-panel')).toBeInTheDocument();
  });
});
