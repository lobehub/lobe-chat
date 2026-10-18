/**
 * @vitest-environment happy-dom
 */
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DocumentLikes from './index';

const mocks = vi.hoisted(() => ({ swr: vi.fn() }));

vi.mock('@/business/client/hooks/useActiveWorkspaceId', () => ({
  useActiveWorkspaceId: () => 'ws-1',
}));

vi.mock('@/libs/swr', () => ({ useClientDataSWR: mocks.swr }));

vi.mock('@/components/AsyncError', () => ({
  default: () => <div data-testid="likes-error" />,
}));

const trpcError = (code: string) => Object.assign(new Error(code), { data: { code } });

const cachedSummary = {
  likedByMe: false,
  recentLikers: [{ avatar: null, fullName: 'Creator', id: 'creator', username: 'creator' }],
  total: 3,
};

describe('DocumentLikes', () => {
  beforeEach(() => {
    mocks.swr.mockReset();
  });

  it('hides the cached count once the page went private (FORBIDDEN)', () => {
    // SWR keeps the last summary next to the revalidation error.
    mocks.swr.mockReturnValue({
      data: cachedSummary,
      error: trpcError('FORBIDDEN'),
      isLoading: false,
      mutate: vi.fn(),
    });

    const { container } = render(<DocumentLikes documentId="doc-1" />);

    expect(container.querySelector('[data-document-likes]')).toBeNull();
  });

  it('keeps the retryable error for a transient initial failure', () => {
    mocks.swr.mockReturnValue({
      data: undefined,
      error: trpcError('INTERNAL_SERVER_ERROR'),
      isLoading: false,
      mutate: vi.fn(),
    });

    const { getByTestId } = render(<DocumentLikes documentId="doc-1" />);

    expect(getByTestId('likes-error')).toBeTruthy();
  });
});
