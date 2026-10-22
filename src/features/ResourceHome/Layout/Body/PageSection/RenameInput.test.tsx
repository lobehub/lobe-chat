/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RenameInput from './RenameInput';

const renamePage = vi.hoisted(() => vi.fn(async () => {}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/store/page', () => ({
  pageActions: { renamePage },
}));

const now = { value: 1000 };

describe('Docs page rename field', () => {
  beforeEach(() => {
    renamePage.mockClear();
    vi.spyOn(performance, 'now').mockImplementation(() => now.value);
  });

  it('keeps the field when the row menu hands focus back right after mount', () => {
    const onDone = vi.fn();
    now.value = 1000;
    render(<RenameInput id={'page-1'} title={'Weekly report'} onDone={onDone} />);

    const input = screen.getByTestId('page-rename-input');

    // The menu unmounts and re-focuses its trigger ~300ms later. Committing here
    // would close the field before the user can type into it.
    now.value = 1300;
    fireEvent.blur(input);

    expect(onDone).not.toHaveBeenCalled();
    expect(renamePage).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it('commits the typed title once the field has actually been used', async () => {
    const onDone = vi.fn();
    now.value = 1000;
    render(<RenameInput id={'page-1'} title={'Weekly report'} onDone={onDone} />);

    const input = screen.getByTestId('page-rename-input');
    fireEvent.change(input, { target: { value: 'Renamed report' } });

    now.value = 2000;
    fireEvent.blur(input);

    expect(renamePage).toHaveBeenCalledWith('page-1', 'Renamed report');
    await vi.waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it('does not write when the title is unchanged', async () => {
    const onDone = vi.fn();
    now.value = 1000;
    render(<RenameInput id={'page-1'} title={'Weekly report'} onDone={onDone} />);

    now.value = 2000;
    fireEvent.blur(screen.getByTestId('page-rename-input'));

    expect(renamePage).not.toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });
});
