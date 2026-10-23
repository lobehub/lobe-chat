/**
 * @vitest-environment happy-dom
 */
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DecisionOptionTree from './DecisionOptionTree';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const options = [
  { description: 'Smallest maintenance surface', id: 'a', label: 'Adopt electron-updater' },
  { id: 'b', label: 'Build a custom channel server' },
];

describe('DecisionOptionTree', () => {
  it('marks the picked option and hangs the note off it', () => {
    render(
      <DecisionOptionTree
        chosenId={'b'}
        note={'only if we need targeting'}
        options={options}
        recommendedId={'a'}
      />,
    );

    const [first, second] = screen.getAllByRole('listitem');

    expect(within(first).getByText('goalProcess.decisions.recommended')).toBeTruthy();
    expect(within(first).queryByText('goalProcess.decisions.chosen')).toBeNull();
    expect(within(first).queryByText('only if we need targeting')).toBeNull();
    expect(within(second).getByText('goalProcess.decisions.chosen')).toBeTruthy();
    expect(within(second).getByText('only if we need targeting')).toBeTruthy();
  });

  it('shows every option neutral while the question is still open', () => {
    render(<DecisionOptionTree options={options} recommendedId={'a'} />);

    expect(screen.queryByText('goalProcess.decisions.chosen')).toBeNull();
    expect(screen.getByText('Smallest maintenance surface')).toBeTruthy();
  });

  it('ignores a picked id that is not among the options', () => {
    render(<DecisionOptionTree chosenId={'gone'} options={options} />);

    expect(screen.queryByText('goalProcess.decisions.chosen')).toBeNull();
  });
});
