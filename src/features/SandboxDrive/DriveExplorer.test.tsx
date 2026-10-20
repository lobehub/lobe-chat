import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DriveExplorer from './DriveExplorer';

const swr = vi.hoisted(() => ({ directories: {} as any, files: {} as any }));

vi.mock('./useDriveData', () => ({
  useDriveDirectories: () => swr.directories,
  useDriveFiles: () => swr.files,
  useRefreshDrive: () => vi.fn(),
}));

vi.mock('@/services/sandboxStorage', () => ({ sandboxStorageService: {} }));

const listed = {
  data: { entries: [{ isDirectory: true, name: 'app', path: 'app' }] },
  error: undefined,
  isLoading: false,
  mutate: vi.fn(),
};

describe('DriveExplorer', () => {
  beforeEach(() => {
    swr.files = listed;
  });

  it('should not list root folders, with their rename and delete, until the environment directories are known', () => {
    // Until then an environment directory would read as a plain folder.
    swr.directories = { data: undefined, error: undefined, isLoading: true, mutate: vi.fn() };
    render(<DriveExplorer drive={'personal'} isWorkspace={false} />);

    expect(screen.queryByTestId('drive-entry')).not.toBeInTheDocument();
  });

  it('should fail the root listing when the environment directories cannot be read', () => {
    swr.directories = {
      data: undefined,
      error: new Error('instances unavailable'),
      isLoading: false,
      mutate: vi.fn(),
    };
    render(<DriveExplorer drive={'personal'} isWorkspace={false} />);

    expect(screen.getByText('drive.explorer.loadFailed')).toBeInTheDocument();
    expect(screen.queryByTestId('drive-entry')).not.toBeInTheDocument();
  });

  it('should list the root once both are known', () => {
    swr.directories = {
      data: { instances: [] },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    };
    render(<DriveExplorer drive={'personal'} isWorkspace={false} />);

    expect(screen.getAllByTestId('drive-entry')).toHaveLength(1);
  });
});
