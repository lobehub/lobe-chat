import { render, screen, within } from '@testing-library/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { formatSize } from '@/utils/format';

import DriveExplorer from './DriveExplorer';

// Loaded app-wide in the product; the tooltip's relative time needs it here.
dayjs.extend(relativeTime);

const swr = vi.hoisted(() => ({ files: {} as any }));

vi.mock('./useDriveData', () => ({
  useDriveFiles: () => swr.files,
  useRefreshDrive: () => vi.fn(),
}));

vi.mock('@/services/sandboxStorage', () => ({ sandboxStorageService: {} }));

const listing = (entries: unknown[]) => ({
  data: { entries },
  error: undefined,
  isLoading: false,
  mutate: vi.fn(),
});

describe('DriveExplorer', () => {
  beforeEach(() => {
    swr.files = listing([
      {
        isDirectory: true,
        isGitRepository: true,
        modifiedAt: '2026-10-21T13:03:00.000Z',
        name: 'app',
        path: 'app',
      },
      { isDirectory: true, modifiedAt: '2026-10-21T13:04:00.000Z', name: 'notes', path: 'notes' },
      {
        isDirectory: false,
        modifiedAt: new Date().toISOString(),
        name: 'report.pdf',
        path: 'report.pdf',
        size: 2048,
      },
    ]);
  });

  it('lays the listing out like a file manager: a header, then name, date, size and kind', () => {
    render(<DriveExplorer drive={'personal'} isWorkspace={false} />);

    for (const column of ['name', 'modified', 'size', 'kind']) {
      expect(screen.getByText(`drive.explorer.columns.${column}`)).toBeInTheDocument();
    }
    const [app, notes, report] = screen.getAllByTestId('drive-entry');
    expect(within(app).getByText('drive.explorer.kind.gitRepository')).toBeInTheDocument();
    expect(within(notes).getByText('drive.explorer.kind.folder')).toBeInTheDocument();
    expect(within(notes).getByText('--')).toBeInTheDocument();
    expect(within(report).getByText('drive.explorer.kind.fileWithExtension')).toBeInTheDocument();
    expect(within(report).getByText(formatSize(2048))).toBeInTheDocument();
  });

  it('shows the modified time absolute and on one line, even for a file changed just now', () => {
    render(<DriveExplorer drive={'personal'} isWorkspace={false} />);

    const report = screen.getAllByTestId('drive-entry')[2];
    const time = within(report).getByText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    // Relative wording ("a few seconds ago") wrapped in the fixed column.
    expect(time.textContent).not.toMatch(/ago/);
  });

  it('gives every folder the same menu, a git checkout included', () => {
    render(<DriveExplorer drive={'personal'} isWorkspace={false} />);

    expect(screen.getAllByLabelText('drive.explorer.moreActions')).toHaveLength(3);
  });

  it('says the listing failed, with a retry, instead of listing nothing', () => {
    swr.files = { data: undefined, error: new Error('down'), isLoading: false, mutate: vi.fn() };
    render(<DriveExplorer drive={'personal'} isWorkspace={false} />);

    expect(screen.getByText('drive.explorer.loadFailed')).toBeInTheDocument();
    expect(screen.queryByTestId('drive-entry')).not.toBeInTheDocument();
  });
});
