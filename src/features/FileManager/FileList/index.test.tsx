/**
 * @vitest-environment happy-dom
 */
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';

import FileList from './index';

// Mock unzipFile utility BEFORE any other imports
vi.mock('@/utils/unzipFile', () => ({
  unzipFile: vi.fn(),
}));

// Mock stores
vi.mock('@/store/file', () => ({
  useFileStore: vi.fn(),
  fileManagerSelectors: {},
}));

vi.mock('@/store/global', () => ({
  useGlobalStore: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock virtuoso components
vi.mock('react-virtuoso', () => ({
  Virtuoso: ({
    data,
    itemContent,
  }: {
    data: any[];
    itemContent: (index: number, item: any) => any;
  }) => (
    <div data-testid="virtuoso-list">
      {data.map((item, index) => (
        <div key={item.id}>{itemContent(index, item)}</div>
      ))}
    </div>
  ),
}));

vi.mock('@virtuoso.dev/masonry', () => ({
  VirtuosoMasonry: () => <div data-testid="masonry-list" />,
}));

const mockFileData = [
  {
    id: 'file-1',
    name: 'test1.pdf',
    fileType: 'application/pdf',
    size: 1024,
    createdAt: new Date('2025-01-01'),
    chunkCount: 0,
    chunkingStatus: null,
    embeddingStatus: null,
    finishEmbedding: false,
  },
  {
    id: 'file-2',
    name: 'test2.pdf',
    fileType: 'application/pdf',
    size: 2048,
    createdAt: new Date('2025-01-02'),
    chunkCount: 0,
    chunkingStatus: null,
    embeddingStatus: null,
    finishEmbedding: false,
  },
  {
    id: 'file-3',
    name: 'test3.pdf',
    fileType: 'application/pdf',
    size: 3072,
    createdAt: new Date('2025-01-03'),
    chunkCount: 0,
    chunkingStatus: null,
    embeddingStatus: null,
    finishEmbedding: false,
  },
  {
    id: 'file-4',
    name: 'test4.pdf',
    fileType: 'application/pdf',
    size: 4096,
    createdAt: new Date('2025-01-04'),
    chunkCount: 0,
    chunkingStatus: null,
    embeddingStatus: null,
    finishEmbedding: false,
  },
  {
    id: 'file-5',
    name: 'test5.pdf',
    fileType: 'application/pdf',
    size: 5120,
    createdAt: new Date('2025-01-05'),
    chunkCount: 0,
    chunkingStatus: null,
    embeddingStatus: null,
    finishEmbedding: false,
  },
];

describe('<FileList /> - Shift+Click Range Selection', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup file store mock
    (useFileStore as any).mockReturnValue({
      useFetchFileManage: () => ({
        data: mockFileData,
        isLoading: false,
      }),
    });

    // Setup global store mock
    (useGlobalStore as any).mockReturnValue({
      status: { fileManagerViewMode: 'list' },
      updateSystemStatus: vi.fn(),
    });
  });

  it('should select a single file when clicking without shift key', async () => {
    render(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    });

    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(firstCheckbox);

    await waitFor(() => {
      expect(firstCheckbox).toBeChecked();
    });
  });

  it('should select range of files when shift+clicking after initial selection', async () => {
    render(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Select first file
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
    });

    // Shift+click on third file
    await user.keyboard('{Shift>}');
    await user.click(checkboxes[2]);
    await user.keyboard('{/Shift}');

    // Files 1, 2, and 3 should be selected
    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();
    });
  });

  it('should select range in reverse order when shift+clicking above initial selection', async () => {
    render(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Select third file
    await user.click(checkboxes[2]);

    await waitFor(() => {
      expect(checkboxes[2]).toBeChecked();
    });

    // Shift+click on first file
    await user.keyboard('{Shift>}');
    await user.click(checkboxes[0]);
    await user.keyboard('{/Shift}');

    // Files 1, 2, and 3 should be selected
    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();
    });
  });

  it('should select large range when shift+clicking distant files', async () => {
    render(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Select first file
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
    });

    // Shift+click on last file
    await user.keyboard('{Shift>}');
    await user.click(checkboxes[4]);
    await user.keyboard('{/Shift}');

    // All files should be selected
    await waitFor(() => {
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  it('should preserve existing selections when shift+clicking', async () => {
    render(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Select first file
    await user.click(checkboxes[0]);

    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
    });

    // Select third file without shift
    await user.click(checkboxes[2]);

    await waitFor(() => {
      expect(checkboxes[2]).toBeChecked();
    });

    // Shift+click on fifth file
    await user.keyboard('{Shift>}');
    await user.click(checkboxes[4]);
    await user.keyboard('{/Shift}');

    // First file should still be selected, plus range from third to fifth
    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).toBeChecked();
      expect(checkboxes[4]).toBeChecked();
    });
  });

  it('should not perform range selection when shift+clicking without any prior selection', async () => {
    render(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Shift+click on third file without any prior selection
    await user.keyboard('{Shift>}');
    await user.click(checkboxes[2]);
    await user.keyboard('{/Shift}');

    // Only the clicked file should be selected
    await waitFor(() => {
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
      expect(checkboxes[2]).toBeChecked();
      expect(checkboxes[3]).not.toBeChecked();
      expect(checkboxes[4]).not.toBeChecked();
    });
  });

  it('should update last selected index after each selection', async () => {
    render(<FileList />);

    await waitFor(() => {
      expect(screen.getByText('test1.pdf')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Select first file
    await user.click(checkboxes[0]);

    // Shift+click on third file
    await user.keyboard('{Shift>}');
    await user.click(checkboxes[2]);
    await user.keyboard('{/Shift}');

    // Now shift+click on fifth file - should select from third to fifth
    await user.keyboard('{Shift>}');
    await user.click(checkboxes[4]);
    await user.keyboard('{/Shift}');

    await waitFor(() => {
      // All files should be selected
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });
  });
});
